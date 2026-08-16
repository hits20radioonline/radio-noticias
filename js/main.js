document.addEventListener("DOMContentLoaded", function () {
  // URL de tu Web App de Google Apps Script (la misma que usas en el admin)
  const urlAPI = "https://script.google.com/macros/s/AKfycbwz7XfGSu11ZwkP-HZ6J7v4kxSaXcnwaYOJvW1XGT6xDRB6aZMPn6GL8VZPcNXFJgWe/exec";

  fetch(urlAPI)
    .then(response => response.json())
    .then(data => {
      // Limpiamos los contenedores por si acaso
      document.getElementById('grid-nacionales').innerHTML = '';
      document.getElementById('grid-internacionales').innerHTML = '';
      document.getElementById('grid-provinciales').innerHTML = '';

      // Recorremos las noticias obtenidas de Google Sheets
      data.forEach(noticia => {
        const categoria = (noticia.categoria || '').toLowerCase().trim();
        let contenedorId = '';

        if (categoria.includes('nacional')) {
          contenedorId = 'grid-nacionales';
        } else if (categoria.includes('internacional')) {
          contenedorId = 'grid-internacionales';
        } else if (categoria.includes('provincial')) {
          contenedorId = 'grid-provinciales';
        }

        const contenedor = document.getElementById(contenedorId);
        if (contenedor) {
          const tarjeta = document.createElement('div');
          tarjeta.className = 'tarjeta-noticia';
          tarjeta.innerHTML = `
            <img src="${noticia.imagen || 'https://via.placeholder.com/300'}" alt="Imagen noticia">
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

      // Verificar si la URL trae un parámetro de ID para abrir una noticia directamente al compartir
      const urlParams = new URLSearchParams(window.location.search);
      const noticiaId = urlParams.get('id');
      if (noticiaId) {
        const encontrada = data.find(n => String(n.id) === String(noticiaId));
        if (encontrada) {
          abrirNoticiaModal(encontrada);
        }
      }
    })
    .catch(error => console.error('Error al cargar las noticias:', error));
});

// Función para abrir la noticia en la ventana modal y actualizar el link compartido
function abrirNoticiaModal(noticia) {
  document.getElementById('modal-categoria').innerText = noticia.categoria || '';
  document.getElementById('modal-titulo').innerText = noticia.titulo || '';
  document.getElementById('modal-imagen').src = noticia.imagen || '';
  document.getElementById('modal-cuerpo').innerText = noticia.cuerpo || '';
  
  document.getElementById('modal-noticia').style.display = 'flex';

  // Cambiar la URL del navegador con el ID único para que se pueda compartir el link directo
  const nuevaURL = `${window.location.pathname}?id=${noticia.id}`;
  window.history.pushState({ path: nuevaURL }, '', nuevaURL);
}

// Función para cerrar el modal
function cerrarNoticia() {
  document.getElementById('modal-noticia').style.display = 'none';
  // Restaurar la URL principal sin el ID al cerrar
  window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
}
