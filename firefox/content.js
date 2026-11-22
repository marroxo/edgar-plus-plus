document.dispatchEvent(new Event('edgar-vscode-shutdown'));
document.getElementById('edgar-vscode-controls')?.remove();
const script=document.createElement('script');script.src=browser.runtime.getURL('page.js');
(document.head||document.documentElement).appendChild(script);
const style=document.createElement('style');
style.textContent=`
 html.edgar-privacy .profilepic {filter:blur(14px)!important}
 html.edgar-privacy .profilepic + div {filter:blur(9px)!important}
 #edgar-plus-toolbar {--edgar-toolbar-button-size:40px;flex-wrap:wrap}
 #edgar-plus-toolbar > button.edgar-plus-square-btn {
  box-sizing:border-box;
  width:var(--edgar-toolbar-button-size);
  height:var(--edgar-toolbar-button-size);
  flex:none;
 }
`;
(document.head||document.documentElement).appendChild(style);

// Add the local VS Code palette to the Edgar+ theme selector without changing Edgar+ itself.
const burgundyStyle=document.createElement('style');
if (document.location?.pathname === '/prefs/cmskin') document.documentElement.classList.toggle('edgar-skin-gallery',true);
burgundyStyle.textContent=`
/* Burgundy Soft for Edgar's page as well as its editor.  Status colours on
   buttons, alerts and badges are deliberately left intact. */
html.edgar-burgundy,
html.edgar-burgundy body {background:#1A1216 !important;color:#E2D6DC !important;color-scheme:dark}
html.edgar-burgundy body :is(.bg-light,.bg-white):not(.badge):not(.btn) {
 background-color:#251A20 !important;color:#E2D6DC !important
}
html.edgar-burgundy body :is(.text-dark,.text-body,.text-black-50) {color:#E2D6DC !important}
html.edgar-burgundy body .navbar-light :is(.navbar-brand,.navbar-nav .nav-link,.navbar-toggler) {color:#E2D6DC !important}
html.edgar-burgundy body .navbar-light :is(.nav-link:hover,.nav-link:focus-visible) {color:#F7B6CA !important}
html.edgar-burgundy body .navbar-light .navbar-toggler {border-color:#886473}
html.edgar-burgundy body .navbar-light .navbar-toggler-icon {filter:invert(1)}
html.edgar-burgundy body .dropdown-menu .dropdown-item {color:#E2D6DC}
html.edgar-burgundy body .dropdown-menu .dropdown-item:is(.active,:active) {background:#4E2A3B;color:#FFF4F7}
html.edgar-burgundy body .profilepic + div mark {background:#4E2A3B;color:#FFF4F7}
html.edgar-burgundy body .nav-sidebar {background:#22181E;color:#E2D6DC}
html.edgar-burgundy body .nav-sidebar li.active > :is(a,h4) {color:#FFF4F7}
html.edgar-burgundy body .chart canvas {background:#DDC9D2;border-radius:4px}
html.edgar-burgundy body :is(.badge-light,.btn-light) {background:#38232D;color:#FFF4F7;border-color:#886473}
html.edgar-burgundy body .btn-outline-secondary {color:#CAB4BF;border-color:#886473}
html.edgar-burgundy body .btn-outline-success {color:#78D99A;border-color:#55B97C}
html.edgar-burgundy body .btn-outline-success:is(:hover,:active) {background:#226342;color:#FFF4F7}
html.edgar-burgundy body table .fa-check-circle {color:#78D99A !important}
html.edgar-burgundy body tr.edgar-result-diff :is(ins,del,mark,.bg-success,.bg-warning,span[style*="background-color:"],span[style*="background:"]) {
 color:#1A1216 !important
}
html.edgar-burgundy body :is(input,textarea)::placeholder {color:#BAA8B1;opacity:1}
@media (max-width: 600px) {
 html.edgar-burgundy body .container-fluid.bg-light:has(> .navbar-light) {flex-wrap:wrap}
 html.edgar-burgundy body .container-fluid.bg-light:has(> .navbar-light) > .ml-5 {margin-left:0 !important;flex-wrap:wrap}
 html.edgar-burgundy body :is(header-navigation,header-review) .sticky-header {
  position:relative;flex-wrap:wrap;gap:8px
 }
 html.edgar-burgundy body :is(header-navigation,header-review) .sticky-header > div:has(> small) {
  position:static !important;flex-basis:100%;overflow-wrap:anywhere
 }
 html.edgar-burgundy body :is(header-navigation,header-review) .sticky-header > .d-flex {
  min-width:0 !important;max-width:100%;flex-wrap:wrap;gap:8px
 }
 html.edgar-burgundy body :is(header-navigation,header-review) .sticky-header :is(.ml-4,.ml-5) {
  margin-left:0 !important
 }
 html.edgar-burgundy body app-exam-review > .container-fluid {
  padding-inline:12px !important
 }
 html.edgar-burgundy body question-review-content .row > .col-6 {
  flex:0 0 100%;max-width:100%;min-width:0;margin-bottom:12px
 }
 html.edgar-burgundy body .edgar-q-content :is(h1,h2,h3) > code {
  font-size:1rem;line-height:1.5;overflow-wrap:anywhere
 }
 html.edgar-burgundy body :is(app-exam-review,question-code) table.edgar2 {
  display:block;max-width:100%;overflow-x:auto
 }
 html.edgar-burgundy body :is(question-review-content,question-code) :is(div,span):has(> #edgar-plus-zoom-out) {
  flex-wrap:wrap;row-gap:4px
 }
}
html.edgar-burgundy body :is(header-navigation,exam-header,app-header) :is(.sticky-header,.bg-light,.bg-white,.navbar-light),
html.edgar-burgundy body .sticky-header.bg-light {
 background:#251A20 !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy body :is(header-navigation,exam-header,app-header) :is(small,.text-dark,.text-muted) {color:#CBB7C1 !important}
html.edgar-burgundy body :is(header-navigation .aii-qn.selected,header-review .qn-tag.selected) {
 background:#4E2A3B !important;color:#FFF4F7 !important;border-color:#E5A0B0 !important
}
html.edgar-burgundy body header-navigation .sticky-header .aii-qn.selected a {color:#FFF4F7 !important}
html.edgar-burgundy body footer.footer {
 background:#251A20 !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy #aii-countdown {color:#F3E8ED !important}
html.edgar-burgundy .edgar-q-content :not(pre) > code {
 background:#38232D !important;color:#E5C18A !important;border:1px solid #6B4D5B;border-radius:3px;padding:0 2px
}
html.edgar-burgundy body :is(exam-header,app-header,exam-run,question-content,question-content-static,question-code,footer),
html.edgar-burgundy body :is(.container,.container-fluid,.row,.col,.card-body) {color:#E2D6DC}
html.edgar-burgundy body :is(.card,.modal-content,.dropdown-menu,.list-group-item,.popover,.tooltip-inner) {
 background-color:#22181E !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy body :is(.card-header,.card-footer,.modal-header,.modal-footer,.navbar,.nav-tabs,.dropdown-divider) {
 background-color:#251A20 !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy body :is(.nav-tabs,.nav-pills) .nav-link:not(.active),
html.edgar-burgundy body a:not(.btn):not(.badge) {color:#E5A0B0}
html.edgar-burgundy body :is(.nav-tabs,.nav-pills) .nav-link.active,
html.edgar-burgundy body .dropdown-item:hover,
html.edgar-burgundy body .dropdown-item:focus {background:#4E2A3B !important;color:#FFF4F7 !important;border-color:#6B4D5B !important}
html.edgar-burgundy body :is(input:not([type=checkbox]):not([type=radio]),select,textarea,.form-control,.custom-select) {
 background-color:#251A20 !important;color:#E2D6DC !important;border-color:#6B4D5B !important
}
html.edgar-burgundy body :is(input,select,textarea):focus {outline-color:#F587A7}
html.edgar-burgundy body :is(pre:not(.ace_line):not(.CodeMirror-line):not(.CodeMirror-line-like),.hljs) {
 background:#251A20 !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy body :is(pre,.hljs) :is(.hljs-keyword,.hljs-selector-tag,.hljs-type) {color:#E5A0B0}
html.edgar-burgundy body :is(pre,.hljs) :is(.hljs-string,.hljs-attr) {color:#C5D6A5}
html.edgar-burgundy body :is(pre,.hljs) :is(.hljs-number,.hljs-literal) {color:#D7A6E0}
html.edgar-burgundy body :is(pre,.hljs) .hljs-comment {color:#A58C97}
html.edgar-burgundy body table {
 --bs-table-color:#E2D6DC;--bs-table-bg:transparent;--bs-table-border-color:#3B222D;
 --bs-table-striped-color:#E2D6DC;--bs-table-striped-bg:#251A20;
 --bs-table-hover-color:#FFF4F7;--bs-table-hover-bg:#38232D;
 color:#E2D6DC;border-color:#3B222D
}
html.edgar-burgundy body table :is(td,th) {color:#E2D6DC !important;border-color:#3B222D}
html.edgar-burgundy body table :is(thead,.thead-light,.table-light) :is(th,td),
html.edgar-burgundy body table :is(th,td):is(.bg-light,.bg-white,.table-light) {
 background:#38232D !important;color:#FFF4F7 !important
}
html.edgar-burgundy body table th:not([scope=row]) {background-color:#38232D;color:#FFF4F7 !important}
html.edgar-burgundy body table tbody th[scope=row] {
 background:#251A20 !important;color:#E2D6DC !important
}
html.edgar-burgundy body .table-striped tbody tr:nth-of-type(odd) {background-color:#251A20}
html.edgar-burgundy body .table-hover tbody tr:hover {background-color:#38232D}
html.edgar-burgundy body :is(.text-muted,small.text-muted) {color:#B9A5AE !important}
html.edgar-burgundy body :is(.border,.border-top,.border-bottom,.border-left,.border-right,hr) {border-color:#3B222D !important}
html.edgar-burgundy body :is(button:not([class*=btn-]),.btn-default,.btn-light,.btn-secondary) {
 background-color:#38232D;color:#F3E8ED;border-color:#6B4D5B
}
html.edgar-burgundy body :is(button:not([class*=btn-]),.btn-default,.btn-light,.btn-secondary):hover {
 background-color:#4E2A3B;color:#FFF4F7
}
html.edgar-burgundy #edgar-plus-ace-editor.ace_editor,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror {background:#1A1216 !important;color:#E2D6DC !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_gutter,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-gutters {background:#1A1216 !important;color:#6B4D5B !important;border-color:#3B222D !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_gutter-active-line,
html.edgar-burgundy #edgar-plus-ace-editor .ace_active-line,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-activeline-background {background:#261A21 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_cursor,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-cursor {color:#F587A7 !important;border-left-color:#F587A7 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_marker-layer .ace_selection,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-selected {background:#4E2A3B !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_comment,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-comment {color:#88717B !important;font-style:italic}
html.edgar-burgundy #edgar-plus-ace-editor .ace_keyword,
html.edgar-burgundy #edgar-plus-ace-editor .ace_storage,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-keyword {color:#E5A0B0 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_string,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-string {color:#C5D6A5 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_constant.ace_numeric,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-number {color:#D7A6E0 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_support.ace_function,
html.edgar-burgundy #edgar-plus-ace-editor .ace_entity.ace_name.ace_function,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-def {color:#E8B47A !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_support.ace_type,
html.edgar-burgundy #edgar-plus-ace-editor .ace_storage.ace_type,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-type {color:#D9A1B5 !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_keyword.ace_operator {color:#D7A0AE !important}
html.edgar-burgundy #edgar-plus-ace-editor .ace_print-margin {background:#3B222D !important}
`;
(document.head||document.documentElement).appendChild(burgundyStyle);
let burgundyEnabled=false;
function styleDiffRows(){
 if(!burgundyEnabled)return;
 for(const row of document.querySelectorAll('table tr')){
  if(row.cells?.[0]?.textContent.trim().toLowerCase()==='diff')row.classList.add('edgar-result-diff');
 }
}
function placeTheme(){
 styleDiffRows();
 const select=document.getElementById('edgar-plus-setting-theme');
 if(!select)return;
 if(!select.querySelector('option[value="edgar-burgundy-soft"]')){const option=document.createElement('option');option.value='edgar-burgundy-soft';option.textContent='Burgundy Soft';select.appendChild(option);}
 if(burgundyEnabled)select.value='edgar-burgundy-soft';
}
function themeChanged(event){
 if(event.target?.id!=='edgar-plus-setting-theme')return;
 burgundyEnabled=event.target.value==='edgar-burgundy-soft';
 document.documentElement.classList.toggle('edgar-burgundy',burgundyEnabled);
 styleDiffRows();
 browser.storage.local.set({burgundySoft:burgundyEnabled});
 if(burgundyEnabled)event.stopImmediatePropagation();
}
document.addEventListener('change',themeChanged,true);
browser.storage.local.get('burgundySoft').then(settings=>{
 burgundyEnabled=settings.burgundySoft!==false;
 document.documentElement.classList.toggle('edgar-burgundy',burgundyEnabled);
 placeTheme();
});
const themeObserver=new MutationObserver(placeTheme);
themeObserver.observe(document.documentElement,{childList:true,subtree:true});
placeTheme();
document.addEventListener('edgar-vscode-shutdown',()=>{themeObserver.disconnect();document.removeEventListener('change',themeChanged,true);document.documentElement.classList.remove('edgar-burgundy');burgundyStyle.remove();},{once:true});

// Put the connect control beside Edgar's zoom controls when they appear.
const host=document.createElement('span');
host.id='edgar-vscode-controls';
const shadow=host.attachShadow({mode:'closed'});
shadow.innerHTML=`<style>
 :host{display:inline-flex;align-items:center;margin-right:10px;position:relative;z-index:10;font:14px system-ui,sans-serif}
 button{box-sizing:border-box;height:var(--edgar-toolbar-button-size,40px);border:1px solid #8da1b4;border-radius:4px;background:#145dc2;color:white;padding:6px 10px;cursor:pointer;font:inherit;white-space:nowrap}
 button.live{background:#176a43;border-color:#176a43}button:disabled{opacity:.7;cursor:wait}
 .status{position:absolute;top:calc(100% + 4px);inset-inline-start:0;min-width:180px;width:max-content;max-width:min(260px,70vw);overflow-wrap:anywhere;padding:6px 8px;border:1px solid #886473;border-radius:4px;background:#251A20;color:#FFF4F7}
 </style><button type="button" title="Spoji otvoreni zadatak s VS Codeom">VS Code · Spoji</button><span class="status" role="status" hidden></span>`;
const toggle=shadow.querySelector('button');
const statusNotice=shadow.querySelector('.status');
const privacyRow=document.createElement('div');
privacyRow.className='edgar-plus-setting-item';
privacyRow.innerHTML=`
 <label class="edgar-plus-setting-label" for="edgar-vscode-privacy">Sakrij osobne podatke</label>
 <label class="edgar-plus-switch">
  <input id="edgar-vscode-privacy" type="checkbox" disabled>
  <span class="edgar-plus-slider"></span>
 </label>`;
const privacyToggle=privacyRow.querySelector('input');
let privacyEnabled=false;
let privacyActive=true;
function placePrivacy(){
 const anchor=document.getElementById('edgar-plus-setting-hide-timer')?.closest('.edgar-plus-setting-item');
 if(anchor && anchor.nextElementSibling!==privacyRow)anchor.after(privacyRow);
}
function applyPrivacy(value){
 if(!privacyActive)return;
 privacyEnabled=!!value;
 document.documentElement.classList.toggle('edgar-privacy',privacyEnabled);
 privacyToggle.checked=privacyEnabled;
}
function onPrivacyChanged(changes,area){
 if(area==='local'&&changes.privacy)applyPrivacy(changes.privacy.newValue);
}
browser.storage.onChanged.addListener(onPrivacyChanged);
browser.storage.local.get('privacy').then(settings=>applyPrivacy(settings.privacy)).catch(()=>{
 showNotice('Postavku privatnosti nije moguće učitati.');
}).finally(()=>{privacyToggle.disabled=false;});
privacyToggle.addEventListener('change',async()=>{
 privacyToggle.disabled=true;
 const nextValue=privacyToggle.checked;
 try{
  await browser.storage.local.set({privacy:nextValue});
  applyPrivacy(nextValue);
 }catch{
  privacyToggle.checked=privacyEnabled;
  showNotice('Postavku privatnosti nije moguće spremiti.');
 }finally{
  privacyToggle.disabled=false;
 }
});
document.addEventListener('edgar-vscode-shutdown',()=>{
 privacyActive=false;
 browser.storage.onChanged.removeListener(onPrivacyChanged);
 privacyRow.remove();
 style.remove();
},{once:true});
function showNotice(message=''){
 statusNotice.textContent=message;
 statusNotice.hidden=!message;
}
function placeControl(){
 placePrivacy();
 const labelled=document.querySelector('[title="Click to set custom zoom"]');
 let zoom=[...document.querySelectorAll('label,span,div')].find(e=>e.children.length===0 && /^Zoom\s*:?$/i.test((e.textContent||'').trim()));
 if(!zoom&&labelled){ const parent=labelled.parentElement; zoom=parent && [...parent.children].find(e=>/zoom/i.test(e.textContent||'')); zoom=zoom||labelled; }
 if(zoom&&zoom.parentElement) {
  if(host.parentElement!==zoom.parentElement || host.nextElementSibling!==zoom) {
   host.style.marginLeft=zoom.style.marginLeft==='auto'?'auto':'';
   if(zoom.style.marginLeft==='auto') zoom.style.marginLeft='0';
   zoom.parentElement.insertBefore(host,zoom);
  }
  return;
 }
 const code=document.querySelector('question-code');
 if(code && !host.isConnected) code.insertBefore(host,code.firstChild);
}
const observer=new MutationObserver(placeControl);
observer.observe(document.documentElement,{childList:true,subtree:true});
placeControl();
toggle.addEventListener('click',async()=>{
 if(toggle.disabled)return;
 toggle.disabled=true;toggle.textContent='Spajanje…';showNotice();
 try {
  const current=await browser.runtime.sendMessage({type:'status'});
  if(current.connected){await browser.runtime.sendMessage({type:'stop'});await refreshStatus(true);return;}
  const r=await browser.runtime.sendMessage({type:'connectAutomatic'});
  await refreshStatus(true);
  if(!r.ok)showNotice(r.message);
 }
 catch {toggle.textContent='VS Code · Greška';toggle.title='Povezivanje nije uspjelo.';showNotice(toggle.title);}
 finally {toggle.disabled=false;}
});
async function refreshStatus(force=false){
 if(toggle.disabled&&!force)return;
 try{const s=await browser.runtime.sendMessage({type:'status'});if(toggle.disabled&&!force)return;const error=/^(Nije spojeno|Prekinuto):/.test(s.message||'');toggle.textContent=s.connected?'VS Code · Uživo':error?'VS Code · Greška':'VS Code · Spoji';toggle.classList.toggle('live',!!s.connected);toggle.title=s.message;showNotice(error?s.message:'');}
 catch{toggle.textContent='VS Code · Greška';toggle.title='Ponovno učitaj stranicu.';}
}
refreshStatus();const statusTimer=setInterval(refreshStatus,1500);
const messageListener=msg=>{
 if(msg.type!=='bind'&&msg.type!=='update'&&msg.type!=='read')return;
 return new Promise(resolve=>{
  const node=document.createElement('div');node.hidden=true;node.textContent=JSON.stringify(msg);document.documentElement.appendChild(node);
  node.addEventListener('edgar-sync-result',()=>{try{resolve(JSON.parse(node.textContent));}catch{resolve({ok:false,error:'Neispravna poruka uređivača.'});}node.remove();},{once:true});
  node.dispatchEvent(new Event('edgar-sync-request',{bubbles:true}));
  setTimeout(()=>{if(node.isConnected){node.remove();resolve({ok:false,error:'Povezivanje s uređivačem nije uspjelo.'});}},1500);
 });
};
browser.runtime.onMessage.addListener(messageListener);
document.addEventListener('edgar-vscode-shutdown',()=>{
 observer.disconnect();clearInterval(statusTimer);host.remove();
 browser.runtime.onMessage.removeListener(messageListener);
},{once:true});

const formatKeyListener=async e=>{
 if(!(e.shiftKey&&e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='f'))return;
 if(!e.target?.closest?.('.CodeMirror, #edgar-plus-ace-editor'))return;
 e.preventDefault();e.stopImmediatePropagation();
 try{const result=await browser.runtime.sendMessage({type:'format'});if(!result?.ok){toggle.title=result?.message || 'Formatiranje nije uspjelo.';toggle.textContent='VS Code · Greška';setTimeout(refreshStatus,4000);}}catch{toggle.title='VS Code nije dostupan.';}
};
document.addEventListener('keydown',formatKeyListener,true);
document.addEventListener('edgar-vscode-shutdown',()=>document.removeEventListener('keydown',formatKeyListener,true),{once:true});
