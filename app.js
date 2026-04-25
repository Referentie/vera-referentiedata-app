let data;

fetch('data.json')
  .then(r => r.json())
  .then(json => {
    data = json;
    fillResources();
  });

function uniq(arr) { return [...new Set(arr)]; }

function fillResources() {
  const sel = document.getElementById('resource');
  uniq(data.map(d => d.resource)).forEach(v => sel.add(new Option(v, v)));
}

document.getElementById('resource').onchange = e => {
  const sel = document.getElementById('entiteit');
  sel.length = 0;
  uniq(data.filter(d => d.resource === e.target.value).map(d => d.entiteit))
    .forEach(v => sel.add(new Option(v, v)));
};

document.getElementById('entiteit').onchange = e => {
  const r = resource.value;
  const sel = document.getElementById('attribuut');
  sel.length = 0;
  uniq(data.filter(d => d.resource===r && d.entiteit===e.target.value)
    .map(d => d.attribuut))
    .forEach(v => sel.add(new Option(v, v)));
};

document.getElementById('attribuut').onchange = e => {
  const r = resource.value;
  const en = entiteit.value;
  const match = data.find(d => d.resource===r && d.entiteit===en && d.attribuut===e.target.value);
  const rows = match.waarden.map(w => `<tr><td>${w.Code}</td><td>${w.Naam}</td></tr>`).join('');
  result.innerHTML = `<table><tr><th>Code</th><th>Naam</th></tr>${rows}</table>`;
};
