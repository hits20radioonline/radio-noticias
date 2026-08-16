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

// Función ultra robusta para extraer la fecha y hora sin importar cómo la envíe Google Sheets o el panel
function formatearFechaYHora(fechaCruda, horaCruda) {
  if (!fechaCruda) return '';

  let fechaStr = String(fechaCruda).trim();
  let fechaLimpia = '';
  let horaFinal = '';

  // 1. Extraer la fecha limpia (YYYY-MM-DD)
  if (fechaStr.includes('T')) {
    let partes = fechaStr.split('T');
    fechaLimpia = partes[0];
    if (!horaCruda && partes[1]) {
      let posibleHora = partes[1].substring(0, 8); // Ej: 16:05:00
      if (posibleHora.includes(':')) {
        let hPartes = posibleHora.split(':');
        horaFinal = `${hPartes[0]}:${hPartes[1]}`;
      }
    }
  } else {
    fechaLimpia = fechaStr.substring(0, 10);
  }

  // 2. Si viene hora independiente, la procesamos de forma segura
  if (horaCruda !== undefined && horaCruda !== null && String(horaCruda).trim() !== '') {
    let hStr = String(horaCruda).trim();
    
    if (hStr.includes('T')) {
      let parteT = hStr.split('T')[1];
      if (parteT) {
        let hPartes = parteT.split(':');
        horaFinal = hPartes.length >= 2 ? `${hPartes[0]}:${hPartes[1]}` : parteT.substring(0, 5);
      }
    } else if (hStr.toLowerCase().includes('m') || hStr.includes(':')) {
      // Soporta formatos con "a. m." / "p. m." o estándar
      horaFinal = hStr;
    } else {
      let match = hStr.match(/\d{2}:\d{2}/);
      horaFinal = match ? match[0] : '';
    }
  }

  // Limpiar si hay errores de formato o signos negativos
  if (horaFinal && (horaFinal.startsWith('-') || horaFinal.startsWith('+') || horaFinal.length > 15)) {
    horaFinal = '';
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
