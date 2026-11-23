let started = false;
let revision = 0;

function applyEnabled(enabled) {
  if (enabled === started) return;
  started = enabled;
  if (started) startEdgarPlusPlus();
  else document.dispatchEvent(new Event('edgar-vscode-shutdown'));
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.extensionEnabled) return;
  revision++;
  applyEnabled(changes.extensionEnabled.newValue !== false);
});

browser.storage.local.get('extensionEnabled').then(settings => {
  if (revision === 0) applyEnabled(settings.extensionEnabled !== false);
}).catch(() => {});
