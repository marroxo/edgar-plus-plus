const vscode = require('vscode');
const {runLocalTests} = require('./local-tests');

function openLocalTests(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'c') return vscode.window.showWarningMessage('Otvori C program koji želiš provjeriti.');
  const document = editor.document;
  const panel = vscode.window.createWebviewPanel('edgarLocal', 'Edgar: lokalni testovi', vscode.ViewColumn.Beside, {enableScripts:true});
  const nonce = require('crypto').randomBytes(16).toString('hex');
  panel.webview.html = `<!doctype html><html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'"><style>
body{max-width:900px;margin:0 auto;padding:20px;font-family:var(--vscode-font-family);color:var(--vscode-foreground)}h2{font-size:1.2em}textarea{box-sizing:border-box;width:100%;min-height:90px;resize:vertical;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border, transparent);padding:8px;font-family:monospace}button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:0;padding:8px 12px;cursor:pointer;margin:4px}fieldset{margin:14px 0;border:1px solid var(--vscode-panel-border)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--vscode-textCodeBlock-background);padding:8px}.ok{color:var(--vscode-testing-iconPassed)}.fail{color:var(--vscode-testing-iconFailed)}
</style></head><body><h2>Lokalna provjera</h2><p>Unesi ulaz i očekivani ispis iz primjera. Pri unosu se upisane vrijednosti ne ispisuju automatski: u očekivani ispis stavi samo tekst koji ispisuje program.</p><div id="cases"></div><button id="add">Dodaj primjer</button><button id="run">Pokreni lokalno</button><div id="results" aria-live="polite"></div><script nonce="${nonce}">
const vscode=acquireVsCodeApi(), cases=document.getElementById('cases'), results=document.getElementById('results');
function add(){const field=document.createElement('fieldset');field.innerHTML='<legend>Primjer '+(cases.children.length+1)+'</legend><label>Ulaz<textarea class="input" spellcheck="false"></textarea></label><label>Očekivani ispis<textarea class="expected" spellcheck="false"></textarea></label><button class="remove">Ukloni</button>';field.querySelector('.remove').onclick=()=>field.remove();cases.appendChild(field)}
document.getElementById('add').onclick=add; document.getElementById('run').onclick=()=>{results.textContent='Provjeravam…';vscode.postMessage({type:'run',tests:[...cases.children].map(e=>({input:e.querySelector('.input').value,expected:e.querySelector('.expected').value}))})};
window.addEventListener('message',e=>{const r=e.data;results.replaceChildren();const h=document.createElement('h2');h.textContent=r.ok?'Prošlo '+r.passed+' / '+r.total:r.error;results.appendChild(h);if(r.details){const p=document.createElement('pre');p.textContent=r.details;results.appendChild(p)}for(const [i,t] of (r.results||[]).entries()){const d=document.createElement('section');const title=document.createElement('h3');title.className=t.passed?'ok':'fail';title.textContent='Primjer '+(i+1)+': '+({passed:'Točno','wrong-answer':'Pogrešan ispis','runtime-error':'Greška pri izvođenju',timeout:'Prekoračeno vrijeme','output-limit':'Predug ispis'}[t.status]||t.status);d.appendChild(title);for(const [name,value] of [['Ulaz',t.input],['Dobiveni ispis',t.actual],['Očekivani ispis',t.expected],['Greška',t.stderr]]){if(value===undefined||name==='Greška'&&!value)continue;const label=document.createElement('strong');label.textContent=name;const pre=document.createElement('pre');pre.textContent=value;d.append(label,pre)}results.appendChild(d)}});add();
</script></body></html>`;
  let running = false;
  panel.webview.onDidReceiveMessage(async msg => {
    if (msg.type !== 'run' || running) return;
    running = true;
    try {
      const result = await runLocalTests(document.getText(), msg.tests);
      if (result.results) result.results.forEach((r,i) => r.input = msg.tests[i].input);
      await panel.webview.postMessage(result);
    } finally { running = false; }
  }, null, context.subscriptions);
}
module.exports = {openLocalTests};
