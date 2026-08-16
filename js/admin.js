document.getElementById('formNoticia').addEventListener('submit', function(e) {
  e.preventDefault();

  // Recolectamos los datos del formulario
  var titulo = document.getElementById('titulo').value;
  var imagen = document.getElementById('imagen').value;
  var categoria = document.getElementById('categoria').value;
  var cuerpo = document.getElementById('cuerpo').value;

  var datosNoticia = {
    titulo: titulo,
    imagen: imagen,
    categoria: categoria,
    cuerpo: cuerpo
  };

  // URL de tu Web App de Google Apps Script
  var urlScript = "https://script.google.com/macros/s/AKfycbwz7XfGSu11ZwkP-HZ6J7v4kxSaXcnwaYOJvW1XGT6xDRB6aZMPn6GL8VZPcNXFJgWe/exec";

  // Enviamos los datos mediante POST
  fetch(urlScript, {
    method: 'POST',
    mode: 'no-cors', // Necesario para evitar bloqueos de CORS con Google Apps Script
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosNoticia)
  })
  .then(response => {
    alert('¡Noticia enviada con éxito!');
    document.getElementById('formNoticia').reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Hubo un error al enviar la noticia.');
  });
});
