const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz_GDQj0KkYaiI6o5g0EHFgrlzI9wvmXdqQmhIAk8IHfyzXS-sQO9YqH3ybxNHojoi8/exec";

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = document.querySelector('.btn-submit') || e.target.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.innerText = "Publicando...";
        btnSubmit.disabled = true;
    }

    const titulo = document.getElementById('titulo').value;
    const cuerpo = document.getElementById('cuerpo').value;
    const imagen = document.getElementById('imagen').value;
    const categoria = document.getElementById('categoria').value;

    const nuevaNoticia = {
        titulo: titulo,
        imagen: imagen,
        categoria: categoria,
        cuerpo: cuerpo
    };

    try {
        const respuesta = await fetch(SHEET_API_URL, {
            method: 'POST',
            body: JSON.stringify(nuevaNoticia)
        });

        const resultado = await respuesta.json();

        if (resultado.result === "success") {
            document.getElementById('newsForm').reset();
            
            // Como Apps Script crea el ID basado en la fecha actual al guardar, 
            // simulamos el enlace directo para la última noticia publicada
            const idSimulado = new Date().getTime();
            const urlNoticia = `https://radio-noticias-sage.vercel.app/index.html?id=${idSimulado}`;
            
            mostrarVentanaCompartir(titulo, urlNoticia);
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

function mostrarVentanaCompartir(titulo, url) {
    let contenedorModal = document.getElementById('modal-compartir');
    if (contenedorModal) contenedorModal.remove();

    const textoWhatsApp = encodeURIComponent(`📰 *${titulo}*\n\nLeé la noticia completa acá:\n${url}`);

    contenedorModal = document.createElement('div');
    contenedorModal.id = 'modal-compartir';
    contenedorModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;";

    contenedorModal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:8px; width:90%; max-width:450px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
            <h3 style="color:#2b2b2b; margin-bottom:10px;">¡Noticia Publicada con Éxito!</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Enlace directo generado para tu publicación:</p>
            <input type="text" id="input-url-compartir" value="${url}" readonly style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:15px; text-align:center; background:#f9f9f9; font-size:0.85rem;">
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button id="btn-copiar" style="background:#2a9d8f; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">Copiar Enlace Directo</button>
                <a href="https://api.whatsapp.com/send?text=${textoWhatsApp}" target="_blank" style="background:#25d366; color:white; text-decoration:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold; display:block;">Compartir en WhatsApp</a>
                <button id="btn-cerrar-compartir" style="background:#e63946; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; margin-top:5px;">Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(contenedorModal);

    document.getElementById('btn-copiar').addEventListener('click', () => {
        const inputUrl = document.getElementById('input-url-compartir');
        inputUrl.select();
        navigator.clipboard.writeText(inputUrl.value);
        document.getElementById('btn-copiar').innerText = "¡Enlace Copiado!";
        setTimeout(() => {
            document.getElementById('btn-copiar').innerText = "Copiar Enlace Directo";
        }, 2000);
    });

    document.getElementById('btn-cerrar-compartir').addEventListener('click', () => {
        contenedorModal.remove();
    });
}
