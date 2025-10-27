// Elementos del DOM 
const candidateList = document.getElementById("candidates");
const statusEl = document.getElementById("vote-status");
const choiceEl = document.getElementById("chosen-name");
const voteBtn = document.getElementById("confirm");
const resultsBtn = document.getElementById("view-results");
const receiptBtn = document.getElementById("verify-proof");
const logoutBtn = document.getElementById("logout");
const filterInput = document.getElementById("filter");
const finalizeBtn = document.getElementById("finalize");

// Variables Globales 
let candidates = []; // Esta lista se rellenará desde el servidor
let selectedCandidate = null;
let voteSubmitted = false; 

// Renderizar candidatos 
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

// Seleccionar candidato 
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

// Confirmar voto 
voteBtn.onclick = async () => {
  if (!selectedCandidate) {
    alert("Selecciona un candidato antes de votar.");
    return;
  }
  if (voteSubmitted) {
    alert("Ya has enviado tu voto.");
    return;
  }

  // Obtener el token de autenticación que guardamos en el login
  const token = localStorage.getItem('token');
  console.log(token);
  if (!token) {
    alert("Error de autenticación. Vuelve a iniciar sesión.");
    window.location.href = "index.html"; // Redirige al login
    return;
  }

  // Deshabilita el botón para evitar doble clic
  voteBtn.disabled = true;
  statusEl.textContent = "Enviando voto...";

  try {
    // Enviar el voto al servidor (con el token)
    const response = await fetch('http://localhost:3000/api/votar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Envía el token "Bearer" para la autorización
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        candidateId: selectedCandidate.id 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el servidor devuelve un error 
      throw new Error(data.error || 'No se pudo procesar el voto');
    }

    // El servidor aceptó el voto
    voteSubmitted = true;
    statusEl.textContent = "Voto enviado correctamente.";
    statusEl.style.color = "#198754";
    receiptBtn.disabled = false; // Habilita el botón de comprobante

  } catch (err) {
    // Hubo un problema de red o del servidor
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.style.color = "#d00000";
    voteBtn.disabled = false; // Habilita el botón de nuevo para reintentar
  }
};

// Cerrar sesión 
logoutBtn.onclick = () => {
  localStorage.removeItem('token'); 
  window.location.href = "index.html";
};

// Filtrado en tiempo real 
filterInput.addEventListener("input", (e) => {
  renderCandidates(e.target.value);
});

// Función para finalizar votación
finalizeBtn.onclick = async () => {
  console.log("Votón de finalizar votación presionado");

  // Obtenemos token
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Error de autentificación. Vuelve a iniciar sesión");
    window.location.href = "index.html";
    return;
  }

  // Por si acaso le dan sin querer
  if (!confirm("¿Seguro de finalizar votación?")) {
    return;
  }

  // Status processing
  statusEl.textContent = "Finalizando votación y obteniendo resultados...";
  finalizeBtn.disabled = true;

  try {
    // Llama a endpoint
    const response = await fetch('http://localhost:3000/api/finalize-election', {
      method: 'POST', // Post modifica estado
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo finalizar votación');
    }

    console.log("Votación finalizada. Resultados:", data.results);

    sessionStorage.setItem('electionResults', JSON.stringify(data.results));

    window.location.href = "ganadores.html";
  }
  catch (err) {
    console.log('Error al finalizar votación:', err);
    alert(`Error: ${error.message}`);
    statusEl.textContent = `Error al finalizar: ${err.message}`;
    finalizeBtn.disabled = false; // Habilita botón de nuevo
  }

}
// Inicialización 
document.addEventListener("DOMContentLoaded", async () => { // 1. Convertida en 'async'
  
  // 2. Comprobar si el usuario está logueado (si no, patada al login)
  const token = localStorage.getItem('token');
  console.log(token);
  //if (!token) {
   //   alert("No has iniciado sesión.");
   //   window.location.href = "index.html";
     // return; 
  //}

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

  } catch (err) {
      console.error(err);
      alert("Error al cargar la página. Redirigiendo al login.");
      window.location.href = "index.html";
  }
});