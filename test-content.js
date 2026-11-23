const vm=require('vm'),fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(require('node:path').join(__dirname,'firefox/content.js'),'utf8')+'\nstartEdgarPlusPlus();';
const handlers=new Map(), runtimeHandlers=new Set(), timers=new Set(), observers=[];
const zoom={children:[],textContent:'Zoom:',style:{marginLeft:'auto'}};
const parent={children:[zoom],insertBefore(el,before){if(el.parentElement){let i=el.parentElement.children.indexOf(el);if(i>=0)el.parentElement.children.splice(i,1)} const i=this.children.indexOf(before);this.children.splice(i,0,el);el.parentElement=this;el.isConnected=true}};zoom.parentElement=parent;
function mockControl(disabled=false){return {disabled,checked:false,textContent:'',title:'',classList:{toggle(){}},addEventListener(type,fn){this[type]=fn}}}
function node(tag){return {tagName:tag,style:{},isConnected:false,appendChild(){},remove(){if(this.parentElement){const i=this.parentElement.children.indexOf(this);if(i>=0)this.parentElement.children.splice(i,1)}this.parentElement=null;this.isConnected=false},querySelector(){return this.input??=mockControl(true)},attachShadow(){const button=mockControl(),status={hidden:true,textContent:''};return {set innerHTML(_){},querySelector(selector){return selector==='button'?button:status}}}}}
const doc={head:{appendChild(){}},documentElement:{appendChild(){},classList:{toggle(){},remove(){}}},createElement:node,getElementById:id=>parent.children.find(e=>e.id===id),querySelectorAll:()=>[zoom],querySelector:s=>s==='[title="Click to set custom zoom"]'?zoom:null,addEventListener(type,fn,opts){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push({fn,once:!!opts?.once})},removeEventListener(type,fn){handlers.set(type,(handlers.get(type)||[]).filter(h=>h.fn!==fn))},dispatchEvent(e){for(const h of [...(handlers.get(e.type)||[])]){h.fn(e);if(h.once)handlers.set(e.type,handlers.get(e.type).filter(x=>x!==h))}}};
const storageListeners=new Set();
let pendingResolve;const browser={runtime:{getURL:x=>x,onMessage:{addListener:f=>runtimeHandlers.add(f),removeListener:f=>runtimeHandlers.delete(f)},sendMessage:async msg=>msg.type==='status'?new Promise(r=>{pendingResolve=r}):{ok:true,message:'Uživo'}},storage:{local:{get:async()=>({privacy:true}),set:async()=>{}},onChanged:{addListener:f=>storageListeners.add(f),removeListener:f=>storageListeners.delete(f)}}};
class MO{constructor(cb){this.cb=cb;this.active=true;observers.push(this)}observe(){}disconnect(){this.active=false}}
const context={NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},document:doc,browser,MutationObserver:MO,Event:class{constructor(type){this.type=type}},setInterval:f=>{const x={f};timers.add(x);return x},clearInterval:x=>timers.delete(x),setTimeout(){},console};
vm.runInNewContext(source,context);assert.equal(parent.children.filter(x=>x.id==='edgar-vscode-controls').length,1);const old=parent.children[0];
vm.runInNewContext(source,{...context});assert.equal(parent.children.filter(x=>x.id==='edgar-vscode-controls').length,1);assert.equal(old.isConnected,false);assert.equal(observers.filter(x=>x.active).length,2);assert.equal(timers.size,1);assert.equal(runtimeHandlers.size,1);assert.equal(handlers.get('keydown').length,1);
console.log('UI: jedno dugme i jedan aktivni promatrač nakon ponovnog učitavanja.');

const select={id:'edgar-plus-setting-theme',value:'',options:[],querySelector(q){return this.options.find(o=>o.value==='edgar-burgundy-soft')||null},appendChild(o){this.options.push(o)}};
const settings={children:[]};
const timerRow={
 get nextElementSibling(){return settings.children[0]},
 after(row){row.remove();settings.children.unshift(row);row.parentElement=settings;}
};
const hideTimer={closest:selector=>selector==='.edgar-plus-setting-item'?timerRow:null};
doc.getElementById=id=>{
 if(id==='edgar-plus-setting-theme')return select;
 if(id==='edgar-plus-setting-hide-timer')return hideTimer;
 return parent.children.find(e=>e.id===id);
};
for(const o of observers.filter(o=>o.active))o.cb();for(const o of observers.filter(o=>o.active))o.cb();
assert.equal(select.options.length,1,'tema se ne smije duplicirati');
let saved;browser.storage.local.set=async v=>{saved=v};let stopped=false;select.value='edgar-burgundy-soft';
for(const h of handlers.get('change'))h.fn({target:select,stopImmediatePropagation(){stopped=true}});
assert.equal(saved.burgundySoft,true);assert(stopped);
select.value='monokai';stopped=false;for(const h of handlers.get('change'))h.fn({target:select,stopImmediatePropagation(){stopped=true}});
assert.equal(saved.burgundySoft,false);assert.equal(stopped,false);
console.log('Tema: bez duplikata, uključivanje i povratak na drugu temu.');
const oldQuery=doc.querySelector;
const modernSelect={...select,id:'',options:[],matches:selector=>selector==='select.edgar-plus-setting-theme'};
doc.querySelector=selector=>{
 if(selector==='select.edgar-plus-setting-theme')return modernSelect;
 if(selector==='input[data-setting="hideTimer"]')return hideTimer;
 return oldQuery(selector);
};
const oldGetElementById=doc.getElementById;
doc.getElementById=id=>id.startsWith('edgar-plus-setting-')?null:oldGetElementById(id);
for(let i=0;i<2;i++)for(const o of observers.filter(o=>o.active))o.cb();
assert.equal(modernSelect.options.length,1,'Edgar+ 1.2 koristi klasu za odabir teme');
modernSelect.value='edgar-burgundy-soft';stopped=false;
for(const h of handlers.get('change'))h.fn({target:modernSelect,stopImmediatePropagation(){stopped=true}});
assert(stopped);
assert.equal(settings.children.length,1,'Edgar+ 1.2 koristi data-setting za postavke');


setImmediate(async()=>{
 assert.equal(settings.children.length,1,'postavka se pojavljuje jednom i kad se izbornik naknadno učita');
 const privacyToggle=settings.children[0].input;
 assert.equal(storageListeners.size,1);
 for(const listener of storageListeners)listener({showNewlineMarks:{newValue:true}},'local');
 for(const listener of storageListeners)listener({showSpaceMarks:{newValue:true}},'local');
 assert.equal(exampleBlock.textContent,'Unos\u00b7>\u00b77\\n\n1315');
 for(const listener of storageListeners)listener({showNewlineMarks:{newValue:false}},'local');
 assert.equal(exampleBlock.textContent,'Unos\u00b7>\u00b77\u21b5\n1315');
 for(const listener of storageListeners)listener({showSpaceMarks:{newValue:false}},'local');
 assert.equal(exampleBlock.textContent,'Unos > 7\u21b5\n1315');
 for(const listener of storageListeners)listener({showNewlineMarks:{newValue:true}},'local');
 assert.equal(exampleBlock.textContent,'Unos > 7\\n\n1315');

 modernSelect.value='monokai';
 for(const listener of storageListeners)listener({burgundySoft:{newValue:true}},'local');
 assert.equal(modernSelect.value,'edgar-burgundy-soft');
 for(const listener of storageListeners)listener({burgundySoft:{newValue:false}},'local');
 assert.equal(modernSelect.value,'monokai');

 assert.equal(privacyToggle.checked,true);
 privacyToggle.checked=false;
 await privacyToggle.change();
 assert.equal(saved.privacy,false);
 privacyToggle.checked=true;
 await privacyToggle.change();
 assert.equal(saved.privacy,true);
 for(const listener of storageListeners)listener({privacy:{newValue:false}},'local');
 assert.equal(privacyToggle.checked,false);
 console.log('Privatnost: jedan prekidač u postavkama, spremljen odabir i promjene iz izbornika dodatka.');
});

const transcriptNode = data => ({nodeType:3, data, isConnected:true});
const exampleParts = [transcriptNode('Unos\u00b7>\u00b77\u21b5'), transcriptNode('\n1315')];
const diffParts = [transcriptNode('a\u00b7\u21b5'), {tagName:'BR',closest:()=>null}, transcriptNode('b\u21a9\ufe0f')];
const block = parts => ({
 parts, get textContent(){return parts.map(part=>part.data||'').join('');},
 classList:{add(){},remove(){}}
});
const exampleBlock=block(exampleParts), diffBlock=block(diffParts);
const inlineBlock=block([transcriptNode('nohighlight Upisite\u00b7>\u21b5'),transcriptNode('983')]);
const inlineClasses=[];
inlineBlock.classList.add=name=>inlineClasses.push(name);
const previousQueryAll=doc.querySelectorAll;
doc.querySelectorAll=selector=>{
 if(selector==='.edgar-q-content pre')return [exampleBlock];
 if(selector==='.edgar-q-content code:not(pre code)')return [inlineBlock];
 if(selector==='table tr')return [{classList:{add(){}},cells:[{textContent:'diff'},{querySelectorAll:()=>[diffBlock]}]}];
 return previousQueryAll(selector);
};
context.NodeFilter={SHOW_ELEMENT:1,SHOW_TEXT:4};
doc.createTreeWalker=element=>{
 const parts=element.parts[Symbol.iterator]();
 return {nextNode:()=>parts.next().value};
};
vm.runInNewContext(source,context);
assert.equal(exampleBlock.textContent,'Unos > 7\u21b5\n1315');
assert.equal(diffParts[0].data,'a \u21b5');
assert.equal(diffParts[2].data,'b\u21b5\n');
assert.equal(diffParts[1].tagName,'BR');
assert.equal(inlineBlock.textContent,'Upisite >\u21b5\n983');
assert(inlineClasses.includes('edgar-inline-transcript'));
console.log('Ispis: pretvoreni razmaci i novi redci, bez udvostručenih prijeloma.');
const diagnosticsContext={...context};
vm.runInNewContext(source.replace(/}\s*startEdgarPlusPlus\(\);$/, '\nthis.diagnostics={explainOutput,resultText};\n}\nstartEdgarPlusPlus();'),diagnosticsContext);
const {explainOutput,resultText}=diagnosticsContext.diagnostics;
assert.match(explainOutput('Suma:  250','Suma: 250'),/stupac 7.*razmaka: 1/);
assert.match(explainOutput('250\n','250'),/Višak novog retka/);
assert.match(explainOutput('250','250\n'),/Nedostaje novi redak/);
assert.match(explainOutput('x\nabC','x\nabc'),/Redak 2, stupac 3.*velika i mala slova/);
assert.equal(explainOutput('250','250'),'');
assert.equal(resultText({querySelector:()=>exampleBlock}),'Unos > 7\n1315');
assert.equal(resultText({querySelector:()=>diffBlock}),'a \nb\n');
console.log('Dijagnostika: razmaci, završni prijelom retka, velika slova i čisti tekst.');
