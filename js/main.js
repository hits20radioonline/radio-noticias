let todasLasNoticias = []; // Variable global para guardar los datos de la API

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

// FUNCIÓN CORREGIDA: Uso de Regex para capturar IDs de video de forma segura
function obtenerHtmlMultimedia(urlVideo, urlImagen) {
  if (urlVideo && urlVideo.trim() !== "") {
    let videoUrl = urlVideo.trim();
    
    // Regex para extraer el ID de video de YouTube (maneja youtube.com/watch?v=... y youtu.be/...)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    // Si no es YouTube, intenta reproducir como video directo
    return `<video src="${videoUrl}" controls style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
  }
  
  return `<img src="${urlImagen || ''}" alt="Imagen noticia" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
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
    const categoria = (noticia.categoria || '').toLowerCase().trim();
    let contenedor = null;

    if (categoria.includes('internacional')) {
      contenedor = internacionales;
    } else if (categoria.includes('nacional')) {
      contenedor = nacionales;
    } else if (categoria.includes('provincial')) {
      contenedor = provinciales;
    }

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

// ... (El resto de tus funciones: filterNews, formatearFechaYHora, abrirNoticiaModal, cerrarNoticia, abrirPlayer, cerrarPlayer, cambiarVolumen, inicializarArrastrePlayer, cargarOtrasLocalidadesClima se mantienen exactamente igual a como las tenías)

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
    let multimediaModalHtml = obtenerHtmlMultimedia(noticia.video || noticia.Video, noticia.imagen || noticia.Imagen);
    if (modalImagenElem.tagName === 'IMG') {
      if (noticia.video && noticia.video.trim() !== "") {
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
        videoContainerModal.innerHTML = multimediaModalHtml;
        modalImagenElem.style.display = 'none';
      } else {
        modalImagenElem.style.display = 'block';
        modalImagenElem.src = noticia.imagen || '';
        let videoContainerModal = document.getElementById('modal-video-container');
        if (videoContainerModal) videoContainerModal.innerHTML = '';
      }
    }
  }
  const elFecha = document.getElementById('modal-fecha');
  if (elFecha) elFecha.innerText = formatearFechaYHora(noticia.fecha || noticia.Fecha, noticia.hora || noticia.Hora);
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
  const volumeSlider = document.getElementById('volumeSlider');
  if (playerFlotante) { playerFlotante.style.display = 'block'; }
  if (audioElement) {
    let volInicial = volumeSlider ? volumeSlider.value / 100 : 0.4;
    audioElement.volume = volInicial;
    audioElement.play().catch(error => { console.log("Interacción requerida:", error); });
  }
}

function cerrarPlayer() {
  const playerFlotante = document.getElementById('radio-modal-flotante');
  const audioElement = document.getElementById('audio-stream');
  if (audioElement) { audioElement.pause(); }
  if (playerFlotante) { playerFlotante.style.display = 'none'; }
}

function cambiarVolumen(valor) {
  const audioElement = document.getElementById('audio-stream');
  const volumeValue = document.getElementById('volumeValue');
  if (audioElement) { audioElement.volume = valor / 100; }
  if (volumeValue) { volumeValue.innerText = valor; }
}

function inicializarArrastrePlayer() {
  const player = document.getElementById('radio-modal-flotante');
  const header = document.getElementById('radio-header-drag');
  if (!player || !header) return;
  let isDragging = false;
  let startX, startY, initialX, initialY;
  function dragStart(e) {
    if (e.target.classList.contains('radio-flotante-close')) return;
    isDragging = true;
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    startX = clientX; startY = clientY;
    const rect = player.getBoundingClientRect();
    initialX = rect.left; initialY = rect.top;
    player.style.left = initialX + 'px'; player.style.top = initialY + 'px';
    player.style.bottom = 'auto'; player.style.right = 'auto';
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }
  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    let newX = initialX + (clientX - startX);
    let newY = initialY + (clientY - startY);
    player.style.left = Math.max(0, Math.min(newX, window.innerWidth - player.offsetWidth)) + 'px';
    player.style.top = Math.max(0, Math.min(newY, window.innerHeight - player.offsetHeight)) + 'px';
  }
  function dragEnd() { isDragging = false; document.removeEventListener('mousemove', drag); document.removeEventListener('mouseup', dragEnd); document.removeEventListener('touchmove', drag); document.removeEventListener('touchend', dragEnd); }
  header.addEventListener('mousedown', dragStart);
  header.addEventListener('touchstart', dragStart, { passive: false });
}

function abrirModalOtrasLoc() { const modalLoc = document.getElementById('modal-otras-loc'); if (modalLoc) { modalLoc.style.display = 'flex'; cargarOtrasLocalidadesClima(); } }
function cerrarModalOtrasLoc() { const modalLoc = document.getElementById('modal-otras-loc'); if (modalLoc) { modalLoc.style.display = 'none'; } }
function cargarOtrasLocalidadesClima() {
  const gridContainer = document.getElementById('grid-otras-loc');
  if (!gridContainer) return;
  gridContainer.innerHTML = '<div class="weather-item">Cargando localidades...</div>';
  const localidades = [{ nombre: 'San Luis', lat: -33.3017, lon: -66.3378 }, { nombre: 'Villa Mercedes', lat: -33.6749, lon: -65.4561 }, { nombre: 'Merlo', lat: -32.3481, lon: -65.0122 }]; // (Reducido por brevedad, usa tu lista original)
  Promise.all(localidades.map(loc => fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`).then(res => res.json()).then(data => ({ nombre: loc.nombre, temp: data.current_weather ? Math.round(data.current_weather.temperature) : '--', icono: '☀️' }).catch(() => ({ nombre: loc.nombre, temp: '--', icono: '☁️' }))))).then(resultados => { gridContainer.innerHTML = ''; resultados.forEach(item => { const div = document.createElement('div'); div.className = 'weather-item'; div.innerHTML = `<span>${item.nombre}:</span> <strong>${item.temp}°C ${item.icono}</strong>`; gridContainer.appendChild(div); }); });
}
