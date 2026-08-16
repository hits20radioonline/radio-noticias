document.addEventListener("DOMContentLoaded", function () {
  const urlAPI = "https://script.google.com/macros/s/AKfycbxz4jF6gAN35Myd69T745m8KyJPIf5-Ce0oZOzRFhGpMSctFl50pb8fB1CimuuBS-6S/exec";

  fetch(urlAPI)
    .then(response => response.json())
    .then(data => {
      const nacionales = document.getElementById('grid-nacionales');
      const internacionales = document.getElementById('grid-internacionales');
      const provinciales = document.getElementById('grid-provinciales');

      if (nacionales) nacionales.innerHTML = '';
      if (internacionales) internacionales.innerHTML = '';
      if (provinciales) provinciales.innerHTML = '';

      data.forEach(noticia => {
        const categoria = (noticia.categoria || '').toLowerCase().trim();
        let contenedor = null;

        if (categoria.includes('nacional')) contenedor = nacionales;
        else if (categoria.includes('internacional')) contenedor = internacionales;
        else if (categoria.includes('provincial')) contenedor = provinciales;

        if (contenedor) {
          const tarjeta = document.createElement('div');
          tarjeta.className = 'tarjeta-noticia';
          tarjeta.innerHTML = `
            <img src="${noticia.imagen || ''}" alt="Imagen noticia">
            <div class="contenido-tarjeta">
              <span class="fecha-tarjeta">${noticia.fecha || ''} - ${noticia.hora || ''}</span>
              <h3>${noticia.titulo || ''}</h3>
              <p>${(noticia.cuerpo || '').substring(0, 90)}...</p>
              <button class="btn-leer" onclick='abrirNoticiaModal(${JSON.stringify(noticia)})'>Leer más</button>
            </div>
          `;
          contenedor.appendChild(tarjeta);
        }
      });

      // Manejo de links compartidos por ID
      const urlParams = new URLSearchParams(window.location.search);
      const noticiaId = urlParams.get('id');
      if (noticiaId) {
        const encontrada = data.find(n => String(n.id) === String(noticiaId));
        if (encontrada) abrirNoticiaModal(encontrada);
      }
    })
    .catch(error => console.error('Error al cargar noticias:', error));
});

function abrirNoticiaModal(noticia) {
  document.getElementById('modal-categoria').innerText = noticia.categoria || '';
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-imagen').src = noticia.imagen || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';
  document.getElementById('modal-noticia').style.display = 'flex';

  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}
