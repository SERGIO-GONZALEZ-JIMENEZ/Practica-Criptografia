// --- Elementos del DOM (igual que antes) ---
const candidateList = document.getElementById("candidates");
const statusEl = document.getElementById("vote-status");
const choiceEl = document.getElementById("chosen-name");
const voteBtn = document.getElementById("confirm");
const resultsBtn = document.getElementById("view-results");
const receiptBtn = document.getElementById("verify-proof");
const logoutBtn = document.getElementById("logout");
const filterInput = document.getElementById("filter");

// --- Variables Globales ---
let candidates = []; // Esta lista se rellenará desde el servidor
let selectedCandidate = null;
let voteSubmitted = false; // (Deberías comprobar esto también en el servidor)

// --- Renderizar candidatos (casi igual) ---
function renderCandidates(filter = "") {
  candidateList.innerHTML = "";
  const lowerFilter = filter.toLowerCase();

  candidates
    .filter(c =>
      // Asumimos que la tabla 'candidate' tiene 'full_name' y 'party'
      c.full_name.toLowerCase().includes(lowerFilter) || 
      c.party.toLowerCase().includes(lowerFilter)
    )
    .forEach((c) => {
      const card = document.createElement("div");
      card.classList.add("candidate");
      card.innerHTML = `
        <div class="candidate-head">
          <div class="avatar" style="background-color:${c.color || '#64748b'}">${c.full_name[0]}</div>
          <div>
            <div class="candidate-name">${c.full_name}</div>
            <div class="candidate-party">${c.party}</div>
          </div>
        </div>
      `;
      // Pasamos el objeto 'c' completo
      card.onclick = () => selectCandidate(c, card); 
      if (selectedCandidate && selectedCandidate.id === c.id) {
        card.classList.add("selected");
      }
      candidateList.appendChild(card);
    });
}

// --- Seleccionar candidato (casi igual) ---
function selectCandidate(candidate, card) {
  if (voteSubmitted) return;

  document.querySelectorAll(".candidate").forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");

  selectedCandidate = candidate;
  choiceEl.textContent = candidate.full_name;
  choiceEl.style.backgroundColor = candidate.color || '#64748b';
  statusEl.textContent = "Listo para enviar voto";
  statusEl.style.backgroundColor = ""; // Limpia el color de fondo
  statusEl.style.color = "#7C3AED";
  voteBtn.disabled = false;
}

// --- Confirmar voto (¡AQUÍ ESTÁ EL CAMBIO!) ---
voteBtn.onclick = async () => { // 1. Convertida en 'async'
  if (!selectedCandidate) {
    alert("Selecciona un candidato antes de votar.");
    return;
  }
  if (voteSubmitted) {
    alert("Ya has enviado tu voto.");
    return;
  }

  // 2. Obtener el token de autenticación que guardamos en el login
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Error de autenticación. Vuelve a iniciar sesión.");
    window.location.href = "index.html"; // Redirige al login
    return;
  }

  // Deshabilita el botón para evitar doble clic
  voteBtn.disabled = true;
  statusEl.textContent = "Enviando voto...";

  try {
    // 3. Enviar el voto al servidor (con el token)
    const response = await fetch('http://localhost:3000/api/votar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ¡Importante! Envía el token "Bearer" para la autorización
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        // Asume que la ID del candidato está en 'selectedCandidate.id'
        candidateId: selectedCandidate.id 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el servidor devuelve un error (ej. 403 Token inválido, 500 error)
      throw new Error(data.error || 'No se pudo procesar el voto');
    }

    // 4. Éxito: El servidor aceptó el voto
    voteSubmitted = true;
    statusEl.textContent = "Voto enviado correctamente.";
    statusEl.style.color = "#198754";
    receiptBtn.disabled = false; // Habilita el botón de comprobante

  } catch (err) {
    // 5. Error: Hubo un problema de red o del servidor
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.style.color = "#d00000";
    voteBtn.disabled = false; // Habilita el botón de nuevo para reintentar
  }
};

// --- Cerrar sesión ---
logoutBtn.onclick = () => {
  localStorage.removeItem('token'); // ¡Importante! Borra el token
  window.location.href = "index.html";
};

// --- Filtrado en tiempo real (igual) ---
filterInput.addEventListener("input", (e) => {
  renderCandidates(e.target.value);
});

// --- Inicialización (¡AQUÍ ESTÁ EL CAMBIO!) ---
document.addEventListener("DOMContentLoaded", async () => { // 1. Convertida en 'async'
  
  // 2. Comprobar si el usuario está logueado (si no, patada al login)
  const token = localStorage.getItem('token');
  if (!token) {
      alert("No has iniciado sesión.");
      window.location.href = "index.html";
      return; 
  }

  try {
    // 3. Pedir los candidatos al servidor
    const response = await fetch('http://localhost:3000/api/candidates', {
      headers: {
        // (Opcional, pero bueno si la ruta de candidatos está protegida)
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
        throw new Error('No se pudieron cargar los candidatos');
    }

    candidates = await response.json(); // 4. Rellena la lista global
    
    renderCandidates(); // 5. Renderiza la lista obtenida
    // simulateUser(); // (Ya no necesitas simular)
    
    // (Podrías decodificar el token para poner el nombre de usuario real)

  } catch (err) {
      console.error(err);
      alert("Error al cargar la página. Redirigiendo al login.");
      window.location.href = "index.html";
  }
});