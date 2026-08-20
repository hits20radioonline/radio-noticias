const urlAPI = "https://script.google.com/macros/s/AKfycbzrN4pskes2eTBGxvuvsPFuKcm3VoIeUyc4FJGG962DkdMf2MYQYSkhBzji40oRmH1p/exec";

document.addEventListener("DOMContentLoaded", function () {
    cargarNoticiasAdmin();

    const form = document.getElementById('form-admin-noticia');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const id = document.getElementById('noticia-id').value;
            const titulo = document.getElementById('admin-titulo').value;
            const imagen = document.getElementById('admin-imagen').value;
            const video = document.getElementById('admin-video') ? document.getElementById('admin-video').value : '';
            const categoria = document.getElementById('admin-categoria').value.trim().toLowerCase();
            const cuerpo = document.getElementById('admin-cuerpo').value;
            
            let fecha = document.getElementById('admin-fecha').value;
            let hora = document.getElementById('admin-hora').value;

            if (fecha && fecha.includes('T')) {
                fecha = fecha.split('T')[0];
            }
            if (hora && hora.includes('T')) {
                const partesHora = hora.split('T')[1];
                hora = partesHora ? partesHora.substring(0, 5) : hora;
            }

            const action = id ? "update" : "create";
            const datos = { action, id, titulo, imagen, video, categoria, cuerpo, fecha, hora };

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

                    const inputLink = document.getElementById('input-link-compartir');
                    if (inputLink) inputLink.value = linkCompleto;
                    
                    const resBox = document.getElementById('resultado-publicacion');
                    if (resBox) resBox.style.display = 'block';

                    limpiarFormulario();
                    cargarNoticiasAdmin();
                } else {
                    alert("Hubo un error al procesar la solicitud.");
                }
            })
            .catch(err => console.error("Error:", err));
        });
    }
});

// Función unificada y blindada para limpiar la fecha y hora de forma exacta
function formatearFechaYHora(fechaCruda, horaCruda) {
  if (!fechaCruda) return '';

  let fechaStr = String(fechaCruda).trim();
  let fechaLimpia = '';
  let horaFinal = '';

  if (fechaStr.includes('T')) {
    fechaLimpia = fechaStr.split('T')[0];
  } else {
    fechaLimpia = fechaStr.substring(0, 10);
  }

  let fuenteHora = horaCruda;
  if ((!fuenteHora || String(fuenteHora).trim() === '' || String(fuenteHora).trim() === 'null') && fechaStr.includes('T')) {
    fuenteHora = fechaStr.split('T')[1];
  }

  if (fuenteHora !== undefined && fuenteHora !== null && String(fuenteHora).trim() !== '' && String(fuenteHora).trim() !== 'null') {
    let hStr = String(fuenteHora).trim().replace('Z', '');
    let match = hStr.match(/\d{2}:\d{2}/);
    if (match) {
      horaFinal = match[0];
    } else if (hStr.toLowerCase().includes('m')) {
      horaFinal = hStr;
    }
  }

  return horaFinal ? `${fechaLimpia} - ${horaFinal}` : fechaLimpia;
}

function cargarNoticiasAdmin() {
    fetch(urlAPI)
        .then(res => res.json())
        .then(data => {
            console.log("Datos recibidos de la API:", data);

            const tbody = document.getElementById('lista-admin-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            let noticiasArray = [];
            if (Array.isArray(data)) {
                noticiasArray = data;
            } else if (data && Array.isArray(data.noticias)) {
                noticiasArray = data.noticias;
            } else if (data && Array.isArray(data.data)) {
                noticiasArray = data.data;
            } else if (data) {
                noticiasArray = Object.values(data).find(val => Array.isArray(val)) || [];
            }

            if (noticiasArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px; color: #777;">No hay noticias registradas.</td></tr>';
                return;
            }

            // Invertimos para mostrar las publicaciones más recientes primero (sin recortar para que veas todas las que tengas)
            const noticiasOrdenadas = [...noticiasArray].reverse();

            noticiasOrdenadas.forEach(noticia => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #ddd';
                
                let fechaHoraTexto = formatearFechaYHora(noticia.fecha || noticia.Fecha, noticia.hora || noticia.Hora);
                if (!fechaHoraTexto) fechaHoraTexto = 'Sin fecha';

                const tituloNoticia = noticia.titulo || noticia.Titulo || 'Sin título';
                const categoriaNoticia = noticia.categoria || noticia.Categoria || 'Sin categoría';
                const idNoticia = noticia.id || noticia.ID || '';

                tr.innerHTML = `
                    <td style="padding: 10px;">${fechaHoraTexto}</td>
                    <td style="padding: 10px; font-weight: bold;">${tituloNoticia}</td>
                    <td style="padding: 10px; text-transform: capitalize;">${categoriaNoticia}</td>
                    <td style="padding: 10px; text-align: center; display: flex; gap: 8px; justify-content: center;">
                        <button type="button" onclick='prepararEdicion(${JSON.stringify(noticia)})' style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Editar</button>
                        <button type="button" onclick="borrarNoticia('${idNoticia}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Borrar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error al cargar noticias:", err));
}

function prepararEdicion(noticia) {
    document.getElementById('noticia-id').value = noticia.id || noticia.ID || '';
    document.getElementById('admin-titulo').value = noticia.titulo || noticia.Titulo || '';
    document.getElementById('admin-imagen').value = noticia.imagen || noticia.Imagen || '';
    
    const campoVideo = document.getElementById('admin-video');
    if (campoVideo) campoVideo.value = noticia.video || noticia.Video || '';
    
    document.getElementById('admin-categoria').value = (noticia.categoria || noticia.Categoria || '').trim().toLowerCase();
    document.getElementById('admin-cuerpo').value = noticia.cuerpo || noticia.Cuerpo || '';
    
    const fechaCruda = noticia.fecha || noticia.Fecha;
    if (fechaCruda) {
        let f = String(fechaCruda).split('T')[0];
        document.getElementById('admin-fecha').value = f;
    }
    
    const horaCruda = noticia.hora || noticia.Hora;
    if (horaCruda) {
        let h = String(horaCruda);
        if (h.includes('T')) {
            const p = h.split('T')[1];
            h = p ? p.substring(0, 5) : h;
        }
        document.getElementById('admin-hora').value = h;
    }

    document.getElementById('btn-guardar').innerText = "Actualizar Noticia";
    document.getElementById('btn-cancelar-edicion').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
    const form = document.getElementById('form-admin-noticia');
    if (form) form.reset();
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
    if (!inputLink) return;
    inputLink.select();
    navigator.clipboard.writeText(inputLink.value);

    const aviso = document.getElementById('copiado-aviso');
    if (aviso) {
        aviso.style.display = 'block';
        setTimeout(() => { aviso.style.display = 'none'; }, 3000);
    }
}
