(()=>{
 let bound=null,last=null,question='';
 let backgroundTime=null;
 let remainingMilliseconds=0;
 let lastBackgroundContext=null;
 function trackBackgroundTime(){
  const ep=window.EdgarPlus;
  const qt=ep?.examTools?.qt;
  const ordinal=location.pathname.match(/^\/exam\/run\/(\d+)/)?.[1];
  const active=qt?.interval && qt.examId && ordinal && ep.isEnabled?.()!==false && ep.getSetting?.('questionTimer')!==false;
  const now=performance.now();
  if(backgroundTime){
   if(active && qt===backgroundTime.qt && qt.examId===backgroundTime.examId){
    const elapsed=remainingMilliseconds+now-backgroundTime.start;
    const seconds=Math.floor(elapsed/1000);
    remainingMilliseconds=elapsed%1000;
    if(seconds){
     const question=backgroundTime.ordinal;
     qt.times[question]=(qt.times[question]||0)+seconds;
     try{localStorage.setItem('edgar_plus_qtime_'+qt.examId,JSON.stringify(qt.times));}catch{}
    }
   }
   backgroundTime=null;
  }
  if(document.visibilityState!=='hidden'||!active)return;
  const context=qt.examId+':'+ordinal;
  if(context!==lastBackgroundContext)remainingMilliseconds=0;
  lastBackgroundContext=context;
  backgroundTime={qt,examId:qt.examId,ordinal,start:now};
 }
 document.addEventListener('visibilitychange',trackBackgroundTime);
 window.addEventListener('pagehide',trackBackgroundTime);
 document.addEventListener('edgar-vscode-shutdown',()=>{
  trackBackgroundTime();
  document.removeEventListener('visibilitychange',trackBackgroundTime);
  window.removeEventListener('pagehide',trackBackgroundTime);
 },{once:true});
 trackBackgroundTime();
 function editor(){
  const aceNode=document.querySelector('.edgar-plus-ace.ace_editor') || document.querySelector('#edgar-plus-ace-editor');
  if(aceNode && window.ace){const a=window.ace.edit(aceNode);return {node:aceNode,get:()=>a.getValue(),set:s=>a.setValue(s,-1)};}
  const cm=[...document.querySelectorAll('.CodeMirror')].find(n=>n.CodeMirror && n.getClientRects().length);
  if(cm)return {node:cm,get:()=>cm.CodeMirror.getValue(),set:s=>cm.CodeMirror.setValue(s)};
  return null;
 }
 // The enclosing question-content also contains the editor and result. Its
 // text changes while typing or running, so it cannot identify a question.
 function currentQuestion(){const staticText=document.querySelector('question-content-static .edgar-q-content');return location.href+'\n'+(staticText?.innerText?.slice(0,500) || '');}
 const handleRequest=event=>{
  const n=event.target;let result;
  try{
   const m=JSON.parse(n.textContent), e=editor();
   if(!e)throw Error('Uređivač nije pronađen.');
   if(m.type==='bind'){
    const heading=[...document.querySelectorAll('h1,h2,h3,h4,h5')].find(h=>/^\s*\d+\.\s*$/.test(h.innerText||''));
    const titles=[...document.querySelectorAll('small')].map(e=>(e.innerText||'').trim()).filter(Boolean);
    const title=titles.find(s=>/^(?:Vježba|Ispit|Test|Laboratorijska vježba)\s*:/i.test(s)) || titles.find(s=>/\(\d+\)\s*$/.test(s));
    if(!heading||!title)throw Error('Nije moguće prepoznati vježbu ili broj zadatka.');
    bound=e.node;last=e.get();question=currentQuestion();
    result={ok:true,text:last,title,question:heading.innerText.trim().replace('.',''),questionKey:question};
   }
   else if(m.type==='read'){
    if(e.node!==bound||question!==currentQuestion())throw Error('Zadatak se promijenio; ponovno spoji karticu.');
    result={ok:true,text:e.get()};
   }
   else{
    if(e.node!==bound||question!==currentQuestion())throw Error('Zadatak se promijenio; ponovno spoji karticu.');
    if(e.get()!==m.baseText)throw Error('Kod se istodobno promijenio u Edgaru; ponovno spoji karticu.');
    if(e.get()!==m.text)e.set(m.text);last=m.text;
    if(m.run){
     const run=e.node.closest?.('.edgar-plus-ace')?.parentElement?.querySelector('.edgar-plus-footer button[data-action="run"]') ||
      document.getElementById('edgar-plus-run-btn') || document.querySelector('question-code button[title="Ctrl+Enter"]');
     if(!run || run.disabled)throw Error('Gumb za pokretanje nije dostupan.');run.click();
    }
    result={ok:true};
   }
  }catch(e){bound=null;result={ok:false,error:e.message};}
  n.textContent=JSON.stringify(result);n.dispatchEvent(new Event('edgar-sync-result'));
 };
 document.addEventListener('edgar-sync-request',handleRequest);
 document.addEventListener('edgar-vscode-shutdown',()=>document.removeEventListener('edgar-sync-request',handleRequest),{once:true});
})();
