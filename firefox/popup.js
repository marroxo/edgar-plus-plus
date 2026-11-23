const $ = s => document.querySelector(s);
const sync = $('#sync');
$('#version').textContent = browser.runtime.getManifest().version;
function showSync(enabled) {
  sync.checked = enabled;
  $('#sync-help').hidden = !enabled;
  $('#stop').hidden = !enabled;
}
showSync(false);
browser.storage.local.get('syncEnabled').then(s => {
  showSync(s.syncEnabled === true);
  sync.disabled = false;
}).catch(() => { $('#status').textContent = 'Postavku povezivanja nije moguće učitati.'; });
sync.onchange = async () => {
  const enabled = sync.checked;
  if (enabled && !confirm('Želiš li omogućiti povezivanje? Nakon što klikneš Spoji, kod će se razmjenjivati između Edgara i VS Codea na ovom računalu.')) {
    showSync(false);
    return;
  }
  sync.disabled = true;
  try {
    await browser.storage.local.set({syncEnabled: enabled});
    showSync(enabled);
  } catch {
    showSync(!enabled);
    $('#status').textContent = 'Postavku povezivanja nije moguće spremiti.';
  } finally {
    sync.disabled = false;
  }
};
browser.storage.local.get('privacy').then(s=>{$('#privacy').checked=!!s.privacy;});
$('#privacy').onchange=()=>browser.storage.local.set({privacy:$('#privacy').checked});
$('#stop').onclick=async()=>{await browser.runtime.sendMessage({type:'stop'});$('#status').textContent='Odspojeno.';};

const enabled = $('#enabled');
function showEnabled(value) {
  enabled.checked = value;
  $('#features').hidden = !value;
}
browser.storage.local.get('extensionEnabled').then(settings => {
  showEnabled(settings.extensionEnabled !== false);
  enabled.disabled = false;
}).catch(() => { $('#status').textContent = 'Stanje dodatka nije moguće učitati.'; });
enabled.onchange = async () => {
  const value = enabled.checked;
  enabled.disabled = true;
  try {
    await browser.storage.local.set({extensionEnabled: value});
    showEnabled(value);
  } catch {
    showEnabled(!value);
    $('#status').textContent = 'Stanje dodatka nije moguće spremiti.';
  } finally {
    enabled.disabled = false;
  }
};

const burgundy = $('#burgundy');
browser.storage.local.get('burgundySoft').then(settings => {
  burgundy.checked = settings.burgundySoft !== false;
  burgundy.disabled = false;
}).catch(() => { $('#status').textContent = 'Temu nije moguće učitati.'; });
burgundy.onchange = async () => {
  const value = burgundy.checked;
  burgundy.disabled = true;
  try {
    await browser.storage.local.set({burgundySoft: value});
  } catch {
    burgundy.checked = !value;
    $('#status').textContent = 'Temu nije moguće spremiti.';
  } finally {
    burgundy.disabled = false;
  }
};

for (const [selector, key, defaultValue] of [
  ['#space-marks', 'showSpaceMarks', false],
  ['#newline-marks', 'showNewlineMarks', false]
]) {
  const input = $(selector);
  browser.storage.local.get(key).then(settings => {
    input.checked = settings[key] ?? defaultValue;
    input.disabled = false;
  }).catch(() => { $('#status').textContent = 'Postavku ispisa nije moguće učitati.'; });
  input.onchange = async () => {
    const value = input.checked;
    input.disabled = true;
    try {
      await browser.storage.local.set({[key]: value});
    } catch {
      input.checked = !value;
      $('#status').textContent = 'Postavku ispisa nije moguće spremiti.';
    } finally {
      input.disabled = false;
    }
  };
}
