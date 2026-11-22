let session = null, busy = false;
const states = new Map();
const endpoint = 'http://127.0.0.1:43187';
const normalizedText = text => text.replace(/\r\n/g, '\n');
async function connectAutomatic(tabId, url) {
  if (!/^https:\/\/edgar\.fer\.hr\//.test(url || '')) throw Error('Otvori Edgarov zadatak.');
  // Stop the previous binding before rebinding the page, including on failure.
  // Otherwise an old file could be sent into a newly selected question.
  if (session) setStatus(session.tabId,{connected:false,message:'Povezivanje je prekinuto radi novog spajanja.'});
  session = null;
  const initial = await browser.tabs.sendMessage(tabId, {type:'bind'});
  if (!initial?.ok) throw Error(initial?.error || 'Edgarov uređivač nije pronađen.');
  let response;
  try { response = await fetch(endpoint+'/connect', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:initial.title,question:initial.question,text:initial.text,questionKey:initial.questionKey})}); }
  catch { throw Error('VS Code nije dostupan. Otvori mapu u VS Codeu.'); }
  let state; try { state=await response.json(); } catch { throw Error('VS Code je vratio neispravan odgovor.'); }
  if (!response.ok) throw Error(state.error || 'Povezivanje nije uspjelo.');
  if (state.updatePage ?? normalizedText(state.text) !== normalizedText(initial.text)) {
    const applied=await browser.tabs.sendMessage(tabId,{type:'update',baseText:initial.text,text:state.text,run:false});
    if(!applied?.ok)throw Error(applied?.error || 'Kod nije prenesen.');
    await acknowledge(state.token,state.version);
  }
  session={tabId,url,token:state.token,runId:state.runId,fileName:state.fileName,baseText:normalizedText(state.text),ackVersion:state.version};
  setStatus(tabId,{connected:true,message:'Uživo: '+state.fileName});
  return states.get(tabId);
}
async function readState(token) {
  const response = await fetch(endpoint+'/state', {headers:{Authorization:'Bearer '+token}, cache:'no-store'});
  if (!response.ok) throw Error('VS Code ne prihvaća kod za spajanje ili je datoteka zatvorena.');
  return response.json();
}
function setStatus(tabId, status) { states.set(tabId, status); }
function acknowledge(token,version) {
  return fetch(endpoint+'/ack',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({version})})
    .then(response=>response.ok).catch(()=>false);
}
browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === 'format') {
    if (!session || session.tabId!==sender.tab?.id) return {ok:false,message:'Najprije spoji zadatak s VS Codeom.'};
    if (busy) return {ok:false,message:'Sinkronizacija je u tijeku; pokušaj ponovno.'};
    const s=session; busy=true;
    try {
      const state=await readState(s.token);
      const page=await browser.tabs.sendMessage(s.tabId,{type:'read'});
      if (session!==s || !page?.ok || normalizedText(page.text)!==state.text || state.text!==s.baseText) throw Error('Pričekaj sinkronizaciju i pokušaj ponovno.');
      const response=await fetch(endpoint+'/format',{method:'POST',headers:{Authorization:'Bearer '+s.token,'Content-Type':'application/json'},body:JSON.stringify({version:state.version})});
      const formatted=await response.json(); if(!response.ok)throw Error(formatted.error || 'Formatiranje nije uspjelo.');
      if (session!==s) return {ok:false,message:'Povezivanje je prekinuto.'};
      const applied=await browser.tabs.sendMessage(s.tabId,{type:'update',baseText:page.text,text:formatted.text,run:false});
      if(!applied?.ok)throw Error(applied?.error || 'Kod se promijenio u Edgaru.');
      s.baseText=normalizedText(formatted.text);
      if (await acknowledge(s.token,formatted.version)) s.ackVersion=formatted.version;
      return {ok:true,message:'Kod je formatiran.'};
    }catch(e){return {ok:false,message:e.message};}finally{busy=false;}
  }
  if (msg.type === 'status') return states.get(sender.tab?.id) || {connected:false, message:'Nije povezano'};
  if (msg.type === 'stop') {
    const id = sender.tab?.id ?? session?.tabId;
    if (session && (sender.tab ? session.tabId === id : true)) session = null;
    if (id != null) setStatus(id, {connected:false, message:'Povezivanje je isključeno.'});
    return {message:'Odspojeno.'};
  }
  if (msg.type === 'connectAutomatic') {
    const tabId=sender.tab?.id, url=sender.tab?.url;
    if (busy) return {ok:false,message:'Prijenos je u tijeku. Pokušaj ponovno.'};
    busy=true;
    try { const result=await connectAutomatic(tabId,url);return {ok:true,message:result.message}; }
    catch(e) { const message='Nije spojeno: '+e.message;if(tabId!=null)setStatus(tabId,{connected:false,message});return {ok:false,message}; }
    finally { busy=false; }
  }
});
setInterval(async () => {
  if (!session || busy) return;
  busy = true;
  const s = session;
  try {
    const tab = await browser.tabs.get(s.tabId);
    if (tab.url !== s.url) throw Error('Promijenio se zadatak. Ponovno spoji karticu.');
    let state = await readState(s.token);
    if (session !== s) return;
    const page=await browser.tabs.sendMessage(s.tabId,{type:'read'});
    if (!page?.ok || typeof page.text!=='string') throw Error(page?.error || 'Uređivač nije dostupan.');
    if (session !== s) return;
    const pageText=normalizedText(page.text);
    const pageChanged=pageText!==s.baseText, codeChanged=state.text!==s.baseText;
    if(pageChanged && codeChanged && pageText!==state.text) throw Error('Kod je izmijenjen na obje strane. Ako želiš zadržati izmjene iz Edgara, spremi ih u VS Code prije ponovnog spajanja.');
    if(pageChanged && !codeChanged){
      const response=await fetch(endpoint+'/edit',{method:'POST',headers:{Authorization:'Bearer '+s.token,'Content-Type':'application/json'},body:JSON.stringify({text:pageText,version:state.version})});
      const updated=await response.json();
      if(!response.ok)throw Error(updated.error || 'Kod nije moguće prenijeti u VS Code.');
      state=updated;
    } else if(codeChanged || state.runId!==s.runId) {
      const result=await browser.tabs.sendMessage(s.tabId,{type:'update',baseText:page.text,text:state.text,run:state.runId!==s.runId});
      if (!result?.ok) throw Error(result?.error || 'Uređivač nije dostupan.');
    }
    s.baseText=normalizedText(state.text);
    if(!pageChanged || codeChanged) s.runId=state.runId;
    s.fileName=state.fileName;
    if (session !== s) return;
    if (s.ackVersion!==state.version && await acknowledge(s.token,state.version)) s.ackVersion=state.version;
    if (session !== s) return;
    setStatus(s.tabId,{connected:true,message:'Uživo: '+(s.fileName || 'odabrana datoteka')});
  } catch(e) {
    if (session===s) { session=null; setStatus(s.tabId,{connected:false,message:'Prekinuto: '+e.message}); }
  } finally { busy=false; }
},800);
