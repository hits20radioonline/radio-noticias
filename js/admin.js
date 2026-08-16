document.getElementById('formNoticia').addEventListener('submit', function(e) {
  e.preventDefault();

  var datosNoticia = {
    titulo: document.getElementById('titulo').value,
    imagen: document.getElementById('imagen').value,
    categoria: document.getElementById('categoria').value,
    cuerpo: document.getElementById('cuerpo').value
  };

  fetch("https://script.google.com/macros/s/AKfycbwz7XfGSu11ZwkP-HZ6J7v4kxSaXcnwaYOJvW1XGT6xDRB6aZMPn6GL8VZPcNXFJgWe/exec", {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosNoticia)
  })
  .then(() => {
    alert('Noticia enviada');
    document.getElementById('formNoticia').reset();
  })
  .catch(err => alert('Error: ' + err));
});
