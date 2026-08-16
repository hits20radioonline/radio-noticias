document.getElementById('formNoticia').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtenemos fecha y hora actual en formato local
  var ahora = new Date();
  var fechaActual = ahora.toLocaleDateString('es-AR');
  var horaActual = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Recolectamos los datos del formulario incluyendo fecha y hora
  var datosNoticia = {
    titulo: document.getElementById('titulo').value,
    imagen: document.getElementById('imagen').value,
    categoria: document.getElementById('categoria').value,
    cuerpo: document.getElementById('cuerpo').value,
    fecha: fechaActual,
    hora: horaActual
  };

  // Tu nueva URL de Web App de Google Apps Script actualizada
  var urlScript = "https://script.google.com/macros/s/AKfycbwz7XfGSu11ZwkP-HZ6J7v4kxSaXcnwaYOJvW1XGT6xDRB6aZMPn6GL8VZPcNXFJgWe/exec";

  // Enviamos los datos mediante POST
  fetch(urlScript, {
    method: 'POST',
    mode: 'no-cors', // Evita bloqueos de CORS con Google Apps Script
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosNoticia)
  })
  .then(response => {
    alert('¡Noticia publicada con éxito!');
    document.getElementById('formNoticia').reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Hubo un error al enviar la noticia.');
  });
});
