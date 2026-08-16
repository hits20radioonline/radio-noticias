// URL de tu API de Google Sheets
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwTUpXz8BqQMlX3sRcrvPIr2WAtdJ1YW4dNyYgpMSfCkWD2LugvW0iBzPmPpxs9FYyI/exec";

// Función que carga las noticias al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    cargarNoticiasDesdeGoogleSheets();
});

async function cargarNoticiasDesdeGoogleSheets() {
    try {
        const respuesta = await fetch(SHEET_API_URL);
        const noticias = await respuesta.json();

        // Limpiar los contenedores por seguridad
        document.getElementById('grid-nacionales').innerHTML = '';
        document.getElementById('grid-internacionales').innerHTML = '';
        document.getElementById('grid-provinciales').innerHTML = '';

        if (noticias.length === 0) {
            document.getElementById('noticias-container').innerHTML += '<p style="text-align:center; padding:20px;">No hay noticias cargadas todavía.</p>';
            return;
        }

        // Recorrer cada noticia de la planilla y crear su tarjeta
        noticias.forEach(noticia => {
            const categoria = noticia.categoria ? noticia.categoria.toLowerCase().trim() : '';
            const gridId = `grid-${categoria}`;
            const grid = document.getElementById(gridId);

            if (grid) {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'card';
                tarjeta.innerHTML = `
                    <img src="${noticia.imagen}" alt="${noticia.titulo}" style="width:100%; height:140px; object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/300x140?text=Sin+Imagen'">
                    <h3 style="font-size:1rem; margin:10px 0 5px 0;">${noticia.titulo}</h3>
                    <p style="font-size:0.85rem; color:#666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${noticia.cuerpo}</p>
                    <button onclick='abrirNoticiaCompleta(${JSON.stringify(noticia)})' style="background:#e63946; color:white; border:none; padding:6px 12px; margin-top:10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Leer más</button>
                `;
                grid.appendChild(tarjeta);
            }
        });

    } catch (error) {
        console.error("Error al cargar las noticias:", error);
    }
}

// Función para abrir la noticia completa en la ventana flotante (Modal)
function abrirNoticiaCompleta(noticia) {
    document.getElementById('modal-titulo').innerText = noticia.titulo;
    document.getElementById('modal-categoria').innerText = noticia.categoria.toUpperCase();
    document.getElementById('modal-imagen').src = noticia.imagen;
    document.getElementById('modal-cuerpo').innerText = noticia.cuerpo;
    document.getElementById('modal-noticia').style.display = 'flex';
}

function cerrarNoticia() {
    document.getElementById('modal-noticia').style.display = 'none';
}

// Control del Reproductor de Radio (Abre el popup o enlace del streaming)
function abrirPlayer() {
    window.open('player.html', 'ReproductorRadio', 'width=400,height=500');
}
