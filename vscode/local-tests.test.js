const test = require('node:test');
const assert = require('node:assert/strict');
const { runLocalTests } = require('./local-tests');

test('compiles once and compares exact output, normalizing CRLF only', async () => {
  const result = await runLocalTests('#include <stdio.h>\nint main(void){int x; if(scanf("%d", &x)==1) printf("%d\\n", x*2); return 0;}', [
    {input:'4\n', expected:'8\r\n'}, {input:'3\n', expected:'6'},
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.passed, 1);
  assert.deepEqual(result.results.map(x => x.status), ['passed', 'wrong-answer']);
  assert.equal(result.results[1].actual, '6\n');
});

test('reports compilation failure and missing compiler', async () => {
  const invalid = await runLocalTests('not valid C', [{input:'', expected:''}]);
  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /Kompajliranje/);
  assert.ok(invalid.details);
  const missing = await runLocalTests('int main(void){return 0;}', [{input:'', expected:''}], {compiler:'edgar-no-such-compiler-987654'});
  assert.equal(missing.ok, false);
  assert.match(missing.error, /gcc nije pronađen/);
});

test('reports runtime errors and timeouts', async () => {
  const crash = await runLocalTests('int main(void){return 2;}', [{input:'', expected:''}]);
  assert.equal(crash.results[0].status, 'runtime-error');
  assert.equal(crash.results[0].exitCode, 2);
  const infinite = await runLocalTests('int main(void){for (;;) {} }', [{input:'', expected:''}]);
  assert.equal(infinite.results[0].status, 'timeout');
});

test('rejects malformed or oversized test data', async () => {
  assert.equal((await runLocalTests('', [{input:'', expected:1}])).ok, false);
  assert.equal((await runLocalTests('', [])).ok, false);
  assert.equal((await runLocalTests('x'.repeat(1024 * 1024 + 1), [{input:'', expected:''}])).ok, false);
});

test('stops programs producing too much output', async () => {
  const result = await runLocalTests('#include <stdio.h>\nint main(void){for (;;) puts("abcdefghijklmnop");}', [{input:'', expected:''}]);
  assert.equal(result.results[0].status, 'output-limit');
});
