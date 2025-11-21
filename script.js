/* MALLA + LOGICA DE CORRELATIVAS, guardado en localStorage */
const STORAGE_KEY = "malla_ing_quimica_progress_v1";

/* Plan de materias (usé los mismos ids y nombres del ejemplo anterior) */
const plan = {
  "1° Año": [
    { id:1, nombre:"Introducción a la Ingeniería Química", req:[] },
    { id:2, nombre:"Ingeniería y Sociedad", req:[] },
    { id:3, nombre:"Álgebra y Geometría Analítica", req:[] },
    { id:4, nombre:"Análisis Matemático I", req:[] },
    { id:5, nombre:"Física I", req:[] },
    { id:6, nombre:"Química", req:[] },
    { id:7, nombre:"Sistemas de Representación", req:[] },
    { id:16, nombre:"Inglés I", req:[] }
  ],
  "2° Año": [
    { id:8, nombre:"Fundamentos de Informática", req:[] },
    { id:9, nombre:"Introducción a Equipos y Procesos", req:[1,6] },
    { id:10, nombre:"Probabilidad y Estadística", req:[] },
    { id:11, nombre:"Química Inorgánica", req:[6] },
    { id:12, nombre:"Análisis Matemático II", req:[3,4] },
    { id:13, nombre:"Física II", req:[4,5] },
    { id:14, nombre:"Química Orgánica", req:[6] },
    { id:16, nombre:"Inglés II", req:[16] } /* si la correlativa es la misma, se considera libre */
  ],
  "3° Año": [
    { id:15, nombre:"Legislación", req:[1,2] },
    { id:17, nombre:"Balances de Masa y Energía", req:[6,7,8,9,13] },
    { id:18, nombre:"Termodinámica", req:[11,12,13] },
    { id:19, nombre:"Matemática Superior Aplicada", req:[12] },
    { id:20, nombre:"Ciencia de los Materiales", req:[9,11,14] },
    { id:21, nombre:"Fisicoquímica", req:[9,12,13] },
    { id:22, nombre:"Fenómenos de Transporte", req:[9,12,13] },
    { id:23, nombre:"Química Analítica", req:[10,11,14] },
    { id:24, nombre:"Microbiología y Química Biológica", req:[11,14] },
    { id:25, nombre:"Química Aplicada", req:[9,11,13,14] }
  ],
  "4° Año": [
    { id:27, nombre:"Diseño, Simulación y Optimización de Procesos", req:[17,19] },
    { id:28, nombre:"Operaciones Unitarias I", req:[17,18,22] },
    { id:29, nombre:"Tecnología de la Energía Térmica", req:[17,18,21] },
    { id:30, nombre:"Economía", req:[9] },
    { id:31, nombre:"Operaciones Unitarias II", req:[18,21,22] },
    { id:32, nombre:"Ingeniería de las Reacciones Químicas", req:[17,18,21,22] },
    { id:33, nombre:"Calidad y Control Estadístico de los Procesos", req:[10] },
    { id:34, nombre:"Organización Industrial", req:[9,29,15] }
  ],
  "5° Año": [
    { id:35, nombre:"Control Automático de Procesos", req:[27,31] },
    { id:36, nombre:"Mecánica Industrial", req:[9,21] },
    { id:37, nombre:"Ingeniería Ambiental", req:[25,28,31,32] },
    { id:38, nombre:"Procesos Biotecnológicos", req:[17,21,22,24] },
    { id:39, nombre:"Higiene y Seguridad en el Trabajo", req:[11,14,17] },
    { id:40, nombre:"Máquinas e Instalaciones Eléctricas", req:[28] },
    { id:41, nombre:"Proyecto Final", req:[27,28,29,31,32,34] }
  ]
};


/* ------- Estado en localStorage ------- 
   guardamos un objeto con propiedades:
     approved: Set de ids aprobadas
*/
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return { approved: new Set() };
    const parsed = JSON.parse(raw);
    return { approved: new Set(parsed.approved || []) };
  }catch(e){
    console.error("Error leyendo almacenamiento:", e);
    return { approved: new Set() };
  }
}
function saveState(state){
  const toSave = { approved: Array.from(state.approved) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

/* ------- utilitarios ------- */
const state = loadState();

function isApproved(id){
  return state.approved.has(id);
}

/* Dada una materia (obj con req[]), devolvemos true si todas sus reqs están aprobadas.
   Nota: si reqs es vacío -> desbloqueada por defecto */
function isUnlocked(mat){
  if(!mat.req || mat.req.length===0) return true;
  // consideramos req que se repiten o inexistentes: todas deben estar aprobadas
  return mat.req.every(r => state.approved.has(r));
}

/* Recalcula todo y actualiza la UI */
function renderAll(){
  const container = document.getElementById("levels-container");
  container.innerHTML = ""; // limpiar

  for(const nivel of Object.keys(plan)){
    const title = document.createElement("div");
    title.className = "level-title";
    title.textContent = nivel;
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    plan[nivel].forEach(mat=>{
      const card = document.createElement("div");
      card.className = "course";
      card.dataset.id = mat.id;

      // estado
      if(isApproved(mat.id)){
        card.classList.add("approved");
      } else if(isUnlocked(mat)){
        card.classList.add("unlocked");
      } else {
        card.classList.add("locked");
      }

      // contenido
      const idEl = document.createElement("div");
      idEl.className = "id";
      idEl.textContent = `${mat.id}`;

      const nameEl = document.createElement("div");
      nameEl.className = "name";
      nameEl.textContent = mat.nombre;

      const reqEl = document.createElement("div");
      reqEl.className = "reqs";
      reqEl.textContent = mat.req && mat.req.length>0 ? `Correlativas: ${mat.req.join(" - ")}` : "Sin correlativas";

      card.appendChild(idEl);
      card.appendChild(nameEl);
      card.appendChild(reqEl);

      // click handler:
      card.addEventListener("click", ()=>{
        if(!isUnlocked(mat)) {
          // si está bloqueada, no hacer nada (podemos agregar un micro-feedback)
          flashLocked(card);
          return;
        }
        toggleApprove(mat.id);
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }
}

/* pequeño feedback si click en bloqueada */
function flashLocked(el){
  el.style.transition = "transform 0.08s";
  el.style.transform = "translateX(-6px)";
  setTimeout(()=> el.style.transform = "translateX(6px)", 80);
  setTimeout(()=> el.style.transform = "", 160);
}

/* togglear aprobado/desaprobado */
function toggleApprove(id){
  if(state.approved.has(id)){
    state.approved.delete(id);
  } else {
    state.approved.add(id);
  }
  saveState(state);
  renderAll();
}

/* reset */
function resetProgress(){
  if(!confirm("¿Segura que querés resetear todo el progreso?")) return;
  state.approved = new Set();
  saveState(state);
  renderAll();
}

/* botón reset */
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("resetBtn").addEventListener("click", resetProgress);
  renderAll();
});
