function startEdgarPlusPlus(){
document.dispatchEvent(new Event('edgar-vscode-shutdown'));
document.getElementById('edgar-vscode-controls')?.remove();
const script=document.createElement('script');script.src=browser.runtime.getURL('page.js');
(document.head||document.documentElement).appendChild(script);
const style=document.createElement('style');
style.textContent=`
 html.edgar-privacy .profilepic {filter:blur(14px)!important}
 html.edgar-privacy .profilepic + div {filter:blur(9px)!important}
 question-code,
 question-code :is(.edgar-plus-toolbar,.edgar-plus-ace,.edgar-plus-footer) {
  box-sizing:border-box;min-inline-size:0;max-inline-size:100%;
 }
 question-code :is(#edgar-plus-toolbar,.edgar-plus-toolbar) {
  --edgar-toolbar-button-size:40px;
  display:flex;
  flex-direction:row;
  flex-wrap:wrap;
  align-items:center;
  justify-content:flex-end;
  gap:6px;
  min-width:0;
 }
 question-code .edgar-plus-toolbar > .edgar-plus-spacer {flex:1 1 0;min-width:0}
 question-code .edgar-plus-footer {
  display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:6px;
 }
 question-code .edgar-plus-footer > .edgar-plus-btn-group {
  display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-inline-start:auto;
 }
 html.edgar-burgundy question-code :is(.edgar-plus-toolbar,.edgar-plus-footer) {
  color:#E2D6DC !important;border-color:var(--edgar-surface-edge) !important;
 }
 #edgar-plus-sidebar {
  position:fixed;inset:0 0 0 auto;z-index:12002;
  box-sizing:border-box;width:min(360px,100%);max-width:100%;
  min-height:0;overflow-y:auto;overscroll-behavior:contain;
  visibility:hidden;transform:translateX(100%);
 }
 #edgar-plus-sidebar.open {visibility:visible;transform:translateX(0)}
 .edgar-plus-sidebar-overlay {
  position:fixed;inset:0;z-index:12001;display:none;background:rgb(0 0 0 / 55%);
 }
 .edgar-plus-sidebar-overlay.open {display:block}
 #edgar-plus-sidebar :is(.edgar-plus-sidebar-header,.edgar-plus-setting-item) {
  display:flex;align-items:center;justify-content:space-between;gap:8px;
 }
 #edgar-plus-sidebar .edgar-plus-setting-item {flex-wrap:wrap;padding-block:6px}
 #edgar-plus-sidebar :is(select,button) {max-width:100%;white-space:normal}
 html.edgar-burgundy #edgar-plus-sidebar {
  background:#251A20 !important;color:#F3E8ED !important;border-color:#886473 !important;
 }
 html.edgar-burgundy #edgar-plus-sidebar :is(.edgar-plus-setting-label,.edgar-plus-sidebar-header,.edgar-plus-sidebar-section,.edgar-plus-shortcuts) {
  color:#F3E8ED !important;
 }
 @media(max-width:600px) {
  question-code .edgar-plus-toolbar > .edgar-plus-spacer {display:none}
  question-code .edgar-plus-toolbar > select {min-width:0;max-width:100%}
  question-code .edgar-plus-footer > .edgar-plus-btn-group {flex-wrap:wrap}
  question-code .edgar-plus-ace {width:100%;overflow:hidden}
  .edgar-q-content pre {
   box-sizing:border-box;max-width:100%;overflow-x:auto;
   white-space:pre;overflow-wrap:normal;word-break:normal;
  }
  .edgar-q-content pre code {white-space:inherit;overflow-wrap:normal;word-break:normal}
 }
 :is(#edgar-plus-toolbar,.edgar-plus-toolbar) > button.edgar-plus-square-btn {
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
html.edgar-burgundy {
 --edgar-surface-header:#302029;
 --edgar-surface-panel:#251820;
 --edgar-surface-page:#1D141A;
 --edgar-surface-editor:#160D12;
 --edgar-surface-edge:#503440;
}
html.edgar-burgundy body {background:var(--edgar-surface-page) !important;color:#E2D6DC !important;color-scheme:dark}
html.edgar-burgundy question-code :is(#edgar-plus-toolbar,.edgar-plus-toolbar) {
 background:var(--edgar-surface-header) !important;
 border-bottom:1px solid var(--edgar-surface-edge) !important;
}
html.edgar-burgundy question-code .edgar-plus-footer {
 background:var(--edgar-surface-panel) !important;
 border-top:1px solid var(--edgar-surface-edge) !important;
}
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
 html.edgar-burgundy body :is(question-review-content,question-code) :is(div,span):has(> :is(#edgar-plus-zoom-out,[data-action="zoom-out"])) {
  flex-wrap:wrap;row-gap:4px
 }
}
html.edgar-burgundy body :is(header-navigation,exam-header,app-header) :is(.sticky-header,.bg-light,.bg-white,.navbar-light),
html.edgar-burgundy body .sticky-header.bg-light {
 background:var(--edgar-surface-header) !important;color:#E2D6DC !important;border-color:var(--edgar-surface-edge) !important
}
html.edgar-burgundy body :is(header-navigation,exam-header,app-header) :is(small,.text-dark,.text-muted) {color:#CBB7C1 !important}
html.edgar-burgundy body :is(header-navigation .aii-qn.selected,header-review .qn-tag.selected) {
 background:#4E2A3B !important;color:#FFF4F7 !important;border-color:#E5A0B0 !important
}
html.edgar-burgundy body header-navigation .sticky-header .aii-qn.selected a {color:#FFF4F7 !important}
html.edgar-burgundy body footer.footer {
 background:#251A20 !important;color:#E2D6DC !important;border-color:#3B222D !important
}
html.edgar-burgundy body #aii-countdown,
html.edgar-burgundy body #aii-countdown * {
 color:#fff !important;-webkit-text-fill-color:#fff !important;text-shadow:none;
}
html.edgar-burgundy body :is(#aii-countdown,button.ep-qtime) {
 box-sizing:border-box;
 inline-size:100%;
 min-inline-size:0;
 min-block-size:32px;
 padding:4px 8px;
 border-radius:5px;
}
html.edgar-burgundy body button.ep-qtime {
 background:#38232D !important;color:#fff !important;border:1px solid #886473;
}
html.edgar-burgundy body #aii-countdown {
 font-variant-numeric:tabular-nums;
 font-weight:600;
 line-height:1.2;
 text-align:center;
}
html.edgar-burgundy body .ep-testdiff {
 background:#251A20 !important;color:#F3E8ED !important;border-color:#886473 !important;
 max-width:100%;overflow-x:auto;
}
html.edgar-burgundy body .ep-testdiff :is(.ep-td-title,.ep-td-toggle,.ep-d-ln,.ep-d-skip,.ep-ws) {
 color:#E2D6DC !important;
}
html.edgar-burgundy body .ep-diff-table :is(.ep-d-a,.ep-hl-a) {
 background:#633440 !important;color:#FFF4F7 !important;
}
html.edgar-burgundy body .ep-diff-table :is(.ep-d-b,.ep-hl-b) {
 background:#374F3B !important;color:#F1FFF1 !important;
}
html.edgar-burgundy body code:not(pre code):not(.ace_editor code):not(.CodeMirror code) {
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
html.edgar-burgundy body .edgar-q-content pre {
 background:var(--edgar-surface-panel) !important;
 border-color:var(--edgar-surface-edge) !important;
}
html.edgar-burgundy body .edgar-q-content pre .hljs {background:transparent !important}
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
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace).ace_editor,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror {background:var(--edgar-surface-editor) !important;color:#E2D6DC !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_gutter,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-gutters {background:var(--edgar-surface-editor) !important;color:#A58C97 !important;border-color:var(--edgar-surface-edge) !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_gutter-active-line,
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_active-line,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-activeline-background {background:#261A21 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_cursor,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-cursor {color:#F587A7 !important;border-left-color:#F587A7 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_marker-layer .ace_selection,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror-selected {background:#4E2A3B !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_comment,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-comment {color:#88717B !important;font-style:italic}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_keyword,
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_storage,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-keyword {color:#E5A0B0 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_string,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-string {color:#C5D6A5 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_constant.ace_numeric,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-number {color:#D7A6E0 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_support.ace_function,
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_entity.ace_name.ace_function,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-def {color:#E8B47A !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_support.ace_type,
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_storage.ace_type,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-type {color:#D9A1B5 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_keyword.ace_operator {color:#D7A0AE !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_constant.ace_other,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-atom {color:#E5C18A !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_constant.ace_language {color:#D7A6E0 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_constant.ace_language.ace_escape {color:#E2A882 !important}
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-meta {color:#E5A0B0 !important}
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror .cm-operator {color:#D7A0AE !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_identifier,
html.edgar-burgundy:not(.edgar-skin-gallery) .CodeMirror :is(.cm-variable,.cm-variable-2) {color:#E8DCE1 !important}
html.edgar-burgundy :is(#edgar-plus-ace-editor,.edgar-plus-ace) .ace_print-margin {background:#3B222D !important}
`;
(document.head||document.documentElement).appendChild(burgundyStyle);
let burgundyEnabled=false;
let previousTheme;
function styleDiffRows(){
 if(!burgundyEnabled)return;
 for(const row of document.querySelectorAll('table tr')){
  if(row.cells?.[0]?.textContent.trim().toLowerCase()==='diff')row.classList.add('edgar-result-diff');
 }
}
// Edgar prints whitespace markers in transcripts. Keep the markup used to highlight diffs.
const transcriptEdits=new Map();
let showSpaceMarks=false;
let showNewlineMarks=false;
let transcriptSettingsChanged=false;
function restoreTranscripts(){
 for(const [node,{original,rendered}] of transcriptEdits)if(node.data===rendered)node.data=original;
 transcriptEdits.clear();
}
function updateTranscriptSettings(spaces,newlines){
 if(showSpaceMarks===spaces&&showNewlineMarks===newlines)return;
 showSpaceMarks=spaces;
 showNewlineMarks=newlines;
 restoreTranscripts();
 placeTranscripts();
}
const transcriptStyle=document.createElement('style');
transcriptStyle.textContent=`
.edgar-readable-transcript {white-space:pre-wrap}
.edgar-q-content code.edgar-inline-transcript {
 display:block;box-sizing:border-box;max-width:100%;margin:.6rem 0;padding:.5rem .65rem;
 white-space:pre-wrap;overflow-wrap:anywhere;font-size:.875rem;font-weight:400;line-height:1.5;
 border:1px solid #6B4D5B;border-radius:4px;
}
.edgar-result-tools {display:flex;gap:.5rem;flex-wrap:wrap;margin:.45rem 0;white-space:normal}
.edgar-result-tools button {padding:.2rem .55rem;font:inherit;cursor:pointer}
.edgar-output-explanation {margin:.45rem 0;white-space:normal;overflow-wrap:anywhere}
html.edgar-burgundy body .edgar-q-content code.edgar-inline-transcript:not(pre code) {
 background:var(--edgar-surface-panel) !important;color:#E2D6DC !important;
 padding:.5rem .65rem;border-color:var(--edgar-surface-edge);
}
`;
(document.head||document.documentElement).appendChild(transcriptStyle);
function renderTranscript(element,prefixLength=0){
 const text=element.textContent;
 if(!/[·↵↩]/u.test(text)&&!prefixLength)return;
 const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
 const parts=[];
 for(let node=walker.nextNode();node;node=walker.nextNode()){
  if(node.nodeType===3)parts.push({node,value:node.data});
  else if(node.tagName==='BR')parts.push({value:'\n'});
 }
 const transcript=parts.map(part=>part.value).join('');
 let offset=0;
 for(const {node,value:original} of parts){
  if(!node){offset+=original.length;continue;}
  const prefix=Math.max(0,prefixLength-offset);
  const rendered=original.slice(prefix).replace(/·|[↵↩]️?/gu,(mark,index)=>{
   if(mark==='·')return showSpaceMarks?mark:' ';
   const lineBreak=/^\r?\n/.test(transcript.slice(offset+prefix+index+mark.length))?'':'\n';
   return (showNewlineMarks?'\\n':'\u21b5')+lineBreak;
  });
  if(rendered!==original){
   if(transcriptEdits.get(node)?.rendered!==original)transcriptEdits.set(node,{original,rendered});
   else transcriptEdits.get(node).rendered=rendered;
   node.data=rendered;
  }
  offset+=original.length;
 }
 element.classList.add('edgar-readable-transcript');
}

const resultControls=new Map();
function resultText(cell){
 const source=cell.querySelector('pre')||cell;
 const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
 let text='';
 for(let node=walker.nextNode();node;node=walker.nextNode()){
  const element=node.nodeType===3?node.parentElement:node;
  if(element?.closest('.edgar-result-tools,.edgar-output-explanation'))continue;
  if(node.nodeType===3){
   const edit=transcriptEdits.get(node);
   text+=edit?.rendered===node.data?edit.original:node.data;
  }else if(node.tagName==='BR')text+='\n';
 }
 return text.replace(/\r\n/g,'\n').replace(/·/g,' ').replace(/[↵↩]\uFE0F?\n?/gu,'\n');
}
function explainOutput(actual,expected){
 if(actual===expected)return '';
 let index=0;
 while(index<actual.length&&index<expected.length&&actual[index]===expected[index])index++;
 const lines=expected.slice(0,index).split('\n');
 const position='Redak '+lines.length+', stupac '+([...lines.at(-1)].length+1)+'. ';
 const a=actual.slice(index), e=expected.slice(index);
 if(!e&&a==='\n')return position+'Višak novog retka na kraju ispisa.';
 if(!a&&e==='\n')return position+'Nedostaje novi redak na kraju ispisa.';
 for(const [longer,shorter,label] of [[a,e,'Višak'],[e,a,'Nedostaje']]){
  const spaces=longer.match(/^ +/)?.[0].length||0;
  const shared=shorter.match(/^ +/)?.[0].length||0;
  if(spaces>shared&&longer.slice(spaces)===shorter.slice(shared)){
   return position+label+' razmaka: '+(spaces-shared)+'.';
  }
 }
 const describe=ch=>ch===undefined?'kraj ispisa':ch===' '?'razmak':ch==='\t'?'tabulator':ch==='\n'?'novi redak':JSON.stringify(ch);
 return position+'Očekivano: '+describe([...e][0])+', dobiveno: '+describe([...a][0])+'.'+
  (a.toLowerCase()===e.toLowerCase()?' Provjeri velika i mala slova.':'');
}
function placeResultControls(){
 for(const [cell,control] of resultControls)if(!cell.isConnected)resultControls.delete(cell);
 for(const table of document.querySelectorAll('table')){
  if(!table.rows||!table.getClientRects().length)continue;
  const rows=new Map([...table.rows].filter(row=>row.cells.length===2)
   .map(row=>[row.cells[0].textContent.trim().toLowerCase(),row.cells[1]]));
  const expected=rows.get('expected'), actual=rows.get('stdout');
  if(!expected?.getClientRects().length||!actual?.getClientRects().length)continue;
  if(!resultControls.get(expected)?.isConnected){
   const tools=document.createElement('div');
   tools.className='edgar-result-tools';
   const button=document.createElement('button');
   button.type='button';
   button.textContent='Kopiraj očekivani izlaz';
   const status=document.createElement('span');
   status.setAttribute('role','status');
   button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(resultText(expected));status.textContent='Kopirano.';}
    catch{status.textContent='Kopiranje nije uspjelo.';}
   });
   tools.append(button,status);
   expected.appendChild(tools);
   resultControls.set(expected,tools);
  }
  const target=rows.get('diff')||actual;
  let note=resultControls.get(target);
  const explanation=explainOutput(resultText(actual),resultText(expected));
  if(!explanation){
   if(note){note.remove();resultControls.delete(target);}
   continue;
  }
  if(!note?.isConnected){
   note=document.createElement('p');
   note.className='edgar-output-explanation';
   target.appendChild(note);
   resultControls.set(target,note);
  }
  if(note.textContent!==explanation)note.textContent=explanation;
 }
}
function placeTranscripts(){
 for(const node of transcriptEdits.keys())if(!node.isConnected)transcriptEdits.delete(node);
 for(const pre of document.querySelectorAll('.edgar-q-content pre')){
  // A return marker distinguishes a transcript from a source-code example.
  if(/[↵↩]/u.test(pre.textContent))renderTranscript(pre);
 }
 for(const code of document.querySelectorAll('.edgar-q-content code:not(pre code)')){
  const prefix=code.textContent.match(/^nohighlight\s+/);
  if(!prefix)continue;
  renderTranscript(code,prefix[0].length);
  code.classList.add('edgar-inline-transcript');
 }
 for(const row of document.querySelectorAll('table tr')){
  if(!/^(stdin|stdout|expected|diff|stderr)$/i.test(row.cells?.[0]?.textContent.trim()||''))continue;
  const cell=row.cells[1];
  if(!cell)continue;
  const blocks=cell.querySelectorAll('pre');
  if(blocks.length)for(const block of blocks)renderTranscript(block);
  else renderTranscript(cell);
 }
}
document.addEventListener('edgar-vscode-shutdown',()=>{
 transcriptSettingsChanged=true;
 for(const control of resultControls.values())control.remove();
 resultControls.clear();
 restoreTranscripts();
 for(const element of document.querySelectorAll('.edgar-readable-transcript'))element.classList?.remove('edgar-readable-transcript','edgar-inline-transcript');
 transcriptStyle.remove();
},{once:true});

function placeTheme(){
 placeTranscripts();
 placeResultControls();
 styleDiffRows();
 const select=document.querySelector('select.edgar-plus-setting-theme') || document.getElementById('edgar-plus-setting-theme');
 if(!select)return;
 if(!select.querySelector('option[value="edgar-burgundy-soft"]')){const option=document.createElement('option');option.value='edgar-burgundy-soft';option.textContent='Burgundy Soft';select.appendChild(option);}
 if(burgundyEnabled&&select.value!=='edgar-burgundy-soft'){
  previousTheme=select.value;
  select.value='edgar-burgundy-soft';
 }else if(!burgundyEnabled&&select.value==='edgar-burgundy-soft'&&previousTheme!==undefined){
  select.value=previousTheme;
 }
}
function themeChanged(event){
 if(event.target?.id!=='edgar-plus-setting-theme' && !event.target?.matches?.('select.edgar-plus-setting-theme'))return;
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
themeObserver.observe(document.documentElement,{childList:true,characterData:true,subtree:true});
placeTheme();
document.addEventListener('edgar-vscode-shutdown',()=>{themeObserver.disconnect();document.removeEventListener('change',themeChanged,true);document.documentElement.classList.remove('edgar-burgundy');burgundyStyle.remove();},{once:true});

// Put the connect control beside Edgar's zoom controls when they appear.
const host=document.createElement('span');
host.id='edgar-vscode-controls';
host.hidden=true;
const shadow=host.attachShadow({mode:'closed'});
shadow.innerHTML=`<style>
 :host{display:inline-flex;align-items:center;margin-right:10px;position:relative;z-index:10;font:14px system-ui,sans-serif}
 :host([hidden]){display:none}
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
 const timer=document.querySelector('input[data-setting="hideTimer"]') || document.getElementById('edgar-plus-setting-hide-timer');
 const anchor=timer?.closest('.edgar-plus-setting-item');
 if(anchor && anchor.nextElementSibling!==privacyRow)anchor.after(privacyRow);
}
function applyPrivacy(value){
 if(!privacyActive)return;
 privacyEnabled=!!value;
 document.documentElement.classList.toggle('edgar-privacy',privacyEnabled);
 privacyToggle.checked=privacyEnabled;
}
function onSettingsChanged(changes,area){
 if(area==='local'&&(changes.showSpaceMarks||changes.showNewlineMarks)){
  transcriptSettingsChanged=true;
  updateTranscriptSettings(
   changes.showSpaceMarks?changes.showSpaceMarks.newValue===true:showSpaceMarks,
   changes.showNewlineMarks?changes.showNewlineMarks.newValue===true:showNewlineMarks
  );
 }
 if(area==='local'&&changes.burgundySoft){
  burgundyEnabled=changes.burgundySoft.newValue!==false;
  document.documentElement.classList.toggle('edgar-burgundy',burgundyEnabled);
  placeTheme();
 }
 if(area==='local'&&changes.privacy)applyPrivacy(changes.privacy.newValue);
 if(area==='local'&&changes.syncEnabled)host.hidden=changes.syncEnabled.newValue!==true;
}
browser.storage.onChanged.addListener(onSettingsChanged);
browser.storage.local.get(['showSpaceMarks','showNewlineMarks']).then(settings=>{
 if(!transcriptSettingsChanged)updateTranscriptSettings(settings.showSpaceMarks===true,settings.showNewlineMarks===true);
}).catch(()=>{});
browser.storage.local.get('syncEnabled').then(settings=>{
 if(privacyActive)host.hidden=settings.syncEnabled!==true;
}).catch(()=>{});
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
 browser.storage.onChanged.removeListener(onSettingsChanged);
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
 const activeToolbar=labelled?.closest?.('.edgar-plus-toolbar, #edgar-plus-toolbar');
 let zoom=activeToolbar && [...activeToolbar.children].find(element=>/^Zoom\s*:?$/i.test(element.textContent.trim()));
 if(!zoom)zoom=[...document.querySelectorAll('label,span,div')].find(e=>e.children.length===0 && /^Zoom\s*:?$/i.test((e.textContent||'').trim()));
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
 if(code && !code.contains?.(host) && host.parentElement!==code) code.insertBefore(host,code.firstChild);
 if(!code && host.isConnected) host.remove();
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
 try{const s=await browser.runtime.sendMessage({type:'status'});if(toggle.disabled&&!force)return;const error=/^(Nije spojeno|Prekinuto):/.test(s.message||'');toggle.textContent=s.connected?'VS Code · Uživo':error?'VS Code · Greška':'VS Code · Spoji';toggle.classList.toggle('live',!!s.connected);toggle.title=s.message;if(error)showNotice(s.message);}
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
 // Edgar+ 1.2 already handles this shortcut inside its own Ace editor.
 if(e.target?.closest?.('.edgar-plus-ace'))return;
 if(!e.target?.closest?.('.CodeMirror, #edgar-plus-ace-editor'))return;
 e.preventDefault();e.stopImmediatePropagation();
 try{const result=await browser.runtime.sendMessage({type:'format'});if(!result?.ok){toggle.title=result?.message || 'Formatiranje nije uspjelo.';toggle.textContent='VS Code · Greška';setTimeout(refreshStatus,4000);}}catch{toggle.title='VS Code nije dostupan.';}
};
document.addEventListener('keydown',formatKeyListener,true);
document.addEventListener('edgar-vscode-shutdown',()=>document.removeEventListener('keydown',formatKeyListener,true),{once:true});

}
