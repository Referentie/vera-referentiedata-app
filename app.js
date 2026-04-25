const URL = 'https://vera-service.azurewebsites.net/api/referentiedata/EENHEIDSOORT';

async function load() {
  const res = await fetch(URL);
  const json = await res.json();
  const sel = document.getElementById('sel');
  json.waarden.forEach(w => sel.add(new Option(w.Naam, w.Code)));
  document.getElementById('out').textContent = '✅ Referentiedata opgehaald';
}

load().catch(e => document.getElementById('out').textContent = e.toString());