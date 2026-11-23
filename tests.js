const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

async function testPage() {
 let visibilityChanged, time=0;
 const qt={examId:'test',interval:1,times:{1:4}};
 let onEvent, text='izvorno', clicks=0, problem='Zadatak A', address='https://edgar.fer.hr/exam/run/1';
 const cm={getValue:()=>text,setValue:t=>{text=t}}, node={CodeMirror:cm,getClientRects:()=>[1]};
 let pageTitle='Vježba: Međuispit 2024/25 - drugi termin (573133)';
 const doc={body:{innerText:pageTitle},addEventListener:(type,fn)=>{if(type==='edgar-sync-request')onEvent=fn;if(type==='visibilitychange')visibilityChanged=fn;},removeEventListener(){},querySelector:s=>s==='question-content-static .edgar-q-content'?{innerText:problem}:s==='question-code button[title="Ctrl+Enter"]'?{disabled:false,click:()=>clicks++}:null,querySelectorAll:s=>s==='h1,h2,h3,h4,h5'?[{innerText:'2.'}]:s==='small'?[{innerText:pageTitle}]:[node],getElementById:()=>null};
 const context={document:doc,window:{EdgarPlus:{examTools:{qt}},addEventListener(){},removeEventListener(){}},performance:{now:()=>time},localStorage:{setItem(){}},location:{get href(){return address;},get pathname(){return new URL(address).pathname;}},Event:class{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'firefox/page.js'),'utf8'),context);
 doc.visibilityState='hidden'; visibilityChanged();
 time=12500; doc.visibilityState='visible'; visibilityChanged();
 assert.equal(qt.times[1],16);
 doc.visibilityState='hidden'; visibilityChanged();
 time=13000; doc.visibilityState='visible'; visibilityChanged();
 assert.equal(qt.times[1],17);
 function send(o){let result;const target={textContent:JSON.stringify(o),dispatchEvent:()=>{result=JSON.parse(target.textContent);}};onEvent({target});return result;}
 const bind=send({type:'bind'});assert(bind.ok);assert.equal(bind.question,'2');assert.equal(bind.title,'Vježba: Međuispit 2024/25 - drugi termin (573133)');assert.equal(bind.text,'izvorno');
 assert(send({type:'update',baseText:'izvorno',text:'a'}).ok);
 assert(send({type:'update',baseText:'a',text:'ab'}).ok);
 assert(send({type:'update',baseText:'ab',text:'abc',run:true}).ok);
 assert.equal(clicks,1);assert.equal(text,'abc');
 text='izmjena u Edgaru'; assert(!send({type:'update',baseText:'abc',text:'prepis'}).ok);assert.equal(text,'izmjena u Edgaru');
 assert(send({type:'bind'}).ok); address='https://edgar.fer.hr/exam/run/2';
 assert(!send({type:'update',text:'drugi zadatak'}).ok);assert.equal(text,'izmjena u Edgaru');
 pageTitle='Vježba: Laboratorijska vježba 3 (1234)';assert.equal(send({type:'bind'}).title,pageTitle);
 const modernEditor={closest:()=>({parentElement:{querySelector:selector=>{
  assert.equal(selector,'.edgar-plus-footer button[data-action="run"]');
  return {disabled:false,click:()=>clicks++};
 }}})};
 const nativeQuery=doc.querySelector;
 doc.querySelector=selector=>selector==='.edgar-plus-ace.ace_editor'?modernEditor:nativeQuery(selector);
 context.window.ace={edit:element=>{assert.equal(element,modernEditor);return cm;}};
 assert.equal(send({type:'bind'}).text,'izmjena u Edgaru');
 assert(send({type:'update',baseText:'izmjena u Edgaru',text:'Ace 1.2',run:true}).ok);
 assert.equal(send({type:'read'}).text,'Ace 1.2');
 assert.equal(clicks,2);
}
async function testBackgroundOld() {
 let listener,tick,version=1,received=[],fail=false;
 const tab={id:8,url:'https://edgar.fer.hr/exam/run/1'};
 const browser={storage:{local:{get:async()=>({syncEnabled:true})},onChanged:{addListener(){}}},runtime:{onMessage:{addListener:f=>{listener=f;}}},tabs:{get:async()=>tab,sendMessage:async(_,m)=>{received.push(m);return fail?{ok:false,error:'nema editora'}:{ok:true};}}};
 const fetch=async()=>({ok:true,json:async()=>({text:'kod'+version,version,runId:0,fileName:'moj.c'})});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'firefox/background.js'),'utf8'),{browser,fetch,setInterval:f=>{tick=f;},Map,Error});
 let r=await listener({type:'connectCurrent',token:'a'.repeat(64)},{tab});
 assert(r.ok);assert.equal(received[1].text,'kod1');
 version=2;await tick();assert.equal(received.at(-1).text,'kod2');
 fail=true;version=3;await tick();r=await listener({type:'status'},{tab});assert(!r.connected);assert.match(r.message,/nema editora/);
 fail=true;r=await listener({type:'connectCurrent',token:'a'.repeat(64)},{tab});assert(!r.ok);
}
async function testAutomaticOld(){
 let listener,tick,version=1,updates=[],conflict=false;
 const tab={id:3,url:'https://edgar.fer.hr/exam/run/1'};
 const browser={storage:{local:{get:async()=>({syncEnabled:true})},onChanged:{addListener(){}}},runtime:{onMessage:{addListener:f=>{listener=f;}}},tabs:{get:async()=>tab,sendMessage:async(_,m)=>{updates.push(m);return m.type==='bind'?{ok:true,title:'Vježba: Međuispit 2024/25 - drugi termin (573133)',question:'2',questionKey:'q2',text:'moj kod'}:{ok:true};}}};
 const fetch=async(url,opt)=>{
  if(url.endsWith('/connect')){const data=JSON.parse(opt.body);assert.equal(data.question,'2');assert.equal(data.text,'moj kod');return {ok:!conflict,json:async()=>conflict?{error:'Različit kod'}:{text:'moj kod',version,runId:0,fileName:'MI2425B2.c',token:'a'.repeat(64)}};}
  return {ok:true,json:async()=>({text:'izmjena',version,runId:0,fileName:'MI2425B2.c'})};
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'firefox/background.js'),'utf8'),{browser,fetch,setInterval:f=>{tick=f;},Map,Error});
 let r=await listener({type:'connectAutomatic'},{tab});assert(r.ok);assert.match(r.message,/MI2425B2/);assert.deepEqual(updates.map(m=>m.type),['bind']);
 version=2;await tick();assert.equal(updates.at(-1).text,'izmjena');
 conflict=true;r=await listener({type:'connectAutomatic'},{tab});assert(!r.ok);assert.match(r.message,/Različit kod/);
 const before=updates.length;version=3;await tick();assert.equal(updates.length,before,'Prethodni kod ne smije se prenijeti nakon neuspjelog ponovnog spajanja.');
}
async function testBidirectional(){
 let listener,tick, page='start', code='start',version=1,runId=0,runs=0,late=false;
 const tab={id:3,url:'https://edgar.fer.hr/exam/run/1'};
 const browser={storage:{local:{get:async()=>({syncEnabled:true})},onChanged:{addListener(){}}},runtime:{onMessage:{addListener:f=>listener=f}},tabs:{get:async()=>tab,sendMessage:async(_,m)=>{
  if(m.type==='bind')return {ok:true,title:'MI2425B',question:'2',questionKey:'q2',text:page};
  if(m.type==='read')return {ok:true,text:page};
  if(late){page='izmjena tijekom prijenosa';late=false;}
  if(m.baseText!==page)return {ok:false,error:'konflikt'};
  page=m.text;if(m.run)runs++;return {ok:true};
 }}};
 const snapshot=()=>({text:code,version,runId,fileName:'zadatak.c',token:'a'.repeat(64)});
 const fetch=async(url,opt)=>{
  if(url.endsWith('/connect'))return {ok:true,json:async()=>snapshot()};
  if(url.endsWith('/format')){const data=JSON.parse(opt.body);if(data.version!==version)return {ok:false,json:async()=>({error:'konflikt'})};code='formatirano';version++;return {ok:true,json:async()=>snapshot()};}
  if(url.endsWith('/edit')){const data=JSON.parse(opt.body);if(data.version!==version)return {ok:false,json:async()=>({error:'konflikt'})};code=data.text;version++;return {ok:true,json:async()=>snapshot()};}
  return {ok:true,json:async()=>snapshot()};
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'firefox/background.js'),'utf8'),{browser,fetch,setInterval:f=>tick=f,Map,Error});
 assert((await listener({type:'connectAutomatic'},{tab})).ok);
 page='edgar';await tick();assert.equal(code,'edgar');assert.equal(runs,0);
 assert((await listener({type:'format'},{tab})).ok);assert.equal(code,'formatirano');assert.equal(page,'formatirano');assert.equal(runs,0);
 code='vscode';version++;await tick();assert.equal(page,'vscode');
 page='obaja';code='obaja';version++;await tick();assert((await listener({type:'status'},{tab})).connected);
 page='edgar konflikt';code='vscode konflikt';version++;await tick();assert(!(await listener({type:'status'},{tab})).connected);assert.equal(page,'edgar konflikt');assert.equal(code,'vscode konflikt');
 code=page;assert((await listener({type:'connectAutomatic'},{tab})).ok);code='nove';version++;late=true;await tick();assert(!(await listener({type:'status'},{tab})).connected);assert.equal(page,'izmjena tijekom prijenosa');
}
(async()=>{await testPage();await testBidirectional();console.log('Provjere sinkronizacije i statusa su prošle.');})().catch(e=>{console.error(e);process.exitCode=1;});
