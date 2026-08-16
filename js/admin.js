const urlAPI = "https://script.google.com/macros/s/AKfycbybrDtc_xXoIYgG56TflhwSpz7ijU2bhRrGQUCdH1XPV-2phGvZ5FW2XbWSPY-LKMQj/exec";

document.addEventListener("DOMContentLoaded", function () {
    cargarNoticiasAdmin();

    document.getElementById('form-admin-noticia').addEventListener('submit', function (e) {
        e.preventDefault();
        
        const id = document.getElementById('noticia-id').value;
        const titulo = document.getElementById('admin-titulo').value;
        const imagen = document.getElementById('admin-imagen').value;
        const categoria = document.getElementById('admin-categoria').value;
        const cuerpo = document.getElementById('admin-cuerpo').value;

        const action = id ? "update" : "create";
        const datos = { action, id, titulo, imagen, categoria, cuerpo };

        fetch(urlAPI, {
            method: 'POST',
            body: JSON.stringify(datos)
        })
        .then(res => res.json())
        .then(data => {
            if (data.resultado === "success") {
                alert(id ? "Noticia actualizada con éxito" : "Noticia publicada con éxito");
                
                const noticiaIdFinal = id || data.id;
                const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
                const linkCompleto = `${baseUrl}?id=${noticiaIdFinal}`;

                document.getElementById('input-link-compartir').value = linkCompleto;
                document.getElementById('resultado-publicacion').style.display = 'block';

                limpiarFormulario();
                cargarNoticiasAdmin();
            } else {
                alert("Hubo un error al procesar la solicitud.");
            }
        })
        .catch(err => console.error("Error:", err));
    });
});

function cargarNoticiasAdmin() {
    fetch(urlAPI)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('lista-admin-body');
            tbody.innerHTML = '';

            if (!Array.isArray(data)) return;

            data.forEach(noticia => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #ddd';
                
                tr.innerHTML = `
                    <td style="padding: 10px;">${noticia.fecha || ''}</td>
                    <td style="padding: 10px; font-weight: bold;">${noticia.titulo || ''}</td>
                    <td style="padding: 10px; text-transform: capitalize;">${noticia.categoria || ''}</td>
                    <td style="padding: 10px; text-align: center; display: flex; gap: 8px; justify-content: center;">
                        <button onclick='prepararEdicion(${JSON.stringify(noticia)})' style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Editar</button>
                        <button onclick="borrarNoticia('${noticia.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Borrar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

function prepararEdicion(noticia) {
    document.getElementById('noticia-id').value = noticia.id;
    document.getElementById('admin-titulo').value = noticia.titulo;
    document.getElementById('admin-imagen').value = noticia.imagen;
    document.getElementById('admin-categoria').value = noticia.categoria.toLowerCase();
    document.getElementById('admin-cuerpo').value = noticia.cuerpo;

    document.getElementById('btn-guardar').innerText = "Actualizar Noticia";
    document.getElementById('btn-cancelar-edicion').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
    document.getElementById('form-admin-noticia').reset();
    document.getElementById('noticia-id').value = '';
    document.getElementById('btn-guardar').innerText = "Publicar Noticia";
    document.getElementById('btn-cancelar-edicion').style.display = 'none';
}

function borrarNoticia(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
        fetch(urlAPI, {
            method: 'POST',
            body: JSON.stringify({ action: "delete", id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.resultado === "success") {
                alert("Noticia eliminada correctamente.");
                cargarNoticiasAdmin();
            } else {
                alert("No se pudo eliminar la noticia.");
            }
        })
        .catch(err => console.error("Error al borrar:", err));
    }
}

function copiarLinkNoticia() {
    const inputLink = document.getElementById('input-link-compartir');
    inputLink.select();
    navigator.clipboard.writeText(inputLink.value);

    const aviso = document.getElementById('copiado-aviso');
    aviso.style.display = 'block';
    setTimeout(() => { aviso.style.display = 'none'; }, 3000);
}
