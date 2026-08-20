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
    let videoUrl = urlVideo.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `<iframe src="https://www.youtube.com/embed/${match[2]}?rel=0" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>`;
    }
    return `<video src="${videoUrl}" controls style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
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

  Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });

  listaParaPintar.forEach(noticia => {
    const categoria = (noticia.categoria || '').toLowerCase().trim();
    let contenedor = null;

    if (categoria.includes('internacional')) contenedor = containers.internacionales;
    else if (categoria.includes('nacional')) contenedor = containers.nacionales;
    else if (categoria.includes('provincial')) contenedor = containers.provinciales;
    else if (categoria.includes('los hits 20') || categoria.includes('hits 20')) contenedor = containers.losHits20;

    if (contenedor) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="width: 100%; height: 160px; overflow: hidden; background: #000;">
          ${obtenerHtmlMultimedia(noticia.video, noticia.imagen)}
        </div>
        <div class="card-body" style="padding: 12px;">
          <div style="font-weight: 600; font-size: 0.85rem;">${noticia.titulo || 'Sin título'}</div>
          <p style="font-size: 0.8rem; color: #555;">${noticia.descripcion || ''}</p>
        </div>
      `;
      card.addEventListener('click', () => abrirNoticiaModal(noticia));
      contenedor.appendChild(card);
    }
  });
}

function abrirNoticiaModal(noticia) {
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';
  document.getElementById('modal-noticia').style.display = 'flex';
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
}
