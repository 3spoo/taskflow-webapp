(function () {
    const style = document.createElement('style');
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'invalid-char-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
        <div id="invalid-char-box">
            <h5>Caratteri non validi</h5>
            <p id="invalid-char-msg"></p>
            <div class="invalid-chars-list" id="invalid-chars-list"></div>
            <button id="invalid-char-close">Capito</button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('invalid-char-close').addEventListener('click', hide);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) hide();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') hide();
    });

    function hide() {
        overlay.classList.remove('visible');
    }

    function getInvalidChars(value, type = 'text') {
        if (typeof value !== 'string') return [];

        let regex;

        switch (type) {
            case 'username':
                regex = /[^a-zA-Z0-9_]/g;
                break;

            case 'email':
                regex = /[^a-zA-Z0-9._%+\-@]/g;
                break;

            case 'password':
                regex = /[\x00-\x1F\x7F<>]/g;
                break;

            case 'text':
            default:
                regex = /[^a-zA-Z0-9\s.,!?@()\-'"\[\]{}+*\/=<>~^%&|\\]/g;
                break;
        }

        return value.match(regex) || [];
    }

    window.warnIfInvalidChars = function (value, fieldLabel = 'Campo', type = 'text') {
        const invalidChars = [...new Set(getInvalidChars(value, type))];

        if (invalidChars.length === 0) return false;

        document.getElementById('invalid-char-msg').innerHTML =
            `The field <strong>${fieldLabel}</strong> contains invalid characters.`;

        const list = document.getElementById('invalid-chars-list');
        list.innerHTML = '';

        invalidChars.forEach(ch => {
            const tag = document.createElement('span');
            tag.textContent = ch === ' ' ? 'spazio' : ch;
            list.appendChild(tag);
        });

        overlay.classList.add('visible');
        document.getElementById('invalid-char-close').focus();

        return true;
    };

})();