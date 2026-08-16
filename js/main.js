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

        if (categoria.includes('nacional')) {
          contenedor = nacionales;
        } else if (categoria.includes('internacional')) {
          contenedor = internacionales;
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

          // SOLO IMAGEN, FECHA Y TÍTULO (SIN EXTRACTO DE CUERPO)
          card.innerHTML = `
            <img src="${noticia.imagen || ''}" alt="Imagen noticia">
            <div class="card-body">
              <span class="badge" style="font-size: 0.65rem; padding: 2px 6px; margin-bottom: 5px; display: inline-block;">${fechaTexto}</span>
              <div class="card-title" style="font-weight: bold; font-size: 0.95rem;">${noticia.titulo || 'Sin título'}</div>
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
  // MUESTRA TODO EL CUERPO DE LA NOTICIA SIN RECORTAR
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';
  document.getElementById('modal-noticia').style.display = 'flex';

  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}
