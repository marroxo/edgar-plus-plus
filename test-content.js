const vm=require('vm'),fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(require('node:path').join(__dirname,'firefox/content.js'),'utf8');
const handlers=new Map(), runtimeHandlers=new Set(), timers=new Set(), observers=[];
const zoom={children:[],textContent:'Zoom:',style:{marginLeft:'auto'}};
const parent={children:[zoom],insertBefore(el,before){if(el.parentElement){let i=el.parentElement.children.indexOf(el);if(i>=0)el.parentElement.children.splice(i,1)} const i=this.children.indexOf(before);this.children.splice(i,0,el);el.parentElement=this;el.isConnected=true}};zoom.parentElement=parent;
function mockControl(disabled=false){return {disabled,checked:false,textContent:'',title:'',classList:{toggle(){}},addEventListener(type,fn){this[type]=fn}}}
function node(tag){return {tagName:tag,style:{},isConnected:false,appendChild(){},remove(){if(this.parentElement){const i=this.parentElement.children.indexOf(this);if(i>=0)this.parentElement.children.splice(i,1)}this.parentElement=null;this.isConnected=false},querySelector(){return this.input??=mockControl(true)},attachShadow(){const button=mockControl(),status={hidden:true,textContent:''};return {set innerHTML(_){},querySelector(selector){return selector==='button'?button:status}}}}}
const doc={head:{appendChild(){}},documentElement:{appendChild(){},classList:{toggle(){},remove(){}}},createElement:node,getElementById:id=>parent.children.find(e=>e.id===id),querySelectorAll:()=>[zoom],querySelector:s=>s==='[title="Click to set custom zoom"]'?zoom:null,addEventListener(type,fn,opts){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push({fn,once:!!opts?.once})},removeEventListener(type,fn){handlers.set(type,(handlers.get(type)||[]).filter(h=>h.fn!==fn))},dispatchEvent(e){for(const h of [...(handlers.get(e.type)||[])]){h.fn(e);if(h.once)handlers.set(e.type,handlers.get(e.type).filter(x=>x!==h))}}};
const storageListeners=new Set();
let pendingResolve;const browser={runtime:{getURL:x=>x,onMessage:{addListener:f=>runtimeHandlers.add(f),removeListener:f=>runtimeHandlers.delete(f)},sendMessage:async msg=>msg.type==='status'?new Promise(r=>{pendingResolve=r}):{ok:true,message:'Uživo'}},storage:{local:{get:async()=>({privacy:true}),set:async()=>{}},onChanged:{addListener:f=>storageListeners.add(f),removeListener:f=>storageListeners.delete(f)}}};
class MO{constructor(cb){this.cb=cb;this.active=true;observers.push(this)}observe(){}disconnect(){this.active=false}}
const context={document:doc,browser,MutationObserver:MO,Event:class{constructor(type){this.type=type}},setInterval:f=>{const x={f};timers.add(x);return x},clearInterval:x=>timers.delete(x),setTimeout(){},console};
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

setImmediate(async()=>{
 assert.equal(settings.children.length,1,'postavka se pojavljuje jednom i kad se izbornik naknadno učita');
 const privacyToggle=settings.children[0].input;
 assert.equal(storageListeners.size,1);
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
