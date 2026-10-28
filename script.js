const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEGCcH-vkVcfdQ5vz7MLoHvvQRyMxSuberhjF8pEcz4D-xf35E270qNcw3AkynA5dT/exec";

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
    const rawGuestParam = urlParams.get('invitado');

    // Referencias al DOM
    const rsvpContainer = document.getElementById('rsvp-form-container'); 
    const noAccessContainer = document.getElementById('rsvp-no-access');   
    const civilItem = document.getElementById('civil-item');

    // VALIDACIÓN DE ACCESO AL RSVP
    if (!rawGuestParam) {
        if (rsvpContainer) rsvpContainer.style.display = 'none';
        if (noAccessContainer) noAccessContainer.style.display = 'block';
        return; 
    }

    if (rsvpContainer) rsvpContainer.style.display = 'block';
    if (noAccessContainer) noAccessContainer.style.display = 'none';

    // PARAMETROS ABREVIADOS
    const passesParam = parseInt(urlParams.get('pases') || urlParams.get('cupos')) || 1;
    const gParam = (urlParams.get('g') || '').toLowerCase(); 
    const venueParam = (urlParams.get('venue') || '').toLowerCase();

    // CONTROL DE VISIBILIDAD DEL CIVIL
    if (civilItem) {
        if (venueParam === 'cyf' || urlParams.get('civil') === '1') {
            civilItem.style.display = 'block';
        } else {
            civilItem.style.display = 'none';
        }
    }

    // FORMATEAR NOMBRE DEL INVITADO PRINCIPAL
    let guestParamRaw = decodeURIComponent(rawGuestParam.replace(/\+/g, ' '));

    // ETIQUETA ADAPTATIVA SEGÚN ABREVIATURAS
    const vipLabelElem = document.querySelector('.vip-label');
    if (vipLabelElem) {
        if (passesParam > 1) {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA LOS INVITADOS";
        } else if (gParam === 'f') {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA LA INVITADA";
        } else {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA EL INVITADO";
        }
    }

    // Actualizar datos en la tarjeta VIP
    const vipNameElem = document.getElementById('vip-guest-name');
    if (vipNameElem) vipNameElem.innerText = guestParamRaw;

    const passesCountElem = document.getElementById('rsvp-passes-count');
    if (passesCountElem) passesCountElem.innerText = `LUGARES DISPONIBLES: ${passesParam}`;

    // Extraer primer nombre para autocompletar el campo 1
    let firstGuestName = guestParamRaw.split(/ y | e | & |,/i)[0].trim();

    // GENERAR CAMPOS DE FORMULARIO
    const container = document.getElementById('guests-fields-container');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 1; i <= passesParam; i++) {
        const guestBox = document.createElement('div');
        guestBox.className = 'guest-card-item';
        
        const defaultInputValue = (i === 1 && firstGuestName !== "Invitado") ? firstGuestName : '';

        let guestTitle = `INVITADO ${i}`;
        if (passesParam === 1 && gParam === 'f') {
            guestTitle = `INVITADA`;
        } else if (passesParam === 1) {
            guestTitle = `INVITADO`;
        }

        guestBox.innerHTML = `
            <p class="guest-item-title">${guestTitle}</p>

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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        const rsvpForm = document.getElementById('rsvp-form');
        const vipCard = document.querySelector('.vip-card');
        const passesCount = document.getElementById('rsvp-passes-count');
        const successMsg = document.getElementById('rsvp-success-msg');
        
        // Ocultar la tarjeta VIP, el contador y el formulario
        if (rsvpForm) rsvpForm.style.display = 'none';
        if (vipCard) vipCard.style.display = 'none';
        if (passesCount) passesCount.style.display = 'none';

        // Mostrar solo el mensaje de éxito
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