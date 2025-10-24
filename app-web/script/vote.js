// --- Datos simulados ---
const candidates = [
  { id: 1, name: "Ana López", party: "Futuro Verde", color: "#16a34a" },
  { id: 2, name: "Carlos Pérez", party: "Innovación Ciudadana", color: "#2563eb" },
  { id: 3, name: "Lucía Torres", party: "Unión Democrática", color: "#9333ea" },
  { id: 4, name: "Miguel García", party: "Avance Popular", color: "#f59e0b" },
  { id: 5, name: "Sara Fernández", party: "Renovación Cívica", color: "#e11d48" },
  { id: 6, name: "Javier Soto", party: "Movimiento Solidario", color: "#0d9488" },
  { id: 7, name: "Paula Martín", party: "Nuevo Horizonte", color: "#7c3aed" },
  { id: 8, name: "Andrés Ramírez", party: "Fuerza del Pueblo", color: "#64748b" },
  { id: 9, name: "Elena Ríos", party: "Avanzar Juntos", color: "#0284c7" },
  { id: 10, name: "Diego Navarro", party: "Compromiso Social", color: "#ca8a04" }
];

let selectedCandidate = null;
let voteSubmitted = false;

// --- Elementos del DOM ---
const candidateList = document.getElementById("candidates");
const statusEl = document.getElementById("vote-status");
const choiceEl = document.getElementById("chosen-name");
const voteBtn = document.getElementById("confirm");
const resultsBtn = document.getElementById("view-results");
const receiptBtn = document.getElementById("verify-proof");
const logoutBtn = document.getElementById("logout");
const filterInput = document.getElementById("filter");

// --- Renderizar candidatos ---
function renderCandidates(filter = "") {
  candidateList.innerHTML = ""; // limpiar contenedor
  const lowerFilter = filter.toLowerCase();

  candidates
    .filter(c =>
      c.name.toLowerCase().includes(lowerFilter) ||
      c.party.toLowerCase().includes(lowerFilter)
    )
    .forEach((c) => {
      const card = document.createElement("div");
      card.classList.add("candidate"); 
      card.innerHTML = `
        <div class="candidate-head">
          <div class="avatar" style="background-color:${c.color}">${c.name[0]}</div>
          <div>
            <div class="candidate-name">${c.name}</div>
            <div class="candidate-party">${c.party}</div>
          </div>
        </div>
      `;
      card.onclick = () => selectCandidate(c, card);
      if (selectedCandidate && selectedCandidate.id === c.id) {
        card.classList.add("selected");
      }
      candidateList.appendChild(card);
    });
}

// --- Seleccionar candidato ---
function selectCandidate(candidate, card) {
  if (voteSubmitted) return;

  document.querySelectorAll(".candidate").forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");

  selectedCandidate = candidate;
  choiceEl.textContent = candidate.name;
  choiceEl.style.backgroundColor = candidate.color;
  statusEl.textContent = "Listo para enviar voto";
  statusEl.style.color = "#7C3AED";
  voteBtn.disabled = false;
}

// --- Confirmar voto ---
voteBtn.onclick = () => {
  if (!selectedCandidate) {
    statusEl.textContent = "Selecciona un candidato antes de votar.";
    statusEl.style.color = "#d00000";
    return;
  }
  if (voteSubmitted) {
    statusEl.textContent = "Ya has enviado tu voto.";
    statusEl.style.color = "#555";
    return;
  }

  voteSubmitted = true;
  statusEl.textContent = "Voto enviado correctamente.";
  statusEl.style.color = "#198754";
  voteBtn.disabled = true;
};

// --- Obtener comprobante ---
receiptBtn.onclick = () => {
  if (!voteSubmitted) {
    alert("Debes emitir tu voto antes de obtener el comprobante.");
    return;
  }
  alert(`Comprobante generado: Has votado por ${selectedCandidate.name}.`);
};

// --- Ver resultados ---
resultsBtn.onclick = () => {
  alert(
    "Resultados parciales:\n\n" +
      "Ana López - 15%\nCarlos Pérez - 13%\nLucía Torres - 11%\nMiguel García - 10%\n" +
      "Sara Fernández - 9%\nJavier Soto - 8%\nPaula Martín - 8%\nAndrés Ramírez - 7%\n" +
      "Elena Ríos - 10%\nDiego Navarro - 9%"
  );
};

// --- Cerrar sesión ---
logoutBtn.onclick = () => {
  window.location.href = "index.html";
};

// --- Simular usuario ---
function simulateUser() {
  const btn = document.getElementById("logout");
  btn.textContent = "Juan Pérez ▾";
}

// --- Filtrado en tiempo real ---
filterInput.addEventListener("input", (e) => {
  renderCandidates(e.target.value);
});

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  renderCandidates();
  simulateUser();
});
