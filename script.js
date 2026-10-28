const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ocultar Loader
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 700);
    }

    // 2. Observer Fade-In
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));

    // 3. Inicializar Personalización por URL
    initCustomRSVP();
});

function initCustomRSVP() {
    let queryString = window.location.search;
    if (!queryString && window.location.hash.includes('?')) {
        queryString = window.location.hash.substring(window.location.hash.indexOf('?'));
    }

    const urlParams = new URLSearchParams(queryString);
    
    // Obtener y limpiar el parámetro 'invitado' reemplazando '+' por espacios
    let guestParamRaw = urlParams.get('invitado') || "Invitado";
    guestParamRaw = decodeURIComponent(guestParamRaw.replace(/\+/g, ' '));

    const passesParam = parseInt(urlParams.get('cupos')) || 1;

    // Extraer solo el primer nombre para el campo "INVITADO 1" (ej: de "Maira y Acompañante" extrae "Maira")
    let firstGuestName = guestParamRaw.split(/ y | e | & |,/i)[0].trim();

    // Actualizar datos en la tarjeta VIP
    const vipNameElem = document.getElementById('vip-guest-name');
    if (vipNameElem) vipNameElem.innerText = guestParamRaw;

    const passesCountElem = document.getElementById('rsvp-passes-count');
    if (passesCountElem) passesCountElem.innerText = `LUGARES DISPONIBLES: ${passesParam}`;

    // Generar dinámicamente las tarjetas por invitado
    const container = document.getElementById('guests-fields-container');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 1; i <= passesParam; i++) {
        const guestBox = document.createElement('div');
        guestBox.className = 'guest-card-item';
        
        // Autocompleta con "Maira" solo en Invitado 1
        const defaultInputValue = (i === 1 && firstGuestName !== "Invitado") ? firstGuestName : '';

        guestBox.innerHTML = `
            <p class="guest-item-title">INVITADO ${i}</p>

            <div class="field">
                <input type="text" class="input-guest-name" placeholder="Nombre completo" required value="${defaultInputValue}">
            </div>

            <div class="field">
                <label class="field-label">¿ASISTE?</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="attendance_${i}" value="Confirmado" checked> Sí, ahí estaré
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="attendance_${i}" value="No asistirá"> No podré asistir
                    </label>
                </div>
            </div>

            <div class="field">
                <input type="text" class="input-guest-diet" placeholder="Menú especial / Restricciones alimentarias (opcional)">
            </div>
        `;
        container.appendChild(guestBox);
    }
}

function handleRSVP(event) {
    event.preventDefault();

    const btnSubmit = document.getElementById('btn-submit-rsvp');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'ENVIANDO...';
    }

    let queryString = window.location.search;
    if (!queryString && window.location.hash.includes('?')) {
        queryString = window.location.hash.substring(window.location.hash.indexOf('?'));
    }
    const urlParams = new URLSearchParams(queryString);
    
    let mainGuest = urlParams.get('invitado') || "Invitado";
    mainGuest = decodeURIComponent(mainGuest.replace(/\+/g, ' '));

    const messageInput = document.getElementById('guest-message');
    const message = messageInput ? messageInput.value : '';

    const guestCards = document.querySelectorAll('.guest-card-item');
    const guestsList = [];

    guestCards.forEach((card, index) => {
        const nameInput = card.querySelector('.input-guest-name');
        const attendanceRadio = card.querySelector(`input[name="attendance_${index + 1}"]:checked`);
        const dietInput = card.querySelector('.input-guest-diet');

        guestsList.push({
            nombre: nameInput ? nameInput.value : '',
            asistencia: attendanceRadio ? attendanceRadio.value : 'Confirmado',
            restricciones: dietInput ? dietInput.value : ''
        });
    });

    const payload = {
        invitadoPrincipal: mainGuest,
        mensaje: message,
        invitados: guestsList,
        fecha: new Date().toLocaleString('es-AR')
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        const rsvpForm = document.getElementById('rsvp-form');
        const successMsg = document.getElementById('rsvp-success-msg');
        
        if (rsvpForm) rsvpForm.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al guardar tu respuesta. Intentá nuevamente.');
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'CONFIRMAR ASISTENCIA';
        }
    });
}

function copyAlias() {
    const aliasElem = document.getElementById('alias-text');
    if (!aliasElem) return;

    navigator.clipboard.writeText(aliasElem.innerText).then(() => {
        const btn = document.querySelector('.btn-copy-underline');
        if (btn) {
            btn.innerText = '¡COPIADO!';
            setTimeout(() => {
                btn.innerText = 'COPIAR ALIAS →';
            }, 2000);
        }
    });
}