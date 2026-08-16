document.addEventListener("DOMContentLoaded", function () {
  const urlAPI = "https://script.google.com/macros/s/AKfycbzYGRTbatfZiZyA9t-ypMEEDnO-kcpChIyYi_eV-lYFEeV8ziIx0cPU3pnsI_F3Hg7b/exec";

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

        // IMPORTANTE: Evaluamos "internacional" primero para que no sea interceptado por "nacional"
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
          
          let fechaTexto = '';
          if (noticia.fecha) {
            let fechaLimpia = String(noticia.fecha).includes('T') ? noticia.fecha.split('T')[0] : noticia.fecha;
            fechaTexto = fechaLimpia;
            if (noticia.hora) {
              fechaTexto += ` - ${noticia.hora}`;
            }
          }

          // TARJETA PRINCIPAL CON FECHA Y HORA VISIBLES DIRECTAMENTE
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

function abrirNoticiaModal(noticia) {
  document.getElementById('modal-categoria').innerText = noticia.categoria || '';
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-imagen').src = noticia.imagen || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';

  // MUESTRA LA FECHA Y HORA EN EL MODAL FLOTANTE
  const elFecha = document.getElementById('modal-fecha');
  if (elFecha) {
    let fechaTexto = '';
    if (noticia.fecha) {
      let fechaLimpia = String(noticia.fecha).includes('T') ? noticia.fecha.split('T')[0] : noticia.fecha;
      fechaTexto = fechaLimpia;
      if (noticia.hora) {
        fechaTexto += ` - ${noticia.hora}`;
      }
    }
    elFecha.innerText = fechaTexto;
  }

  document.getElementById('modal-noticia').style.display = 'flex';

  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}
