let todasLasNoticias = []; 

document.addEventListener("DOMContentLoaded", function () {
  const urlAPI = "https://script.google.com/macros/s/AKfycbzrN4pskes2eTBGxvuvsPFuKcm3VoIeUyc4FJGG962DkdMf2MYQYSkhBzji40oRmH1p/exec";

  fetch(urlAPI)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) return;
      todasLasNoticias = data; 
      renderizarNoticias(todasLasNoticias);

      const urlParams = new URLSearchParams(window.location.search);
      const noticiaId = urlParams.get('id');
      if (noticiaId) {
        const encontrada = data.find(n => String(n.id) === String(noticiaId));
        if (encontrada) abrirNoticiaModal(encontrada);
      }
    })
    .catch(error => console.error('Error al conectar con la API:', error));

  inicializarArrastrePlayer();
});

function obtenerHtmlMultimedia(urlVideo, urlImagen) {
  let videoLimpio = urlVideo ? String(urlVideo).trim() : "";
  let imagenLimpia = urlImagen ? String(urlImagen).trim() : "";

  const esFacebook = videoLimpio.includes("facebook.com/");
  const esYoutube = videoLimpio.includes("youtube.com/") || videoLimpio.includes("youtu.be/");
  const esMp4 = videoLimpio.endsWith('.mp4');

  if (videoLimpio !== "" && (esFacebook || esYoutube || esMp4)) {
    if (esFacebook) {
      let urlCodificada = encodeURIComponent(videoLimpio);
      return `
        <div style="width: 100%; height: 100%; background: #000; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <iframe 
            src="https://www.facebook.com/plugins/video.php?href=${urlCodificada}&show_text=false&width=500" 
            style="width: 100%; height: 100%; border: none; position: absolute; top: 0; left: 0;" 
            scrolling="no" 
            frameborder="0" 
            allowfullscreen="true" 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>
        </div>`;
    }
    
    if (esYoutube) {
      let vId = videoLimpio.split(/(v=|shorts\/|youtu\.be\/)/)[2]?.split(/[?&]/)[0];
      if (vId) {
        return `<iframe src="https://www.youtube.com/embed/${vId}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>`;
      }
    } 

    if (esMp4) {
      return `<video src="${videoLimpio}" controls style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
    }
  }
  
  return `<img src="${imagenLimpia}" alt="Imagen noticia" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='' ">`;
}

function renderizarNoticias(listaParaPintar) {
  const nacionales = document.getElementById('grid-nacionales');
  const internacionales = document.getElementById('grid-internacionales');
  const provinciales = document.getElementById('grid-provinciales');

  if (nacionales) nacionales.innerHTML = '';
  if (internacionales) internacionales.innerHTML = '';
  if (provinciales) provinciales.innerHTML = '';

  const ahora = new Date();
  const tresDiasEnMilisegundos = 3 * 24 * 60 * 60 * 1000;
  const terminoBusqueda = document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim() : '';

  let listaOrdenada = [...listaParaPintar].sort((a, b) => {
    let fechaA = new Date(a.fecha || a.Fecha).getTime() || 0;
    let fechaB = new Date(b.fecha || b.Fecha).getTime() || 0;
    if (fechaB !== fechaA) return fechaB - fechaA;
    let horaA = a.hora || a.Hora || "00:00";
    let horaB = b.hora || b.Hora || "00:00";
    return horaB.localeCompare(horaA);
  });

  listaOrdenada.forEach(noticia => {
    const categoria = (noticia.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    let contenedor = null;

    if (categoria.includes('internacional')) contenedor = internacionales;
    else if (categoria.includes('nacional')) contenedor = nacionales;
    else if (categoria.includes('provincial')) contenedor = provinciales;

    if (contenedor) {
      let fechaCruda = noticia.fecha || noticia.Fecha;
      let fechaNoticia = new Date(fechaCruda || 0);
      let diferenciaTiempo = ahora.getTime() - fechaNoticia.getTime();
      let esMasDeTresDias = diferenciaTiempo > tresDiasEnMilisegundos;

      if (esMasDeTresDias && !terminoBusqueda) return; 

      const card = document.createElement('div');
      card.className = 'card';
      
      let fechaTexto = formatearFechaYHora(fechaCruda, noticia.hora || noticia.Hora);
      let contenidoMultimediaHtml = obtenerHtmlMultimedia(noticia.video || noticia.Video, noticia.imagen || noticia.Imagen);

      card.innerHTML = `
        <div style="width: 100%; height: 160px; overflow: hidden; background: #000;">
          ${contenidoMultimediaHtml}
        </div>
        <div class="card-body" style="padding: 12px;">
          <div style="font-size: 0.75rem; color: #d9534f; font-weight: bold; margin-bottom: 6px;">${fechaTexto}</div>
          <div class="card-title" style="font-weight: 600; font-size: 0.85rem; line-height: 1.2; height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: #222;">
            ${noticia.titulo || 'Sin título'}
          </div>
          <p class="card-desc" style="font-size: 0.8rem; color: #555; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${noticia.descripcion || ''}</p>
        </div>
      `;

      card.addEventListener('click', () => abrirNoticiaModal(noticia));
      contenedor.appendChild(card);
    }
  });
}

function filterNews() {
  const inputEl = document.getElementById('searchInput');
  if (!inputEl) return;
  const texto = inputEl.value.toLowerCase().trim();
  if (texto === "") {
    renderizarNoticias(todasLasNoticias);
    return;
  }
  const resultados = todasLasNoticias.filter(noticia => 
    (noticia.titulo && noticia.titulo.toLowerCase().includes(texto)) || 
    (noticia.descripcion && noticia.descripcion.toLowerCase().includes(texto)) ||
    (noticia.cuerpo && noticia.cuerpo.toLowerCase().includes(texto))
  );
  renderizarNoticias(resultados);
}

function formatearFechaYHora(fechaCruda, horaCruda) {
  if (!fechaCruda) return '';
  let fechaStr = String(fechaCruda).trim();
  let fechaLimpia = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr.substring(0, 10);
  let fuenteHora = horaCruda;
  if ((!fuenteHora || String(fuenteHora).trim() === '' || String(fuenteHora).trim() === 'null') && fechaStr.includes('T')) {
    fuenteHora = fechaStr.split('T')[1];
  }
  let horaFinal = '';
  if (fuenteHora && String(fuenteHora).trim() !== 'null') {
    let match = String(fuenteHora).match(/\d{2}:\d{2}/);
    horaFinal = match ? match[0] : String(fuenteHora).trim();
  }
  return horaFinal ? `${fechaLimpia} - ${horaFinal}` : fechaLimpia;
}

function abrirNoticiaModal(noticia) {
  document.getElementById('modal-categoria').innerText = noticia.categoria || '';
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';

  const modalImagenElem = document.getElementById('modal-imagen');
  if (modalImagenElem) {
    let videoLimpio = noticia.video || noticia.Video;
    let esVidValido = videoLimpio && (videoLimpio.includes('facebook.com/') || videoLimpio.includes('youtube.com/') || videoLimpio.includes('youtu.be/') || videoLimpio.endsWith('.mp4'));

    let parentModalImg = modalImagenElem.parentNode;
    let videoContainerModal = document.getElementById('modal-video-container');

    if (!videoContainerModal) {
      videoContainerModal = document.createElement('div');
      videoContainerModal.id = 'modal-video-container';
      videoContainerModal.style.width = '100%';
      videoContainerModal.style.height = '300px';
      videoContainerModal.style.maxHeight = '50vh';
      videoContainerModal.style.background = '#000';
      parentModalImg.insertBefore(videoContainerModal, modalImagenElem);
    }

    if (esVidValido) {
      videoContainerModal.innerHTML = obtenerHtmlMultimedia(videoLimpio, noticia.imagen || noticia.Imagen);
      modalImagenElem.style.display = 'none';
    } else {
      videoContainerModal.innerHTML = '';
      modalImagenElem.style.display = 'block';
      modalImagenElem.src = noticia.imagen || noticia.Imagen || '';
    }
  }

  const elFecha = document.getElementById('modal-fecha');
  if (elFecha) elFecha.innerText = formatearFechaYHora(noticia.fecha || noticia.Fecha, noticia.hora || noticia.Hora);

  let modalBody = document.querySelector('#modal-noticia .modal-content') || document.getElementById('modal-cuerpo').parentNode;
  let shareContainer = document.getElementById('modal-share-container');
  if (!shareContainer) {
    shareContainer = document.createElement('div');
    shareContainer.id = 'modal-share-container';
    shareContainer.style.marginTop = '15px';
    shareContainer.style.paddingTop = '10px';
    shareContainer.style.borderTop = '1px solid #eee';
    modalBody.appendChild(shareContainer);
  }
  let linkActual = window.location.origin + window.location.pathname + `?id=${noticia.id}`;
  shareContainer.innerHTML = `
    <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; color: #555;">Compartir esta noticia:</div>
    <div style="display: flex; gap: 8px;">
      <input type="text" readonly value="${linkActual}" id="inputShareLink" style="flex: 1; padding: 6px; font-size: 0.8rem; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9;" onclick="this.select();">
      <button onclick="navigator.clipboard.writeText('${linkActual}'); alert('¡Enlace copiado al portapapeles!');" style="background: #d9534f; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Copiar</button>
    </div>
  `;

  document.getElementById('modal-noticia').style.display = 'flex';
  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}

function abrirPlayer() {
  const playerFlotante = document.getElementById('radio-modal-flotante');
  const audioElement = document.getElementById('audio-stream');
  if (playerFlotante) playerFlotante.style.display = 'block'; 
  if (audioElement) audioElement.play().catch(e => console.log(e));
}

function cerrarPlayer() {
  const playerFlotante = document.getElementById('radio-modal-flotante');
  const audioElement = document.getElementById('audio-stream');
  if (audioElement) audioElement.pause(); 
  if (playerFlotante) playerFlotante.style.display = 'none'; 
}

function cambiarVolumen(valor) {
  const audioElement = document.getElementById('audio-stream');
  const volumeValue = document.getElementById('volumeValue');
  if (audioElement) audioElement.volume = valor / 100;
  if (volumeValue) volumeValue.innerText = valor;
}

function inicializarArrastrePlayer() {
  const player = document.getElementById('radio-modal-flotante');
  const header = document.getElementById('radio-header-drag');
  if (!player || !header) return;
}
