let crossRef = [];
const cache = new Map();

async function loadCrossRef() {
  const res = await fetch('https://aedes-datastandaarden.github.io/vera-openapi/referentiedatacrossreference.html');
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table tbody tr');
  crossRef = [...rows].map(tr => {
    const td = tr.querySelectorAll('td');
    return {
      referentiedata: td[0].textContent.trim(),
      resource: td[2].textContent.trim(),
      entiteit: td[3].textContent.trim(),
      attribuut: td[4].textContent.trim()
    };
  });
}

async function loadReferentiedata(soort) {
  if (cache.has(soort)) return cache.get(soort);
  const res = await fetch(`https://vera-service.azurewebsites.net/api/referentiedata/${soort}`);
  const json = await res.json();
  cache.set(soort, json);
  return json;
}

function uniq(arr) { return [...new Set(arr)].sort(); }

function fillResources() {
  const sel = document.getElementById('sel-resource');
  uniq(crossRef.map(r => r.resource)).forEach(r => sel.add(new Option(r, r)));
}

function fillEntiteiten(resource) {
  const sel = document.getElementById('sel-entiteit');
  sel.length = 0;
  uniq(crossRef.filter(r => r.resource === resource).map(r => r.entiteit))
    .forEach(e => sel.add(new Option(e, e)));
}

function fillAttributen(resource, entiteit) {
  const sel = document.getElementById('sel-attribuut');
  sel.length = 0;
  uniq(crossRef.filter(r => r.resource===resource && r.entiteit===entiteit)
    .map(r => r.attribuut)).forEach(a => sel.add(new Option(a, a)));
}

async function showData(resource, entiteit, attribuut) {
  const x = crossRef.find(r => r.resource===resource && r.entiteit===entiteit && r.attribuut===attribuut);
  if (!x) return;
  const data = await loadReferentiedata(x.referentiedata);
  const rows = data.waarden.map(w => `<tr><td>${w.Code}</td><td>${w.Naam}</td><td>${w.Omschrijving||''}</td></tr>`).join('');
  document.getElementById('results').innerHTML = `<table><tr><th>Code</th><th>Naam</th><th>Omschrijving</th></tr>${rows}</table>`;
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadCrossRef();
  fillResources();

  sel-resource.onchange = e => fillEntiteiten(e.target.value);
  sel-entiteit.onchange = e => fillAttributen(sel-resource.value, e.target.value);
  sel-attribuut.onchange = e => showData(sel-resource.value, sel-entiteit.value, e.target.value);
});
