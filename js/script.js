// 1. FILTRAR NOTICIAS DESDE EL BUSCADOR
function filterNews() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-desc').textContent.toLowerCase();
        
        // Si coincide con el título o la descripción, se muestra; si no, se oculta
        if (title.includes(input) || desc.includes(input)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// 2. AUTO-LIMPIEZA DE NOTICIAS CON MÁS DE 3 DÍAS Y ORDENAMIENTO
document.addEventListener("DOMContentLoaded", () => {
    const ahora = new Date();
    const tresDiasEnMilisegundos = 3 * 24 * 60 * 60 * 1000;

    // Recorremos cada sección o grid de noticias
    const grids = document.querySelectorAll('.grid');

    grids.forEach(grid => {
        const cards = Array.from(grid.querySelectorAll('.card'));

        cards.forEach(card => {
            // Asumimos que cada tarjeta tiene la fecha en formato legible o atributo data-date="YYYY-MM-DD"
            // Ejemplo en HTML: <div class="card" data-date="2026-08-16">
            const fechaStr = card.getAttribute('data-date'); 
            
            if (fechaStr) {
                const fechaNoticia = new Date(fechaStr);
                const diferenciaTiempo = ahora - fechaNoticia;

                // Si pasaron más de 3 días, se borran visualmente de la página
                if (diferenciaTiempo > tresDiasEnMilisegundos) {
                    card.remove();
                }
            }
        });
    });
});
