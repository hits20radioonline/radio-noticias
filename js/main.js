let todasLasNoticias = []; // Variable global para guardar los datos de la API

document.addEventListener("DOMContentLoaded", function () {
  const urlAPI = "https://script.google.com/macros/s/AKfycbyBguwaVlic_j1h_r7l-YDTOybxvquMy5XZXuFC0ysbHZRZR_xW3LlDuQnV7UCWlPn0/exec";

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
});

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

  // --- BLOQUE DE ORDENAMIENTO REFORZADO ---
  let listaOrdenada = [...listaParaPintar].sort((a, b) => {
    let fechaA = new Date(a.fecha || a.Fecha).getTime() || 0;
    let fechaB = new Date(b.fecha || b.Fecha).getTime() || 0;
    
    // Si la fecha es diferente, ordenamos por fecha
    if (fechaB !== fechaA) return fechaB - fechaA;

    // Si la fecha es igual, comparamos la hora (formato HH:MM)
    let horaA = a.hora || a.Hora || "00:00";
    let horaB = b.hora || b.Hora || "00:00";
    return horaB.localeCompare(horaA);
  });
  // ---------------------------------------

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

      card.innerHTML = `
        <img src="${noticia.imagen || ''}" alt="Imagen noticia" style="width: 100%; height: 160px; object-fit: cover; display: block;">
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
  document.getElementById('modal-imagen').src = noticia.imagen || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';

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

// ==========================================
// CONTROLADORES DEL REPRODUCTOR FLOTANTE
// ==========================================
function abrirPlayer() {
  const playerFlotante = document.getElementById('radio-modal-flotante');
  const audioElement = document.getElementById('audio-stream');

  if (playerFlotante) {
    playerFlotante.style.display = 'block'; 
  }
  
  if (audioElement) {
    audioElement.play().catch(error => {
      console.log("El navegador requiere interacción para reproducir automáticamente:", error);
    });
  }
}

function cerrarPlayer() {
  const playerFlotante = document.getElementById('radio-modal-flotante');
  const audioElement = document.getElementById('audio-stream');

  if (audioElement) {
    audioElement.pause(); 
  }

  if (playerFlotante) {
    playerFlotante.style.display = 'none'; 
  }
}

// ==========================================
// CONTROLADORES Y CARGA DEL MODAL DE OTRAS LOCALIDADES
// ==========================================
function abrirModalOtrasLoc() {
  const modalLoc = document.getElementById('modal-otras-loc');
  if (modalLoc) {
    modalLoc.style.display = 'flex';
    cargarOtrasLocalidadesClima();
  }
}

function cerrarModalOtrasLoc() {
  const modalLoc = document.getElementById('modal-otras-loc');
  if (modalLoc) {
    modalLoc.style.display = 'none';
  }
}

function cargarOtrasLocalidadesClima() {
  // Apuntamos al ID correcto que existe en tu HTML: 'grid-otras-loc'
  const gridContainer = document.getElementById('grid-otras-loc');
  if (!gridContainer) return;

  gridContainer.innerHTML = '<div class="weather-item">Cargando localidades...</div>';

  const localidades = [
    { nombre: 'San Luis', lat: -33.3017, lon: -66.3378 },
    { nombre: 'Villa Mercedes', lat: -33.6749, lon: -65.4561 },
    { nombre: 'Merlo', lat: -32.3481, lon: -65.0122 },
    { nombre: 'La Punta', lat: -33.1833, lon: -66.3167 },
    { nombre: 'Juana Koslay', lat: -33.2667, lon: -66.2167 },
    { nombre: 'San Francisco', lat: -32.5833, lon: -65.9500 },
    { nombre: 'Concarán', lat: -32.5599, lon: -65.2531 },
    { nombre: 'Quines', lat: -32.2333, lon: -65.8833 },
    { nombre: 'Villa de la Paz', lat: -32.4167, lon: -65.0500 },
    { nombre: 'Naschel', lat: -32.9167, lon: -65.3833 },
    { nombre: 'Beazley', lat: -33.6000, lon: -66.7833 },
    { nombre: 'Tilisarao', lat: -32.7667, lon: -65.2000 }
  ];

  Promise.all(
    localidades.map(loc => 
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => ({
          nombre: loc.nombre,
          temp: data.current_weather ? Math.round(data.current_weather.temperature) : '--'
        }))
        .catch(() => ({ nombre: loc.nombre, temp: '--' }))
    )
  ).then(resultados => {
    gridContainer.innerHTML = '';
    resultados.forEach(item => {
      const div = document.createElement('div');
      div.className = 'weather-item';
      div.innerHTML = `<span>${item.nombre}</span>: <strong>${item.temp}°C</strong>`;
      gridContainer.appendChild(div);
    });
  });
}
