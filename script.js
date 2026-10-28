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
    const hasCivil = (venueParam === 'cyf' || urlParams.get('civil') === '1');

    // CONTROL DE VISIBILIDAD DEL CIVIL EN CRONOGRAMA
    if (civilItem) {
        civilItem.style.display = hasCivil ? 'block' : 'none';
    }

    // FORMATEAR NOMBRE DEL INVITADO PRINCIPAL
    let guestParamRaw = decodeURIComponent(rawGuestParam.replace(/\+/g, ' '));

    // ETIQUETA ADAPTATIVA SEGÚN ABREVIATURAS
    const vipLabelElem = document.querySelector('.vip-label');
    if (vipLabelElem) {
        if (passesParam > 1) {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA";
        } else if (gParam === 'f') {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA ";
        } else {
            vipLabelElem.innerText = "INVITACIÓN EXCLUSIVA PARA";
        }
    }

    // Actualizar datos en la tarjeta VIP
    const vipNameElem = document.getElementById('vip-guest-name');
    if (vipNameElem) vipNameElem.innerText = guestParamRaw;

    const passesCountElem = document.getElementById('rsvp-passes-count');
    if (passesCountElem) passesCountElem.innerText = `LUGARES DISPONIBLES: ${passesParam}`;

    // GENERAR CAMPOS DE FORMULARIO
    const container = document.getElementById('guests-fields-container');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 1; i <= passesParam; i++) {
        const guestBox = document.createElement('div');
        guestBox.className = 'guest-card-item';

        let guestTitle = `INVITADO ${i}`;
        if (passesParam === 1 && gParam === 'f') {
            guestTitle = `INVITADA`;
        } else if (passesParam === 1) {
            guestTitle = `INVITADO`;
        }

        // HTML base
        let htmlContent = `
            <p class="guest-item-title">${guestTitle}</p>

            <div class="field-row">
                <div class="field">
                    <span class="field-label-sub">NOMBRE</span>
                    <input type="text" class="input-guest-firstname" placeholder="Tu nombre" required value="">
                </div>
                <div class="field">
                    <span class="field-label-sub">APELLIDO</span>
                    <input type="text" class="input-guest-lastname" placeholder="Tu apellido" required value="">
                </div>
            </div>
        `;

        // Pregunta de Civil (Solo si el link incluye venue=cyf)
        if (hasCivil) {
            htmlContent += `
                <div class="field">
                    <label class="field-label">¿ASISTÍS AL CIVIL?</label>
                    <div class="attendance-toggle-group">
                        <label class="toggle-option">
                            <input type="radio" name="civil_attendance_${i}" value="Confirmado" checked>
                            <span class="toggle-btn">SÍ, ALLÍ ESTARÉ</span>
                        </label>
                        <label class="toggle-option">
                            <input type="radio" name="civil_attendance_${i}" value="No asistirá">
                            <span class="toggle-btn">NO PODRÉ ASISTIR</span>
                        </label>
                    </div>
                </div>
            `;
        }

        // Pregunta de Fiesta y Selección de Menú
        htmlContent += `
            <div class="field">
                <label class="field-label">${hasCivil ? '¿ASISTÍS A LA FIESTA?' : '¿NOS ACOMPAÑÁS?'}</label>
                <div class="attendance-toggle-group">
                    <label class="toggle-option">
                        <input type="radio" name="party_attendance_${i}" value="Confirmado" checked>
                        <span class="toggle-btn">SÍ, ALLÍ ESTARÉ</span>
                    </label>
                    <label class="toggle-option">
                        <input type="radio" name="party_attendance_${i}" value="No asistirá">
                        <span class="toggle-btn">NO PODRÉ ASISTIR</span>
                    </label>
                </div>
            </div>

            <div class="field">
                <label class="field-label">SELECCIÓN DE MENÚ</label>
                <div class="select-wrapper">
                    <select class="input-guest-diet">
                        <option value="Menú general" selected>Menú General</option>
                        <option value="Sin TACC">Sin TACC (Celiaco)</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Vegano">Vegano</option>
                    </select>
                </div>
            </div>
        `;

        guestBox.innerHTML = htmlContent;
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
    const venueParam = (urlParams.get('venue') || '').toLowerCase();
    const hasCivil = (venueParam === 'cyf' || urlParams.get('civil') === '1');

    const messageInput = document.getElementById('guest-message');
    const message = messageInput ? messageInput.value : '';

    const guestCards = document.querySelectorAll('.guest-card-item');
    const guestsList = [];

    guestCards.forEach((card, index) => {
        const i = index + 1;
        const firstNameInput = card.querySelector('.input-guest-firstname');
        const lastNameInput = card.querySelector('.input-guest-lastname');
        
        const partyRadio = card.querySelector(`input[name="party_attendance_${i}"]:checked`);
        const civilRadio = card.querySelector(`input[name="civil_attendance_${i}"]:checked`);
        const dietSelect = card.querySelector('.input-guest-diet');

        const firstName = firstNameInput ? firstNameInput.value.trim() : '';
        const lastName = lastNameInput ? lastNameInput.value.trim() : '';
        const fullName = `${firstName} ${lastName}`.trim();

        const asistenciaFiestaVal = partyRadio ? partyRadio.value : 'No asistirá';
        const asistenciaCivilVal = hasCivil 
            ? (civilRadio ? civilRadio.value : 'No asistirá')
            : 'No invitado';

        guestsList.push({
            nombre: fullName,
            asistenciaFiesta: asistenciaFiestaVal,
            asistenciaCivil: asistenciaCivilVal,
            restricciones: dietSelect ? dietSelect.value : 'Menú general'
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
        const rsvpFormContainer = document.getElementById('rsvp-form-container');
        const modal = document.getElementById('rsvp-modal');
        
        // Reemplaza el contenido del RSVP por un estado limpio de confirmación
        if (rsvpFormContainer) {
            rsvpFormContainer.innerHTML = `
                <div style="padding: 10px 0 20px; text-align: center;">
                    <p style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--accent); letter-spacing: 2px; text-transform: uppercase;">
                        Respuesta Registrada
                    </p>
                    <p style="font-size: 0.85rem; color: var(--muted); letter-spacing: 1px; margin-top: 6px;">
                        ¡Muchas gracias por responder a nuestra invitación!
                    </p>
                </div>
            `;
        }

        // Despliega el Popup Modal por encima
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
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

function closeRSVPModal() {
    const modal = document.getElementById('rsvp-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    }
}

function toggleBankDetails() {
    const bankDetails = document.getElementById('bank-details');
    const toggleBtn = document.getElementById('toggle-bank-btn');
    
    if (bankDetails.style.display === 'none') {
        bankDetails.style.display = 'block';
        toggleBtn.textContent = 'Ocultar datos bancarios';
    } else {
        bankDetails.style.display = 'none';
        toggleBtn.textContent = 'Ver datos bancarios';
    }
}

function copyAlias() {
    const aliasElem = document.getElementById('alias-text');
    if (!aliasElem) return;

    navigator.clipboard.writeText(aliasElem.innerText).then(() => {
        const btn = document.querySelector('.btn-copy-underline');
        if (btn) {
            btn.innerText = '¡COPIADO!';
            setTimeout(() => {
                btn.innerText = 'COPIAR →';
            }, 2000);
        }
    });
}