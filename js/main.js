const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz_GDQj0KkYaiI6o5g0EHFgrlzI9wvmXdqQmhIAk8IHfyzXS-sQO9YqH3ybxNHojoi8/exec";

document.addEventListener("DOMContentLoaded", () => {
    cargarNoticiasDesdeGoogleSheets();
});

async function cargarNoticiasDesdeGoogleSheets() {
    try {
        const respuesta = await fetch(SHEET_API_URL);
        const noticias = await respuesta.json();

        const gridNacionales = document.getElementById('grid-nacionales');
        const gridInternacionales = document.getElementById('grid-internacionales');
        const gridProvinciales = document.getElementById('grid-provinciales');

        if (gridNacionales) gridNacionales.innerHTML = '';
        if (gridInternacionales) gridInternacionales.innerHTML = '';
        if (gridProvinciales) gridProvinciales.innerHTML = '';

        if (noticias.length === 0) return;

        // 1. CARGAR TODAS LAS NOTICIAS EN LA PÁGINA PRINCIPAL COMO SIEMPRE
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
                    <button onclick='abrirNoticiaCompleta(${JSON.stringify(noticia).replace(/'/g, "\\'")})' style="background:#e63946; color:white; border:none; padding:6px 12px; margin-top:10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Leer más</button>
                `;
                grid.appendChild(tarjeta);
            }
        });

        // 2. SI HAY UN ID EN LA URL, ABRIR EL MODAL FLOTANTE ENCIMA DE LA PÁGINA CARGADA
        const urlParams = new URLSearchParams(window.location.search);
        const noticiaId = urlParams.get('id');
        if (noticiaId) {
            const noticiaEncontrada = noticias.find(n => String(n.id) === String(noticiaId));
            if (noticiaEncontrada) {
                // Pequeño retraso para asegurar que el DOM cargó bien los elementos del modal
                setTimeout(() => {
                    abrirNoticiaCompleta(noticiaEncontrada);
                }, 200);
            }
        }

    } catch (error) {
        console.error("Error al cargar las noticias:", error);
    }
}

// Función para abrir la noticia completa en la ventana flotante (Modal)
function abrirNoticiaCompleta(noticia) {
    document.getElementById('modal-titulo').innerText = noticia.titulo;
    document.getElementById('modal-categoria').innerText = noticia.categoria ? noticia.categoria.toUpperCase() : '';
    document.getElementById('modal-imagen').src = noticia.imagen;
    document.getElementById('modal-cuerpo').innerText = noticia.cuerpo;
    document.getElementById('modal-noticia').style.display = 'flex';
}

function cerrarNoticia() {
    document.getElementById('modal-noticia').style.display = 'none';
    
    // Opcional: Limpia el ?id= de la barra de direcciones al cerrar el modal para que quede limpia la URL
    if (window.history.pushState) {
        const nuevaUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:nuevaUrl}, '', nuevaUrl);
    }
}

function abrirPlayer() {
    window.open('player.html', 'ReproductorRadio', 'width=400,height=500');
}
