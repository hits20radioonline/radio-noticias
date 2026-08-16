document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevaNoticia = {
        titulo: document.getElementById('titulo').value,
        imagen: document.getElementById('imagen').value,
        categoria: document.getElementById('categoria').value,
        cuerpo: document.getElementById('cuerpo').value
    };

    let noticias = JSON.parse(localStorage.getItem('noticias_radio')) || [];
    
    // Agregar al inicio del arreglo para que sea la más reciente
    noticias.unshift(nuevaNoticia);

    localStorage.setItem('noticias_radio', JSON.stringify(noticias));

    alert('¡Noticia publicada con éxito!');
    document.getElementById('newsForm').reset();
});
