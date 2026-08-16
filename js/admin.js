document.getElementById('formNoticia').addEventListener('submit', function(e) {
  e.preventDefault();

  var datosNoticia = {
    titulo: document.getElementById('titulo').value,
    imagen: document.getElementById('imagen').value,
    categoria: document.getElementById('categoria').value,
    cuerpo: document.getElementById('cuerpo').value
  };

  fetch("https://script.google.com/macros/s/AKfycbxz4jF6gAN35Myd69T745m8KyJPIf5-Ce0oZOzRFhGpMSctFl50pb8fB1CimuuBS-6S/exec", {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosNoticia)
  })
  .then(() => {
    alert('¡Noticia publicada con éxito!');
    document.getElementById('formNoticia').reset();
  })
  .catch(err => alert('Error al enviar: ' + err));
});
