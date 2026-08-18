let todasLasNoticias = [];

document.addEventListener("DOMContentLoaded", function () {
    const urlAPI = "https://script.google.com/macros/s/AKfycbyBguwaVlic_j1h_r7l-YDTOybxvquMy5XZXuFC0ysbHZRZR_xW3LlDuQnV7UCWlPn0/exec";

    fetch(urlAPI)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) return;
            todasLasNoticias = data;
            renderizarNoticias(todasLasNoticias);

            const urlParams = new URLSearchParams(window.location.search);
            const noticiaId = urlParams.get('id');
            if (noticiaId) {
                const encontrada = data.find(n => String(n.id) === String(noticiaId));
                if (encontrada) abrirNoticiaModal(encontrada);
            }
        })
        .catch(error => console.error('Error crítico al cargar API:', error));

    inicializarArrastrePlayer();
});

function obtenerHtmlMultimedia(urlVideo, urlImagen) {
    if (urlVideo && urlVideo.trim() !== "") {
        let v = urlVideo.trim();
        if (v.includes("youtube.com/watch?v=")) return `<iframe src="https://www.youtube.com/embed/${v.split("v=")[1].split("&")[0]}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
        if (v.includes("youtu.be/")) return `<iframe src="https://www.youtube.com/embed/${v.split("youtu.be/")[1].split("?")[0]}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
        return `<video src="${v}" controls style="width:100%;height:100%;object-fit:cover;background:#000;"></video>`;
    }
    return `<img src="${urlImagen || ''}" alt="Imagen" style="width:100%;height:100%;object-fit:cover;">`;
}

function renderizarNoticias(lista) {
    const containers = {
        nacional: document.getElementById('grid-nacionales'),
        internacional: document.getElementById('grid-internacionales'),
        provincial: document.getElementById('grid-provinciales')
    };

    Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });

    const ahora = new Date();
    const tresDias = 3 * 24 * 60 * 60 * 1000;
    const busqueda = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';

    // Ordenamiento corregido: de más nuevo a más viejo
    const listaOrdenada = [...lista].sort((a, b) => {
        let fA = new Date(a.fecha || a.Fecha || 0);
        let fB = new Date(b.fecha || b.Fecha || 0);
        return fB - fA;
    });

    listaOrdenada.forEach(n => {
        const cat = (n.categoria || '').toLowerCase();
        let contenedor = cat.includes('internacional') ? containers.internacional : 
                         cat.includes('nacional') ? containers.nacional : 
                         cat.includes('provincial') ? containers.provincial : null;

        if (contenedor) {
            let fechaN = new Date(n.fecha || n.Fecha || 0);
            if (!busqueda && (ahora - fechaN > tresDias)) return;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="width:100%;height:160px;overflow:hidden;background:#000;">${obtenerHtmlMultimedia(n.video || n.Video, n.imagen || n.Imagen)}</div>
                <div style="padding:12px;">
                    <div style="font-size:0.75rem;color:#d9534f;font-weight:bold;">${formatearFechaYHora(n.fecha || n.Fecha, n.hora || n.Hora)}</div>
                    <div style="font-weight:600;font-size:0.85rem;margin-top:5px;">${n.titulo || 'Sin título'}</div>
                </div>`;
            card.onclick = () => abrirNoticiaModal(n);
            contenedor.appendChild(card);
        }
    });
}

function filterNews() {
    const texto = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const resultados = todasLasNoticias.filter(n => 
        (n.titulo?.toLowerCase().includes(texto)) || 
        (n.descripcion?.toLowerCase().includes(texto)) ||
        (n.cuerpo?.toLowerCase().includes(texto))
    );
    renderizarNoticias(resultados);
}

function formatearFechaYHora(f, h) {
    if (!f) return '';
    let d = new Date(f);
    let fechaLimpia = d.toLocaleDateString();
    return h ? `${fechaLimpia} - ${h.substring(0, 5)}` : fechaLimpia;
}

function abrirNoticiaModal(n) {
    document.getElementById('modal-categoria').innerText = n.categoria || '';
    document.getElementById('modal-titulo').innerText = n.titulo || '';
    document.getElementById('modal-cuerpo').innerText = n.cuerpo || '';
    document.getElementById('modal-fecha').innerText = formatearFechaYHora(n.fecha || n.Fecha, n.hora || n.Hora);
    
    // Multimedia modal
    const imgEl = document.getElementById('modal-imagen');
    if (imgEl) {
        if (n.video || n.Video) {
            imgEl.outerHTML = `<div id="modal-video-container" style="width:100%;height:300px;background:#000;">${obtenerHtmlMultimedia(n.video || n.Video)}</div>`;
        } else {
            imgEl.style.display = 'block';
            imgEl.src = n.imagen || '';
        }
    }
    document.getElementById('modal-noticia').style.display = 'flex';
    window.history.pushState({}, '', `?id=${n.id}`);
}

function cerrarNoticia() {
    document.getElementById('modal-noticia').style.display = 'none';
    window.history.pushState({}, '', window.location.pathname);
}

// Player y Arrastre (Sin cambios, ya funcionaban)
function abrirPlayer() { document.getElementById('radio-modal-flotante').style.display = 'block'; document.getElementById('audio-stream')?.play(); }
function cerrarPlayer() { document.getElementById('radio-modal-flotante').style.display = 'none'; document.getElementById('audio-stream')?.pause(); }
function cambiarVolumen(v) { if(document.getElementById('audio-stream')) document.getElementById('audio-stream').volume = v/100; }

function inicializarArrastrePlayer() {
    const p = document.getElementById('radio-modal-flotante');
    const h = document.getElementById('radio-header-drag');
    if (!p || !h) return;
    let isDragging = false, startX, startY, initX, initY;
    h.onmousedown = (e) => { isDragging = true; startX = e.clientX; startY = e.clientY; initX = p.offsetLeft; initY = p.offsetTop; };
    document.onmousemove = (e) => { if(!isDragging) return; p.style.left = (initX + e.clientX - startX) + 'px'; p.style.top = (initY + e.clientY - startY) + 'px'; };
    document.onmouseup = () => isDragging = false;
}
