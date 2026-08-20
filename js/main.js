let todasLasNoticias = [];

document.addEventListener("DOMContentLoaded", function () {
    const urlAPI = "https://script.google.com/macros/s/AKfycbzrN4pskes2eTBGxvuvsPFuKcm3VoIeUyc4FJGG962DkdMf2MYQYSkhBzji40oRmH1p/exec";

    fetch(urlAPI)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) return;
            todasLasNoticias = data; 
            renderizarNoticias(todasLasNoticias);
        })
        .catch(error => console.error('Error al conectar con la API:', error));
});

function obtenerHtmlMultimedia(urlVideo, urlImagen) {
    if (urlVideo && urlVideo.trim() !== "") {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = urlVideo.trim().match(regExp);
        if (match && match[2].length === 11) {
            return `<iframe src="https://www.youtube.com/embed/${match[2]}?rel=0" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>`;
        }
        return `<video src="${urlVideo}" controls style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
    }
    return `<img src="${urlImagen || ''}" alt="Imagen noticia" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
}

function renderizarNoticias(listaParaPintar) {
    const containers = {
        nacionales: document.getElementById('grid-nacionales'),
        internacionales: document.getElementById('grid-internacionales'),
        provinciales: document.getElementById('grid-provinciales'),
        losHits20: document.getElementById('grid-los-hits-20')
    };

    // Limpiar contenedores existentes
    Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });

    listaParaPintar.forEach(noticia => {
        const cat = (noticia.categoria || '').toLowerCase().trim();
        let cont = null;

        if (cat.includes('internacional')) cont = containers.internacionales;
        else if (cat.includes('nacional')) cont = containers.nacionales;
        else if (cat.includes('provincial')) cont = containers.provinciales;
        else if (cat.includes('hits 20')) cont = containers.losHits20;

        if (cont) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-media">${obtenerHtmlMultimedia(noticia.video, noticia.imagen)}</div>
                <div class="card-body">
                    <h5>${noticia.titulo || 'Sin título'}</h5>
                    <p>${noticia.descripcion || ''}</p>
                </div>
            `;
            card.addEventListener('click', () => abrirNoticiaModal(noticia));
            cont.appendChild(card);
        }
    });
}

function abrirNoticiaModal(noticia) {
    const modal = document.getElementById('modal-noticia');
    if (modal) {
        document.getElementById('modal-titulo').innerText = noticia.titulo;
        document.getElementById('modal-cuerpo').innerText = noticia.cuerpo;
        modal.style.display = 'flex';
    }
}
