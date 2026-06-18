/**
 * Username: solo lettere, cifre e underscore.
 * max 32 char
 */
function isValidUsername(value) {
    if (typeof value !== 'string') return false;
    return /^[a-zA-Z0-9_]{1,32}$/.test(value);
}

/**
 * Email: formato base RFC-safe + lunghezza max 254
 */
function isValidEmail(value) {
    if (typeof value !== 'string') return false;
    if (value.length > 254) return false;

    return /^[a-zA-Z0-9._%+\-@]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value);
}

/**
 * Password: max 128, no < >
 * (niente sanitizzazione, solo validazione)
 */
function isValidPassword(value) {
    if (typeof value !== 'string') return false;
    if (value.length < 1 || value.length > 128) return false;

    return !/[<>]/.test(value);
}

/**
 * Text generico (task, descrizioni)
 * max 255, caratteri limitati ma NON modificati
 */
function isValidText(value) {
    if (typeof value !== 'string') return false;
    if (value.length > 255) return false;

    return /^[a-zA-Z0-9\s.,!?@()\-'";\[\]{}+*\/=<>~^%&|\\]*$/.test(value);
}


function isValidForm(fields, formData) {
    const validators = {
        email: isValidEmail,
        username: isValidUsername,
        password: isValidPassword,
        text: isValidText,
    };

    for (const [field, type] of Object.entries(fields)) {
        const value = formData[field] ?? '';
        const fn = validators[type] || isValidText;

        if (!fn(value)) {
            return {
                valid: false,
                error: {
                    field,
                    message: `Invalid ${field}`
                }
            };
        }
    }

    return { valid: true };
}