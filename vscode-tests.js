const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {Readable} = require('node:stream');

(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'edgar-extension-test-'));
  const docs = [], commands = new Map(); let listening = false, warningCount = 0;
  const vscode = {
    workspace:{workspaceFolders:[{uri:{scheme:'file',fsPath:root}}],textDocuments:docs,
      openTextDocument:async uri => {
        let doc = docs.find(d => d.uri.toString() === uri.toString());
        if (!doc) { const initial = await fs.readFile(uri.fsPath,'utf8'); doc={uri,fileName:uri.fsPath,version:1,text:initial,getText(){return this.text},positionAt:i=>i}; docs.push(doc); }
        return doc;
      }},
    Uri:{file:fsPath=>({fsPath,toString:()=>fsPath})}, Range:class {constructor(start,end){this.start=start;this.end=end;}},
    commands:{registerCommand:(name,fn)=>{commands.set(name,fn);return {dispose(){}};},executeCommand:async()=>[{range:{},newText:'formatirano'}]},
    window:{visibleTextEditors:[],showTextDocument:async doc=>{const editor={document:doc,options:{tabSize:4,insertSpaces:true},edit:async cb=>{cb({replace:(range,text)=>{doc.text=text;doc.version++}});return true;}};vscode.window.activeTextEditor=editor;vscode.window.visibleTextEditors=[editor];return editor;},showErrorMessage(){},showWarningMessage(){warningCount++;},showInformationMessage(){}}
  };
  const mockHttp = {createServer:()=>({on(){},listen(port,host){assert.equal(port,43187);assert.equal(host,'127.0.0.1');listening=true;},close(){listening=false;}})};
  const context={require:name=>name==='vscode'?vscode:name==='http'?mockHttp:require(name),exports:{},Buffer};
  const source=await fs.readFile(path.join(__dirname,'vscode/extension.js'),'utf8');
  vm.runInNewContext(source+'\nexports.test={fileNameFor,handle};',context);
  const {fileNameFor,handle}=context.exports.test;
  const origin='moz-extension://12345678-1234-1234-1234-123456789abc';
  const title='Vježba: Međuispit 2024/25 - drugi termin (573133)';
  async function request(method,url,body,extra={}) {
    const req=Readable.from(body===undefined?[]:[Buffer.from(typeof body==='string'?body:JSON.stringify(body))]);
    req.method=method;req.url=url;req.headers={origin,host:'127.0.0.1:43187','content-type':'application/json',...extra};
    let data;const res={headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status){this.status=status;this.headersSent=true;return this;},end(value){data=value;}};
    await handle(req,res);return {status:res.status,body:data?JSON.parse(data):undefined,headers:res.headers};
  }
  try {
    assert.equal(fileNameFor(title,'2'),'MI2425B2.c');
    assert.equal(fileNameFor('Vježba: ZAVRŠNI ISPIT 2024/2025 - PRVI TERMIN (571300)','1'),'ZI2425A1.c');
    assert.equal(fileNameFor('MI2425B','3'),'MI2425B3.c');
    const generic=fileNameFor('Vježba ../CON: nešto? (99)','1','q99');
    assert.match(generic,/^[a-z0-9-]+\.c$/);assert.notEqual(generic,fileNameFor('Vježba ../CON: nešto? (99)','1','q100'));
    const persisted=new Map(); const workspaceState={get:key=>persisted.get(key),keys:()=>[...persisted.keys()],update:async(key,value)=>persisted.set(key,value)};
    context.exports.activate({subscriptions:[],workspaceState});assert(listening);
    assert.equal((await request('POST','/connect',{}, {origin:'https://edgar.fer.hr'})).status,403);
    assert.equal((await request('POST','/connect',{}, {origin:''})).status,403);
    assert.equal((await request('POST','/connect',{}, {'content-type':'text/plain'})).status,403);
    assert.equal((await request('POST','/connect','{')).status,400);
    assert.equal((await request('OPTIONS','/connect',undefined,{'access-control-request-method':'POST','access-control-request-headers':'content-type'})).status,204);
    assert.equal((await request('OPTIONS','/connect',undefined,{'access-control-request-method':'DELETE'})).status,403);
    const payload={title,question:'2',text:'int main(void) {}\n',questionKey:'exam573133/question2'};
    await fs.mkdir(path.join(root,'Edgar'),{recursive:true});
    await fs.writeFile(path.join(root,'Edgar','MI2425B2.c'),'stariji kod');
    const legacy=await request('POST','/connect',payload);assert.equal(legacy.status,200);
    assert.equal(legacy.body.text,'stariji kod');assert.equal(legacy.body.updatePage,true);
    assert.deepEqual(await fs.readdir(path.join(root,'Edgar')),['MI2425B2.c']);
    const copyPath = path.join(root,'Edgar','MI2425B2_1.c');
    await fs.writeFile(copyPath,payload.text);
    const duplicate = await request('POST','/connect',payload);assert.equal(duplicate.status,200);
    assert.equal(duplicate.body.text,'stariji kod');assert.equal(duplicate.body.fileName,'MI2425B2.c');
    assert.equal(vscode.window.activeTextEditor.document.fileName,path.join(root,'Edgar','MI2425B2.c'));
    assert.equal((await fs.readdir(path.join(root,'Edgar'))).length,2);
    await fs.unlink(copyPath);
    await fs.writeFile(path.join(root,'Edgar','MI2425B2.c'),payload.text.replace(/\n/g,'\r\n'));docs.length=0;
    const first=await request('POST','/connect',payload);assert.equal(first.status,200);assert.equal(first.body.fileName,'MI2425B2.c');assert.match(first.body.token,/^[a-f0-9]{64}$/);
    const diskText = payload.text.replace(/\n/g,'\r\n');
    assert.equal(await fs.readFile(path.join(root,'Edgar','MI2425B2.c'),'utf8'),diskText);
    const second=await request('POST','/connect',payload);assert.equal(second.body.token,first.body.token);assert.equal(docs.length,1);
    assert.equal((await request('GET','/state',undefined,{authorization:'Bearer '+first.body.token})).body.text,payload.text);
    assert.equal((await request('GET','/state',undefined,{authorization:'Bearer wrong'})).status,403);
    const auth={authorization:'Bearer '+first.body.token};
    assert.equal((await request('POST','/edit',{text:'edgar promjena',version:1},{authorization:'Bearer wrong'})).status,403);
    assert.equal((await request('POST','/edit',{text:'edgar promjena',version:1},auth)).status,200);
    assert.equal((await request('POST','/edit',{text:'prepis',version:1},auth)).status,409);
    assert.equal((await request('GET','/state',undefined,auth)).body.text,'edgar promjena');
    assert.equal((await request('POST','/format',{version:2},auth)).status,200);
    assert.equal((await request('GET','/state',undefined,auth)).body.text,'formatirano');
    assert.equal((await request('POST','/format',{version:2},auth)).status,409);
    docs[0].text='noviji kod u VS Codeu'; docs[0].version++;
    assert.equal((await request('GET','/state',undefined,{authorization:'Bearer '+first.body.token,origin:'moz-extension://aaaaaaaa-1234-1234-1234-123456789abc'})).status,403);
    const conflict=await request('POST','/connect',{...payload,text:'different'});assert.equal(conflict.status,200);
    assert.equal(conflict.body.text,'noviji kod u VS Codeu');assert.equal(conflict.body.updatePage,true);
    assert.equal(vscode.window.activeTextEditor.document.fileName,path.join(root,'Edgar','MI2425B2.c'));
    assert.equal(await fs.readFile(path.join(root,'Edgar','MI2425B2.c'),'utf8'),diskText);
    assert.deepEqual(await fs.readdir(path.join(root,'Edgar')),['MI2425B2.c']);
    context.exports.deactivate();context.exports.activate({subscriptions:[],workspaceState});
    const afterRestart=await request('POST','/connect',{...payload,text:'different'});assert.equal(afterRestart.status,200);
    assert.equal(afterRestart.body.text,'noviji kod u VS Codeu');assert.equal(afterRestart.body.updatePage,true);
    const blank=await request('POST','/connect',{...payload,text:''});assert.equal(blank.status,200);assert.equal(blank.body.text,docs[0].text);
    const localChanged=await request('POST','/connect',payload);assert.equal(localChanged.status,200);assert(localChanged.body.updatePage);
    const liveAuth={authorization:'Bearer '+localChanged.body.token};
    assert.equal((await request('POST','/ack',{version:localChanged.body.version},liveAuth)).status,200);
    const browserChanged=await request('POST','/connect',{...payload,text:'noviji kod u Edgaru'});assert.equal(browserChanged.status,200);
    assert.equal(docs[0].text,'noviji kod u VS Codeu');assert.equal(browserChanged.body.updatePage,true);
    docs[0].text='lokalna izmjena'; docs[0].version++;
    const resolved=await request('POST','/connect',payload);assert.equal(resolved.status,200);assert.equal(docs[0].text,'lokalna izmjena');
    assert.equal(warningCount,0,'Spajanje različitog koda ne smije tražiti izbor verzije.');
    assert.deepEqual(await fs.readdir(path.join(root,'Edgar')),['MI2425B2.c']);
    const other=await request('POST','/connect',{...payload,title:'Vježba: Međuispit 2024/25 - drugi termin (999999)',questionKey:'other',text:'different'});
    assert.equal(other.status,200);assert.equal(other.body.fileName,'MI2425B2_1.c');
    const competing=await Promise.all([request('POST','/connect',payload),request('POST','/connect',payload)]);assert.deepEqual(competing.map(r=>r.status).sort(),[200,409]);
    assert.equal((await request('POST','/connect','x'.repeat(1024*1024+1))).status,413);
    const zi=await request('POST','/connect',{title:'Završni ispit 2024/25 - prvi termin',question:'1',text:'ZI',questionKey:'zi1'});assert.equal(zi.status,200);assert.equal(zi.body.fileName,'ZI2425A1.c');
    assert.equal((await request('GET','/state',undefined,{authorization:'Bearer '+first.body.token})).status,403);
    commands.get('edgar.run')();assert.equal((await request('GET','/state',undefined,{authorization:'Bearer '+zi.body.token})).body.runId,1);
    console.log('VS Code: nazivi, automatska aktivacija, CORS, tokeni, inicijalni kod, konflikti i dupli pozivi su provjereni.');
  } finally { context.exports.deactivate();await fs.rm(root,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
