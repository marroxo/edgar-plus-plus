const search = document.getElementById('search');
const results = document.getElementById('results');
const count = document.getElementById('count');
const status = document.getElementById('copy-status');
const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');
let snippets = [];

function render() {
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const matches = snippets.filter(snippet => terms.every(term => snippet.searchText.includes(term)));
  const fragment = document.createDocumentFragment();

  for (const {prefix, description, code} of matches) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const shortcut = document.createElement('code');
    shortcut.textContent = prefix;
    summary.append(shortcut, ' · ', description);

    const example = document.createElement('pre');
    example.textContent = code;

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Kopiraj kod';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        status.textContent = `Kopiran je ${prefix}.`;
        copy.textContent = 'Kopirano';
      } catch {
        status.textContent = 'Kopiranje nije uspjelo. Označi kod i kopiraj ga ručno.';
      }
    });

    details.append(summary, example, copy);
    fragment.append(details);
  }

  results.replaceChildren(fragment);
  count.textContent = matches.length ? `Prikazano ${matches.length} od ${snippets.length}` : 'Nema rezultata.';
}

search.addEventListener('input', render);
fetch('upro-snippets.json')
  .then(response => {
    if (!response.ok) throw Error('Katalog nije dostupan.');
    return response.json();
  })
  .then(catalog => {
    snippets = Object.entries(catalog).map(([name, snippet]) => {
      const {prefix, description, body} = snippet;
      const code = body.join('\n').replace(/\$\{\d+:([^}]+)\}/g, '$1').replace(/\$\d+/g, '');
      return {prefix, description, code, searchText: normalize(`${prefix} ${name} ${description}`)};
    });
    render();
  })
  .catch(() => { count.textContent = 'Katalog prečaca nije moguće učitati.'; });
