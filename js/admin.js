// URL de tu API de Google Sheets ACTUALIZADA
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz_GDQj0KkYaiI6o5g0EHFgrlzI9wvmXdqQmhIAk8IHfyzXS-sQO9YqH3ybxNHojoi8/exec";

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = document.querySelector('.btn-submit') || e.target.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.innerText = "Publicando...";
        btnSubmit.disabled = true;
    }

    const nuevaNoticia = {
        titulo: document.getElementById('titulo').value,
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
            alert('¡Noticia publicada con éxito en Google Sheets!');
            document.getElementById('newsForm').reset();
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
