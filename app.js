const STORAGE_KEY = "cubageBoisTerrainV1";
const state = loadState();
let deferredPrompt = null;

const $ = (id) => document.getElementById(id);
const fmt = (n) => (Number(n) || 0).toFixed(3).replace('.', ',');
const num = (id) => Number($(id).value.replace?.(',', '.') ?? $(id).value) || 0;

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { chantier:"", date:new Date().toISOString().slice(0,10), arbres:[] }; }
  catch { return { chantier:"", date:new Date().toISOString().slice(0,10), arbres:[] }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function adrianII(d, h){
  // Adrian II fourni : ((97 - H) / 100)^2 × π × D² / 40000 × H ; k=0
  if(d <= 0 || h <= 0) return 0;
  return Math.pow((97 - h) / 100, 2) * Math.PI * Math.pow(d, 2) / 40000 * h;
}
function adrianI(d, h){
  // V1 terrain : assimilation cylindre sous écorce simple. À ajuster si vous souhaitez votre tarif exact Adrian I.
  if(d <= 0 || h <= 0) return 0;
  return Math.PI * Math.pow(d, 2) / 40000 * h;
}
function computeCurrent(){
  const d = num("diametre");
  const hTotal = num("hauteurTotale");
  const hasSup = $("hasSup").checked;
  const lSup = hasSup ? num("longueurSup") : 0;
  const hRestante = Math.max(hTotal - lSup, 0);
  const volSup = hasSup ? adrianI(d, lSup) : 0;
  const volCourant = adrianII(d, hRestante);
  return { d, hTotal, hasSup, lSup, hRestante, volSup, volCourant, totalBO: volSup + volCourant };
}
function updatePreview(){
  const c = computeCurrent();
  if(!c.d || !c.hTotal){ $("preview").textContent = "Saisissez un diamètre et une hauteur."; return; }
  if(c.lSup > c.hTotal){ $("preview").innerHTML = "⚠️ La longueur de bille supérieure dépasse la hauteur sciable totale."; return; }
  $("preview").innerHTML = `
    <strong>Prévisualisation</strong><br>
    Bille supérieure : ${fmt(c.volSup)} m³<br>
    Reste sciable courant : ${fmt(c.volCourant)} m³<br>
    <strong>Total bois d’œuvre arbre : ${fmt(c.totalBO)} m³</strong><br>
    <small>La tête sera calculée uniquement dans la synthèse finale, par essence : total BO × 1,5.</small>`;
}
function render(){
  $("chantier").value = state.chantier || "";
  $("dateChantier").value = state.date || new Date().toISOString().slice(0,10);
  renderTable(); renderSummary(); updatePreview();
}
function renderTable(){
  const tbody = $("treeTable").querySelector("tbody");
  tbody.innerHTML = state.arbres.map((a,i)=>`
    <tr><td>${i+1}</td><td>${a.essence}</td><td>${a.diametre}</td><td>${a.hauteurTotale}</td><td>${fmt(a.volSup)}</td><td>${fmt(a.volCourant)}</td><td>${fmt(a.totalBO)}</td><td><button class="delete-row" data-i="${i}">×</button></td></tr>
  `).join("");
  document.querySelectorAll('.delete-row').forEach(btn => btn.addEventListener('click', e => { state.arbres.splice(Number(e.target.dataset.i),1); saveState(); render(); }));
}
function renderSummary(){
  const byEss = {};
  for(const a of state.arbres){
    byEss[a.essence] ||= { count:0, sup:0, courant:0, totalBO:0 };
    byEss[a.essence].count += 1;
    byEss[a.essence].sup += a.volSup;
    byEss[a.essence].courant += a.volCourant;
    byEss[a.essence].totalBO += a.totalBO;
  }
  const entries = Object.entries(byEss);
  if(entries.length === 0){ $("summary").innerHTML = "<p>Aucun arbre saisi.</p>"; return; }
  $("summary").innerHTML = `<div class="summary-grid">${entries.map(([ess,s]) => {
    const tete = s.totalBO * 1.5;
    const totalAvecTete = s.totalBO + tete;
    return `<div class="summary-card"><h3>${ess}</h3>
      <div class="kpi"><span>Nombre</span><strong>${s.count}</strong></div>
      <div class="kpi"><span>Qualité supérieure</span><strong>${fmt(s.sup)} m³</strong></div>
      <div class="kpi"><span>Sciage courant</span><strong>${fmt(s.courant)} m³</strong></div>
      <div class="kpi"><span>Total BO</span><strong>${fmt(s.totalBO)} m³</strong></div>
      <div class="kpi"><span>Tête = BO × 1,5</span><strong>${fmt(tete)} m³</strong></div>
      <div class="kpi"><span>Total avec tête</span><strong>${fmt(totalAvecTete)} m³</strong></div>
    </div>`;
  }).join("")}</div>`;
}
function addTree(){
  const c = computeCurrent();
  if(!c.d || !c.hTotal){ alert("Diamètre et hauteur sciable sont obligatoires."); return; }
  if(c.lSup > c.hTotal){ alert("La longueur de bille supérieure ne peut pas dépasser la hauteur sciable totale."); return; }
  const arbre = {
    essence: $("essence").value,
    qualiteCourante: $("qualiteCourante").value,
    qualiteSup: c.hasSup ? $("qualiteSup").value : "",
    diametre: c.d,
    hauteurTotale: c.hTotal,
    longueurSup: c.lSup,
    hauteurRestante: c.hRestante,
    volSup: c.volSup,
    volCourant: c.volCourant,
    totalBO: c.totalBO,
    dateSaisie: new Date().toISOString()
  };
  state.arbres.push(arbre); saveState();
  $("diametre").value = ""; $("hauteurTotale").value = ""; $("longueurSup").value = ""; $("hasSup").checked = false; toggleSup(); render();
}
function exportCsv(){
  const rows = [["Chantier", state.chantier], ["Date", state.date], [], ["N","Essence","Qualité courante","Qualité supérieure","Diamètre cm","Hauteur BO m","Longueur sup m","Volume sup m3","Volume courant m3","Total BO m3"]];
  state.arbres.forEach((a,i)=> rows.push([i+1,a.essence,a.qualiteCourante,a.qualiteSup,a.diametre,a.hauteurTotale,a.longueurSup,a.volSup.toFixed(3),a.volCourant.toFixed(3),a.totalBO.toFixed(3)]));
  rows.push([],["Synthèse par essence"]);
  const byEss = {};
  state.arbres.forEach(a=>{ byEss[a.essence] ||= {count:0,sup:0,courant:0,totalBO:0}; byEss[a.essence].count++; byEss[a.essence].sup+=a.volSup; byEss[a.essence].courant+=a.volCourant; byEss[a.essence].totalBO+=a.totalBO; });
  rows.push(["Essence","Nombre","Volume sup m3","Volume courant m3","Total BO m3","Tête BO x 1,5 m3","Total avec tête m3"]);
  Object.entries(byEss).forEach(([ess,s])=>rows.push([ess,s.count,s.sup.toFixed(3),s.courant.toFixed(3),s.totalBO.toFixed(3),(s.totalBO*1.5).toFixed(3),(s.totalBO*2.5).toFixed(3)]));
  const csv = rows.map(r => r.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(";")).join("\n");
  downloadBlob(csv, `cubage-${safeName(state.chantier || 'chantier')}.csv`, "text/csv;charset=utf-8");
}
function safeName(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function downloadBlob(content, filename, type){
  const blob = new Blob(["\ufeff" + content], {type});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function toggleSup(){ $("supFields").classList.toggle("hidden", !$("hasSup").checked); }

window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $("installBtn").classList.remove('hidden'); });
$("installBtn").addEventListener('click', async () => { if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt = null; }});
$("saveChantierBtn").addEventListener('click',()=>{ state.chantier=$("chantier").value; state.date=$("dateChantier").value; saveState(); render(); });
$("resetBtn").addEventListener('click',()=>{ if(confirm("Créer un nouveau chantier et effacer les arbres saisis ?")){ state.chantier=""; state.date=new Date().toISOString().slice(0,10); state.arbres=[]; saveState(); render(); }});
$("hasSup").addEventListener('change',()=>{toggleSup(); updatePreview();});
["essence","qualiteCourante","diametre","hauteurTotale","qualiteSup","longueurSup"].forEach(id=>$(id).addEventListener('input',updatePreview));
$("addTreeBtn").addEventListener('click',addTree);
$("undoBtn").addEventListener('click',()=>{ state.arbres.pop(); saveState(); render(); });
$("exportCsvBtn").addEventListener('click',exportCsv);
$("printPdfBtn").addEventListener('click',()=>window.print());
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js')); }
render();
