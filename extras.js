/* Extras de lujo: textos que se enfocan, parallax suave,
   cuenta regresiva que rueda y líneas que se dibujan.
   No toca el formulario ni los datos de confirmación (eso es script.js). */
(function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- utilidad: agrega una clase la primera vez que algo aparece ---------- */
    function once(selector, cls, threshold) {
        var els = [].slice.call(document.querySelectorAll(selector));
        if (!('IntersectionObserver' in window)) {
            els.forEach(function (e) { e.classList.add(cls); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add(cls); io.unobserve(en.target); }
            });
        }, { threshold: threshold || 0.15 });
        els.forEach(function (e) { io.observe(e); });
    }

    /* ---------- 1. textos: separar en palabras para enfocarlas una a una ---------- */
    function splitWords(root) {
        var n = 0;
        (function walk(node) {
            [].slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(function (part) {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                        var w = document.createElement('span');
                        w.className = 'w';
                        w.style.setProperty('--i', n++);
                        w.textContent = part;
                        frag.appendChild(w);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    walk(child);
                }
            });
        })(root);
        root.classList.add('blur-words');
    }
    if (!reduce) {
        [].slice.call(document.querySelectorAll('.poetic-quote, .cover-invite, .block .script-title'))
            .forEach(splitWords);
    }

    /* ---------- 2. líneas finas y foto del lugar ---------- */
    once('.block', 'line-in', 0.12);
    once('.venue-photo', 'in', 0.2);

    /* ---------- 3. parallax muy suave en el collage ---------- */
    var layers = [].slice.call(document.querySelectorAll('[data-speed]'));
    var canTranslate = 'translate' in document.documentElement.style;
    function parallax() {
        var vh = window.innerHeight;
        layers.forEach(function (el) {
            var box = el.parentNode.getBoundingClientRect();
            if (box.bottom < -200 || box.top > vh + 200) return;
            var mid = box.top + box.height / 2 - vh / 2;
            el.style.translate = '0 ' + (mid * parseFloat(el.getAttribute('data-speed'))).toFixed(1) + 'px';
        });
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            if (!reduce && canTranslate) parallax();
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---------- 4. cuenta regresiva que rueda (reemplaza a la de script.js / countdown.js) ---------- */
    var target = new Date('2027-04-24T00:00:00-03:00').getTime();
    var ids = ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'];
    var els = ids.map(function (id) { return document.getElementById(id); });
    if (els[0]) {
        els.forEach(function (el) { el.classList.add('roll'); });

        var setVal = function (el, val) {
            var cur = el._cur;
            if (!cur) {
                cur = document.createElement('span');
                cur.className = 'roll-i';
                cur.textContent = val;
                el.textContent = '';
                el.appendChild(cur);
                el._cur = cur;
                return;
            }
            if (cur.textContent === val) return;
            if (reduce) { cur.textContent = val; return; }
            var next = document.createElement('span');
            next.className = 'roll-i roll-in';
            next.textContent = val;
            cur.classList.add('roll-out');
            el.appendChild(next);
            el._cur = next;
            setTimeout(function () {
                if (cur.parentNode) cur.parentNode.removeChild(cur);
                next.classList.remove('roll-in');
            }, 800);
        };
        var pad = function (n) { return n < 10 ? '0' + n : String(n); };

        var tick = function () {
            var s = Math.floor(Math.max(0, target - Date.now()) / 1000);
            setVal(els[0], pad(Math.floor(s / 86400)));
            setVal(els[1], pad(Math.floor((s % 86400) / 3600)));
            setVal(els[2], pad(Math.floor((s % 3600) / 60)));
            setVal(els[3], pad(s % 60));
        };
        tick();
        setInterval(tick, 1000);
    }
})();