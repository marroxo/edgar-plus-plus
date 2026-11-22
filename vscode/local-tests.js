const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

const MAX_SOURCE = 1024 * 1024;
const MAX_CASES = 100;
const MAX_CASE_BYTES = 256 * 1024;
const MAX_OUTPUT = 256 * 1024;
const COMPILE_TIMEOUT = 15000;
const RUN_TIMEOUT = 3000;
const normalize = value => value.replace(/\r\n/g, '\n');

function execute(command, args, { cwd, input = '', timeout, maxOutput = MAX_OUTPUT }) {
  return new Promise(resolve => {
    let child, reason, out = [], err = [], outBytes = 0, errBytes = 0, timer, fallback, settled = false;
    const finish = (code, signal, spawnError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer); clearTimeout(fallback);
      resolve({ code, signal, reason, spawnError, stdout: Buffer.concat(out).toString('utf8'), stderr: Buffer.concat(err).toString('utf8') });
    };
    const stop = why => {
      if (reason) return;
      reason = why;
      child.kill();
      // A descendant may keep inherited pipes open; do not wait indefinitely for close.
      fallback = setTimeout(() => finish(null, null), 1000);
    };
    try { child = spawn(command, args, { cwd, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { finish(null, null, e); return; }
    child.on('error', e => finish(null, null, e));
    child.on('close', (code, signal) => finish(code, signal));
    const collect = (chunks, isError) => chunk => {
      if (settled) return;
      if (isError) errBytes += chunk.length; else outBytes += chunk.length;
      if (outBytes + errBytes > maxOutput) { stop('output-limit'); return; }
      chunks.push(chunk);
    };
    child.stdout.on('data', collect(out, false));
    child.stderr.on('data', collect(err, true));
    child.stdin.on('error', () => {});
    child.stdin.end(input, 'utf8');
    timer = setTimeout(() => stop('timeout'), timeout);
  });
}

async function runLocalTests(source, tests, options = {}) {
  if (typeof source !== 'string' || Buffer.byteLength(source) > MAX_SOURCE || !Array.isArray(tests) || !tests.length || tests.length > MAX_CASES || tests.some(t => !t || typeof t.input !== 'string' || typeof t.expected !== 'string' || Buffer.byteLength(t.input) > MAX_CASE_BYTES || Buffer.byteLength(t.expected) > MAX_CASE_BYTES)) {
    return { ok: false, error: 'Neispravni ili preveliki podaci za provjeru.', results: [], passed: 0, total: 0 };
  }
  let directory;
  try {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'edgar-test-'));
    const file = path.join(directory, 'program.c');
    const executable = path.join(directory, process.platform === 'win32' ? 'program.exe' : 'program');
    await fs.writeFile(file, source, 'utf8');
    const compiled = await execute(options.compiler || 'gcc', [file, '-o', executable], { cwd: directory, timeout: COMPILE_TIMEOUT });
    if (compiled.spawnError) return { ok: false, error: compiled.spawnError.code === 'ENOENT' ? 'Kompajler gcc nije pronađen.' : `Kompajler nije moguće pokrenuti: ${compiled.spawnError.message}`, results: [], passed: 0, total: tests.length };
    if (compiled.reason || compiled.code !== 0) return { ok: false, error: compiled.reason === 'timeout' ? 'Kompajliranje je predugo trajalo.' : compiled.reason === 'output-limit' ? 'Ispis kompajlera je prevelik.' : 'Kompajliranje nije uspjelo.', details: compiled.stderr, results: [], passed: 0, total: tests.length };
    const results = [];
    for (const test of tests) {
      const run = await execute(executable, [], { cwd: directory, input: test.input, timeout: RUN_TIMEOUT });
      const actual = normalize(run.stdout), expected = normalize(test.expected);
      const status = run.reason || (run.spawnError || run.code !== 0 ? 'runtime-error' : actual === expected ? 'passed' : 'wrong-answer');
      results.push({ passed: status === 'passed', status, actual, expected, stderr: normalize(run.stderr), exitCode: run.code });
    }
    return { ok: true, results, passed: results.filter(r => r.passed).length, total: tests.length };
  } catch (e) {
    return { ok: false, error: `Lokalna provjera nije uspjela: ${e.message}`, results: [], passed: 0, total: tests.length };
  } finally {
    if (directory) await fs.rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }).catch(() => {});
  }
}

module.exports = { runLocalTests };
