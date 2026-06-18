const API_URL = 'http://localhost:8080/api/v1/user';
const errorDiv = document.getElementById('errorMsg');

document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!isValidEmail(email)) {
        showError('ERR. invalid email format.');
        return;
    }

    if (!isValidUsername(username)) {
        showError('ERR. invalid username format.');
        return;
    }

    if (!isValidPassword(password)) {
        showError('ERR. invalid password format.');
        return;
    }

    if (password !== confirmPassword) {
        showError('ERR. passwords do not match.');
        return;
    }

    const userData = {
        email,
        username,
        password
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.status === 201) {
            window.location.href = 'login.html';
            return;
        }

        const message = await response.text();

        if (response.status === 400) {
            showError('REGISTRATION FAILED: ' + message);
        } else {
            showError('UNX. ERR.: ' + response.status + ' ' + response.statusText);
        }

    } catch (error) {
        showError('NET. ERR.: ' + error.message);
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}