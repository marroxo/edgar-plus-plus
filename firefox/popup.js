const $ = s => document.querySelector(s);
browser.storage.local.get('privacy').then(s=>{$('#privacy').checked=!!s.privacy;});
$('#privacy').onchange=()=>browser.storage.local.set({privacy:$('#privacy').checked});
$('#stop').onclick=async()=>{await browser.runtime.sendMessage({type:'stop'});$('#status').textContent='Odspojeno.';};
