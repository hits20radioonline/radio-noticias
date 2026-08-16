// Abrir reproductor en una ventana popup pequeña que no interrumpe la navegación
function abrirPlayer() {
    window.open(
        'player.html', 
        'RadioPlayer', 
        'width=350,height=450,resizable=no,scrollbars=no,status=no'
    );
}

// Cargar noticias simuladas o cargadas desde el panel de control
document.addEventListener('DOMContentLoaded', () => {
    cargarNoticias();
});

function cargarNoticias() {
    // Obtener noticias del almacenamiento local (admin)
    const noticiasGuardadas = JSON.parse(localStorage.getItem('noticias_radio')) || obtenerNoticiasDemo();

    const secciones = ['nacionales', 'internacionales', 'provinciales'];

    secciones.forEach(sec => {
        const contenedor = document.getElementById(`grid-${sec}`);
        contenedor.innerHTML = '';

        // Filtrar y tomar solo 3 noticias por sección
        const noticiasCategoria = noticiasGuardadas
            .filter(n => n.categoria === sec)
            .slice(0, 3);

        noticiasCategoria.forEach(noticia => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => verNoticia(noticia);

            card.innerHTML = `
                <img src="${noticia.imagen}" alt="${noticia.titulo}" onerror="this.src='https://via.placeholder.com/300x150?text=Sin+Imagen'">
                <div class="card-body">
                    <div class="card-title">${noticia.titulo}</div>
                    <div class="card-desc">${noticia.cuerpo.substring(0, 60)}...</div>
                </div>
            `;

            contenedor.appendChild(card);
        });
    });
}

function verNoticia(noticia) {
    document.getElementById('modal-categoria').innerText = noticia.categoria;
    document.getElementById('modal-titulo').innerText = noticia.titulo;
    document.getElementById('modal-imagen').src = noticia.imagen;
    document.getElementById('modal-cuerpo').innerText = noticia.cuerpo;
    document.getElementById('modal-noticia').style.display = 'flex';
}

function cerrarNoticia() {
    document.getElementById('modal-noticia').style.display = 'none';
}

// Datos de demostración iniciales para que la web nunca esté vacía
function obtenerNoticiasDemo() {
    return [
        { categoria: 'nacionales', titulo: 'Noticia Nacional 1', imagen: '', cuerpo: 'Descripción detallada de la noticia nacional 1.' },
        { categoria: 'nacionales', titulo: 'Noticia Nacional 2', imagen: '', cuerpo: 'Descripción detallada de la noticia nacional 2.' },
        { categoria: 'nacionales', titulo: 'Noticia Nacional 3', imagen: '', cuerpo: 'Descripción detallada de la noticia nacional 3.' },
        { categoria: 'internacionales', titulo: 'Noticia Internacional 1', imagen: '', cuerpo: 'Descripción de la noticia internacional 1.' },
        { categoria: 'internacionales', titulo: 'Noticia Internacional 2', imagen: '', cuerpo: 'Descripción de la noticia internacional 2.' },
        { categoria: 'internacionales', titulo: 'Noticia Internacional 3', imagen: '', cuerpo: 'Descripción de la noticia internacional 3.' },
        { categoria: 'provinciales', titulo: 'Noticia Provincial 1', imagen: '', cuerpo: 'Descripción de la noticia provincial 1.' },
        { categoria: 'provinciales', titulo: 'Noticia Provincial 2', imagen: '', cuerpo: 'Descripción de la noticia provincial 2.' },
        { categoria: 'provinciales', titulo: 'Noticia Provincial 3', imagen: '', cuerpo: 'Descripción de la noticia provincial 3.' }
    ];
}
