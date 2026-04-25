// ===============================
// VERA Referentiedata Mini App
// Werkt op GitHub Pages (CORS-vrij)
// ===============================

const CROSSREF_URL =
  "https://raw.githubusercontent.com/aedes-datastandaarden/vera-openapi/main/referentiedata/crossreference.json";

const REF_API_BASE =
  "https://vera-service.azurewebsites.net/api/referentiedata";

let crossRef = [];
const referentieCache = new Map();

function uniqSorted(arr) {
  return [...new Set(arr)].sort();
}

function clearSelect(sel, placeholder) {
  sel.innerHTML = "";
  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    sel.appendChild(opt);
  }
}

async function loadCrossReference() {
  const res = await fetch(CROSSREF_URL);
  if (!res.ok) throw new Error("Crossreference niet geladen");
  crossRef = await res.json();
}

async function loadReferentiedata(soort) {
  if (referentieCache.has(soort)) return referentieCache.get(soort);
  const res = await fetch(`${REF_API_BASE}/${soort}`);
  if (!res.ok) throw new Error(`Referentiedata ${soort} fout`);
  const json = await res.json();
  referentieCache.set(soort, json);
  return json;
}

function fillResources() {
  const sel = document.getElementById("sel-resource");
  clearSelect(sel, "— Kies een resource —");
  uniqSorted(crossRef.map(r => r.resource).filter(Boolean))
    .forEach(r => sel.appendChild(new Option(r, r)));
}

function fillEntiteiten(resource) {
  const sel = document.getElementById("sel-entiteit");
  clearSelect(sel, "— Kies een entiteit —");
  if (!resource) return;
  uniqSorted(
    crossRef.filter(r => r.resource === resource).map(r => r.entiteit)
  ).forEach(e => sel.appendChild(new Option(e, e)));
}

function fillAttributen(resource, entiteit) {
  const sel = document.getElementById("sel-attribuut");
  clearSelect(sel, "— Kies een attribuut —");
  if (!resource || !entiteit) return;
  uniqSorted(
    crossRef
      .filter(r => r.resource === resource && r.entiteit === entiteit)
      .map(r => r.attribuut)
  ).forEach(a => sel.appendChild(new Option(a, a)));
}

async function showResultaat(resource, entiteit, attribuut) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  if (!resource || !entiteit || !attribuut) return;

  const match = crossRef.find(
    r => r.resource === resource && r.entiteit === entiteit && r.attribuut === attribuut
  );

  if (!match) {
    container.textContent = "Geen referentiedata gevonden.";
    return;
  }

  const data = await loadReferentiedata(match.referentiedata);

  if (!data.waarden || data.waarden.length === 0) {
    container.textContent = "Geen waarden beschikbaar.";
    return;
  }

  const rows = data.waarden.map(w => `
    <tr>
      <td>${w.Code}</td>
      <td>${w.Naam}</td>
      <td>${w.Omschrijving || ""}</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr><th>Code</th><th>Naam</th><th>Omschrijving</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadCrossReference();
    fillResources();
  } catch (e) {
    document.getElementById("results").textContent = "Fout bij laden.";
    console.error(e);
  }

  const selResource = document.getElementById("sel-resource");
  const selEntiteit = document.getElementById("sel-entiteit");
  const selAttribuut = document.getElementById("sel-attribuut");

  selResource.addEventListener("change", e => {
    fillEntiteiten(e.target.value);
    clearSelect(selAttribuut, "— Kies een attribuut —");
  });

  selEntiteit.addEventListener("change", e => {
    fillAttributen(selResource.value, e.target.value);
  });

  selAttribuut.addEventListener("change", e => {
    showResultaat(selResource.value, selEntiteit.value, e.target.value);
  });
});
