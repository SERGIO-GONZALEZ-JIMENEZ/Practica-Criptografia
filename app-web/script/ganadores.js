document.addEventListener('DOMContentLoaded', () => {
    const winnersList = document.getElementById('winners-list');
    const loadingMessage = document.getElementById('loading-message');
    const template = winnersList.querySelector('.template'); // Coge la plantilla

    // Recupera los resultados de sessionStorage
    const resultsData = sessionStorage.getItem('electionResults');

    if (!resultsData) {
        if (loadingMessage) {
            loadingMessage.textContent = 'No se encontraron resultados. Vuelve a finalizar la votación.';
            loadingMessage.classList.add('no-results');
        }
        return;
    }

    try {
        // Parsea el JSON
        const topWinners = JSON.parse(resultsData);

        if (!Array.isArray(topWinners) || topWinners.length === 0) {
             if (loadingMessage) {
                 loadingMessage.textContent = 'No hay votos registrados.';
                 loadingMessage.classList.add('no-results');
             }
             return;
        }

        // Limpia el mensaje de "cargando" si existe
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Muestra solo el top 3 (o menos si hay menos)
        topWinners.slice(0, 3).forEach(winner => {
            // Clona la plantilla si existe
            if (template) {
                const newItem = template.cloneNode(true);
                newItem.style.display = 'flex'; // Hazla visible
                newItem.classList.remove('template'); // Quita la clase template

                // Rellena los datos
                newItem.querySelector('.winner-name').textContent = winner.name || `Candidato ID ${winner.candidateId}`; // Muestra el nombre si existe
                newItem.querySelector('.winner-votes').textContent = `Votos: ${winner.count}`;

                // Añade el elemento a la lista
                winnersList.appendChild(newItem);
            } else {
                 // Fallback si la plantilla no existe: crear elementos directamente
                 const li = document.createElement('li');
                 li.classList.add('winner-item');
                 li.innerHTML = `
                     <div class="winner-info">
                        <span class="winner-name">${winner.name || `Candidato ID ${winner.candidateId}`}</span>
                        <br>
                        <span class="winner-votes">Votos: ${winner.count}</span>
                    </div>`;
                 winnersList.appendChild(li);
            }
        });

    } catch (error) {
        console.error('Error al parsear o mostrar resultados:', error);
        if (loadingMessage) {
            loadingMessage.textContent = 'Error al mostrar los resultados.';
            loadingMessage.classList.add('no-results');
        } else {
             // Si no hay mensaje de carga, añade uno de error
             const errorLi = document.createElement('li');
             errorLi.textContent = 'Error al mostrar los resultados.';
             errorLi.classList.add('no-results');
             winnersList.appendChild(errorLi);
        }
    }
});