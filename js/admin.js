const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz_GDQj0KkYaiI6o5g0EHFgrlzI9wvmXdqQmhIAk8IHfyzXS-sQO9YqH3ybxNHojoi8/exec";

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = document.querySelector('.btn-submit') || e.target.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.innerText = "Publicando...";
        btnSubmit.disabled = true;
    }

    const titulo = document.getElementById('titulo').value;
    const nuevaNoticia = {
        titulo: titulo,
        imagen: document.getElementById('imagen').value,
        categoria: document.getElementById('categoria').value,
        cuerpo: document.getElementById('cuerpo').value
    };

    try {
        const respuesta = await fetch(SHEET_API_URL, {
            method: 'POST',
            body: JSON.stringify(nuevaNoticia)
        });

        const resultado = await respuesta.json();

        if (resultado.result === "success") {
            document.getElementById('newsForm').reset();
            
            // Generar un enlace amigable o usar la URL base de tu web con el título
            const urlWeb = "https://radio-noticias-sage.vercel.app/";
            
            // Mostrar la sección de éxito con el enlace para compartir
            mostrarVentanaCompartir(titulo, urlWeb);
        } else {
            alert('Hubo un error al guardar en la planilla. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Error de conexión con la base de datos.');
    } finally {
        if (btnSubmit) {
            btnSubmit.innerText = "Publicar Automáticamente";
            btnSubmit.disabled = false;
        }
    }
});

// Función para mostrar la segunda pantalla o cuadro con el enlace para compartir
function mostrarVentanaCompartir(titulo, url) {
    // Verificar si ya existe el contenedor y borrarlo para no duplicar
    let contenedorModal = document.getElementById('modal-compartir');
    if (contenedorModal) contenedorModal.remove();

    contenedorModal = document.createElement('div');
    contenedorModal.id = 'modal-compartir';
    contenedorModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;";

    contenedorModal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:8px; width:90%; max-width:400px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
            <h3 style="color:#2b2b2b; margin-bottom:10px;">¡Noticia Publicada con Éxito!</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Ya está disponible en el portal. Puedes copiar el enlace para compartir:</p>
            <input type="text" id="input-url-compartir" value="${url}" readonly style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:15px; text-align:center; background:#f9f9f9; font-size:0.85rem;">
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="btn-copiar" style="background:#2a9d8f; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">Copiar Enlace</button>
                <button id="btn-cerrar-compartir" style="background:#e63946; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(contenedorModal);

    // Funcionalidad del botón Copiar
    document.getElementById('btn-copiar').addEventListener('click', () => {
        const inputUrl = document.getElementById('input-url-compartir');
        inputUrl.select();
        navigator.clipboard.writeText(inputUrl.value);
        document.getElementById('btn-copiar').innerText = "¡Copiado!";
        setTimeout(() => {
            document.getElementById('btn-copiar').innerText = "Copiar Enlace";
        }, 2000);
    });

    // Funcionalidad del botón Cerrar
    document.getElementById('btn-cerrar-compartir').addEventListener('click', () => {
        contenedorModal.remove();
    });
}
