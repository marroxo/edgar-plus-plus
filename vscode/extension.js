const vscode = require('vscode');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
let server, connection, pendingConnect = false, workspaceState;
const originPattern = /^moz-extension:\/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const maxBodyBytes = 1024 * 1024;
const taskPrefix = 'edgar.task.';
const normalizedText = text => text.replace(/\r\n/g, '\n');
const textHash = text => crypto.createHash('sha256').update(normalizedText(text)).digest('hex');

function fileNameFor(title, question, key = title) {
  if (typeof title !== 'string' || !/^\d{1,3}$/.test(String(question)) || Number(question) < 1) throw Error('Naslov ispita ili broj zadatka nije prepoznat.');
  const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g,'dj');
  const genericName = () => {
    const label = normalized.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'edgar';
    const id = crypto.createHash('sha256').update(String(key)).digest('hex').slice(0,12);
    return `${label}-${id}-zadatak-${Number(question)}.c`;
  };
  const explicit = normalized.match(/\b(mi|zi)(\d{4})([ab])\b/);
  if (explicit) return `${explicit[1].toUpperCase()}${explicit[2]}${explicit[3].toUpperCase()}${Number(question)}.c`;
  const year = normalized.match(/\b(20\d{2}|\d{2})\s*[\/-]\s*(20\d{2}|\d{2})\b/);
  const prefix = /meduispit|medjuispit|\bmi\b/.test(normalized) ? 'MI' : /zavrsni\s+ispit|\bzi\b/.test(normalized) ? 'ZI' : null;
  if (!prefix || !year) return genericName();
  const first = Number(year[1]) % 100, second = Number(year[2]) % 100;
  if ((first + 1) % 100 !== second) return genericName();
  const term = /\b(drugi|2\.?)[\s-]+termin\b/.test(normalized) ? 'B' : /\b(prvi|1\.?)[\s-]+termin\b/.test(normalized) ? 'A' : null;
  if (!term) return genericName();
  return `${prefix}${String(first).padStart(2, '0')}${String(second).padStart(2, '0')}${term}${Number(question)}.c`;
}
function connectedDocument(session) {
  return session && vscode.workspace.textDocuments.find(d => d.uri.toString() === session.documentUri && !d.isClosed);
}
function state(session = connection) {
  const doc = connectedDocument(session);
  return doc && {text:normalizedText(doc.getText()), version:doc.version, runId:session.runId, fileName:path.basename(doc.fileName), questionKey:session.questionKey};
}
function stop() {
  if (server) server.close();
  server = undefined;
  connection = undefined;
}
function reply(res, status, value) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});
  res.end(JSON.stringify(value));
}
async function connect(payload, origin) {
  if (!payload || typeof payload.text !== 'string' || typeof payload.questionKey !== 'string' || !payload.questionKey.trim() || payload.questionKey.length > 2000 || typeof payload.title !== 'string' || payload.title.length > 1000) throw Error('Neispravni podaci zadatka.');
  const browserText = normalizedText(payload.text);
  const baseFileName = fileNameFor(payload.title, payload.question, payload.questionKey);
  const folder = vscode.workspace.workspaceFolders?.find(f => f.uri.scheme === 'file');
  if (!folder) throw Error('Najprije otvori lokalnu mapu u VS Codeu.');
  const root = folder.uri.fsPath, preferred = path.join(root, '00 - Moji programi');
  let directory = path.join(root, 'Edgar');
  try { if ((await fs.stat(preferred)).isDirectory()) directory = preferred; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const realRoot = await fs.realpath(root);
  await fs.mkdir(directory, {recursive:true});
  const realDirectory = await fs.realpath(directory), relative = path.relative(realRoot, realDirectory);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw Error('Mapa za Edgar mora biti unutar radne mape.');
  let target, doc, fileName;
  const parsed = path.parse(baseFileName);
  const examId = payload.title.match(/\((\d+)\)\s*$/);
  const identity = examId ? `exam:${examId[1]}:question:${Number(payload.question)}` : payload.questionKey;
  const taskId = crypto.createHash('sha256').update(identity).digest('hex');
  const storageKey = taskPrefix + taskId;
  const saved = savedTask(workspaceState?.get(storageKey));
  const claimed = new Set((workspaceState?.keys?.() || [])
    .filter(key => key.startsWith(taskPrefix) && key !== storageKey)
    .map(key => savedTask(workspaceState.get(key)).fileName?.toLowerCase()));
  const isTaskFile = file => file.toLowerCase() === baseFileName.toLowerCase()
    || (file.toLowerCase().startsWith(parsed.name.toLowerCase() + '_') && /^\d+\.c$/i.test(file.slice(parsed.name.length + 1)));
  const openCandidate = async name => {
    if (typeof name !== 'string' || !/^[a-z0-9-]+(?:_\d+)?\.c$/i.test(name) || claimed.has(name.toLowerCase())) return;
    const file = path.join(realDirectory, name);
    try {
      const stat = await fs.lstat(file);
      if (stat.isFile() && !stat.isSymbolicLink()) return vscode.workspace.openTextDocument(vscode.Uri.file(file));
    } catch (e) { if (e.code !== 'ENOENT') throw e; }
  };
  doc = await openCandidate(saved.fileName);
  if (!doc) {
    const names = (await fs.readdir(realDirectory)).filter(isTaskFile)
      .sort((a, b) => a.localeCompare(b, undefined, {numeric:true}));
    const canonical = names.find(name => name.toLowerCase() === baseFileName.toLowerCase());
    const original = await openCandidate(canonical);
    const alternatives = [];
    for (const name of names) {
      if (name === canonical) continue;
      const candidate = await openCandidate(name);
      if (candidate) alternatives.push(candidate);
    }
    doc = original || alternatives.find(candidate => normalizedText(candidate.getText()) === browserText);
    if (!doc && alternatives.length === 1) doc = alternatives[0];
    if (!doc && alternatives.length > 1) {
      return {conflict:true,error:`U mapi je više starih kopija zadatka. Ostavi jednu kopiju pod nazivom ${baseFileName} i ponovno spoji.`};
    }
  }
  if (!doc) {
    for(let index=0;index<10000;index++){
      fileName=index===0?baseFileName:`${parsed.name}_${index}${parsed.ext}`;
      if (claimed.has(fileName.toLowerCase())) continue;
      target=path.join(realDirectory,fileName);
      try{await fs.writeFile(target,browserText,{flag:'wx',encoding:'utf8'});doc=await vscode.workspace.openTextDocument(vscode.Uri.file(target));break;}catch(e){if(e.code!=='EEXIST')throw e;}
    }
  }
  if (!doc) throw Error('Nije pronađeno slobodno ime datoteke.');
  await vscode.window.showTextDocument(doc, {preview:false});
  const chosenName = path.basename(doc.fileName);
  // Reconnecting an existing task always starts with its current VS Code contents.
  const sharedText = normalizedText(doc.getText());
  await workspaceState?.update(storageKey, {fileName:chosenName, hash:textHash(sharedText)});
  const sameConnection = connection?.documentUri === doc.uri.toString() && connection.questionKey === payload.questionKey && connection.origin === origin;
  connection = {
    documentUri:doc.uri.toString(), questionKey:payload.questionKey, origin, storageKey,
    token:sameConnection ? connection.token : crypto.randomBytes(32).toString('hex'), runId:0
  };
  return {...state(), token:connection.token, updatePage:sharedText !== browserText};
}

function savedTask(record) {
  if (typeof record === 'string') return {fileName:record};
  return record && typeof record.fileName === 'string' ? record : {};
}

function replaceDocument(editor, doc, text) {
  const range = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
  return editor.edit(edit => edit.replace(range, text), {undoStopBefore:true, undoStopAfter:true});
}
async function handle(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers.origin;
  if (!originPattern.test(origin || '') || req.headers.host !== '127.0.0.1:43187') return reply(res,403,{error:'Nedopušten izvor zahtjeva.'});
  res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS' && ['/state', '/connect', '/edit', '/format', '/ack'].includes(req.url)) {
    const method = req.url === '/state' ? 'GET' : 'POST';
    const requested = String(req.headers['access-control-request-headers'] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (req.headers['access-control-request-method'] !== method || requested.some(h => !['authorization','content-type'].includes(h))) return reply(res,403,{error:'Nedopušten zahtjev.'});
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.setHeader('Access-Control-Allow-Methods', method);
    res.writeHead(204).end(); return;
  }
  const session = connection;
  const authorized = session && origin === session.origin && req.headers.authorization === `Bearer ${session.token}`;
  if (req.method === 'GET' && req.url === '/state') {
    if (!authorized) return reply(res,403,{error:'Povezivanje nije autorizirano.'});
    const current = state(session);
    return reply(res,current ? 200 : 410,current || {error:'Povezana datoteka je zatvorena.'});
  }
  if (req.method === 'POST' && ['/format', '/edit', '/ack'].includes(req.url)) {
    if (!authorized) return reply(res,403,{error:'Povezivanje nije autorizirano.'});
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) return reply(res,403,{error:'Nedopušten zahtjev.'});
    try {
      const chunks=[]; let length=0;
      for await(const chunk of req){length+=chunk.length;if(length>maxBodyBytes)return reply(res,413,{error:'Zahtjev je prevelik.'});chunks.push(chunk);}
      const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const doc = connectedDocument(session);
      if(!doc || !Number.isInteger(body?.version))return reply(res,400,{error:'Datoteka nije dostupna.'});
      const current = () => session === connection && !doc.isClosed && doc.version === body.version;
      const conflict = () => reply(res,409,{error:'Veza ili kod u VS Codeu promijenili su se tijekom prijenosa.'});
      if (!current()) return conflict();
      if (req.url === '/ack') {
        const fileName = path.basename(doc.fileName), hash = textHash(doc.getText());
        await workspaceState?.update(session.storageKey, {fileName,hash});
        return reply(res,200,{ok:true});
      }
      if (req.url === '/edit' && typeof body.text !== 'string') return reply(res,400,{error:'Kod nije poslan.'});
      const editor=vscode.window.visibleTextEditors.find(e=>e.document===doc) || await vscode.window.showTextDocument(doc,{preserveFocus:true,preview:false});
      if (!current()) return conflict();
      if (req.url === '/edit') {
        const text = normalizedText(body.text);
        if (!await replaceDocument(editor, doc, text) || normalizedText(doc.getText()) !== text) return conflict();
      } else {
        const edits=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider',doc.uri,{tabSize:Number(editor.options.tabSize)||4,insertSpaces:editor.options.insertSpaces!==false});
        if(!edits)return reply(res,400,{error:'U VS Codeu nema dostupnog formattera za C.'});
        if (!current()) return conflict();
        if (edits.length && !await editor.edit(builder=>{
          for(const edit of edits) builder.replace(edit.range,edit.newText);
        },{undoStopBefore:true,undoStopAfter:true})) return conflict();
      }
      if (session !== connection || doc.isClosed) return conflict();
      return reply(res,200,{ok:true,...state(session)});
    } catch(e){return reply(res,400,{error:e.message});}
  }
  if (req.method !== 'POST' || req.url !== '/connect' || !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) return reply(res,403,{error:'Nedopušten zahtjev.'});
  if (pendingConnect) return reply(res,409,{error:'Spajanje je već u tijeku. Pokušaj ponovno.'});
  pendingConnect = true;
  try {
    const chunks = []; let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > maxBodyBytes) { reply(res,413,{error:'Kod je prevelik.'}); return; }
      chunks.push(chunk);
    }
    const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const result = await connect(payload, origin);
    reply(res,result.conflict ? 409 : 200,{ok:!result.conflict,...result});
  } catch (e) { if (!res.headersSent) reply(res,400,{ok:false,error:e.message}); }
  finally { pendingConnect = false; }
}
function start() {
  if (server) return;
  const instance = http.createServer((req,res) => { handle(req,res).catch(() => { if (!res.headersSent) reply(res,500,{error:'Povezivanje nije uspjelo.'}); }); });
  instance.requestTimeout = 10000; instance.headersTimeout = 10000; instance.maxConnections = 8;
  instance.on('error', e => { if (server === instance) { stop(); vscode.window.showErrorMessage(`Edgar: ${e.message}`); } });
  server = instance; instance.listen(43187, '127.0.0.1');
}
function activate(context) {
  workspaceState=context.workspaceState;
  context.subscriptions.push(vscode.commands.registerCommand('edgar.localTests', () => require('./local-panel').openLocalTests(context)));
  context.subscriptions.push(vscode.commands.registerCommand('edgar.start',start));
  context.subscriptions.push(vscode.commands.registerCommand('edgar.stop',() => {stop(); vscode.window.showInformationMessage('Edgar: povezivanje je isključeno.');}));
  context.subscriptions.push(vscode.commands.registerCommand('edgar.run',() => {
    if (!server || !state()) return vscode.window.showWarningMessage('Najprije spoji zadatak iz Edgara.');
    if (vscode.window.activeTextEditor?.document.uri.toString() !== connection.documentUri) return vscode.window.showWarningMessage('Najprije otvori povezanu datoteku zadatka.');
    connection.runId++;
  }));
  context.subscriptions.push({dispose:stop}); start();
}
exports.activate = activate;
exports.deactivate = stop;
