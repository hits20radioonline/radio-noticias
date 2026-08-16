document.addEventListener("DOMContentLoaded", function () {
  const urlAPI = "https://script.google.com/macros/s/AKfycbyBguwaVlic_j1h_r7l-YDTOybxvquMy5XZXuFC0ysbHZRZR_xW3LlDuQnV7UCWlPn0/exec";

  fetch(urlAPI)
    .then(response => response.json())
    .then(data => {
      const nacionales = document.getElementById('grid-nacionales');
      const internacionales = document.getElementById('grid-internacionales');
      const provinciales = document.getElementById('grid-provinciales');

      if (nacionales) nacionales.innerHTML = '';
      if (internacionales) internacionales.innerHTML = '';
      if (provinciales) provinciales.innerHTML = '';

      if (!Array.isArray(data)) return;

      data.forEach(noticia => {
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
          const card = document.createElement('div');
          card.className = 'card';
          
          let fechaTexto = formatearFechaYHora(noticia.fecha || noticia.Fecha, noticia.hora || noticia.Hora);

          card.innerHTML = `
            <img src="${noticia.imagen || ''}" alt="Imagen noticia" style="width: 100%; height: auto; display: block;">
            <div class="card-body" style="padding: 12px;">
              <div style="font-size: 0.75rem; color: #d9534f; font-weight: bold; margin-bottom: 6px;">${fechaTexto}</div>
              <div class="card-title" style="font-weight: 600; font-size: 0.85rem; line-height: 1.2; height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: #222;">
                ${noticia.titulo || 'Sin título'}
              </div>
            </div>
          `;

          card.addEventListener('click', () => abrirNoticiaModal(noticia));
          contenedor.appendChild(card);
        }
      });

      const urlParams = new URLSearchParams(window.location.search);
      const noticiaId = urlParams.get('id');
      if (noticiaId) {
        const encontrada = data.find(n => String(n.id) === String(noticiaId));
        if (encontrada) abrirNoticiaModal(encontrada);
      }
    })
    .catch(error => console.error('Error al conectar con la API:', error));
});

// Función de formateo blindada contra desfases de zona horaria (ej: -0416)
function formatearFechaYHora(fechaCruda, horaCruda) {
  if (!fechaCruda) return '';

  let fechaStr = String(fechaCruda).trim();
  let fechaLimpia = '';
  let horaFinal = '';

  // 1. Extraer la fecha base de forma limpia (YYYY-MM-DD)
  if (fechaStr.includes('T')) {
    fechaLimpia = fechaStr.split('T')[0];
  } else {
    fechaLimpia = fechaStr.substring(0, 10);
  }

  // 2. Determinar la fuente de la hora (puede venir en horaCruda o pegada en la fecha con 'T')
  let fuenteHora = horaCruda;
  if ((!fuenteHora || String(fuenteHora).trim() === '' || String(fuenteHora).trim() === 'null') && fechaStr.includes('T')) {
    fuenteHora = fechaStr.split('T')[1];
  }

  // 3. Procesar y aislar la hora ignorando cualquier sufijo o código de zona extra
  if (fuenteHora !== undefined && fuenteHora !== null && String(fuenteHora).trim() !== '' && String(fuenteHora).trim() !== 'null') {
    let hStr = String(fuenteHora).trim().replace('Z', '');

    // Buscar estrictamente el formato HH:MM (ej: 16:41)
    let match = hStr.match(/\d{2}:\d{2}/);
    if (match) {
      horaFinal = match[0];
    } else if (hStr.toLowerCase().includes('m')) {
      horaFinal = hStr;
    }
  }

  return horaFinal ? `${fechaLimpia} - ${horaFinal}` : fechaLimpia;
}

function abrirNoticiaModal(noticia) {
  document.getElementById('modal-categoria').innerText = noticia.categoria || '';
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-imagen').src = noticia.imagen || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';

  const elFecha = document.getElementById('modal-fecha');
  if (elFecha) {
    elFecha.innerText = formatearFechaYHora(noticia.fecha || noticia.Fecha, noticia.hora || noticia.Hora);
  }

  document.getElementById('modal-noticia').style.display = 'flex';
  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}
