document.getElementById('formNoticia').addEventListener('submit', function(e) {
  e.preventDefault();

  var datosNoticia = {
    titulo: document.getElementById('titulo').value,
    imagen: document.getElementById('imagen').value,
    categoria: document.getElementById('categoria').value,
    cuerpo: document.getElementById('cuerpo').value
  };

  fetch("https://script.google.com/macros/s/AKfycbzYGRTbatfZiZyA9t-ypMEEDnO-kcpChIyYi_eV-lYFEeV8ziIx0cPU3pnsI_F3Hg7b/exec", {
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
