const API_URL = 'http://localhost:8080/api/v1/user/in';
const errorDiv = document.getElementById('errorMsg');

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;

    const isAccountValid =
        isValidEmail(account) || isValidUsername(account);

    if (!isAccountValid) {
        showError('ERR. invalid username or email format.');
        return;
    }

    if (!isValidPassword(password)) {
        showError('ERR. invalid password format.');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ account, password }),
        });

        if (res.ok) {
            const userData = await res.json();
            localStorage.setItem('loggedUser', JSON.stringify(userData));
            window.location.href = 'dashboard.html';
            return;
        }

        if (res.status === 401) {
            const err = await res.text();
            showError('LOGIN FAILED: ' + err);
            return;
        }

        showError('UNX. ERR.: ' + res.status + ' ' + res.statusText);

    } catch (error) {
        showError('NET. ERR.: ' + error.message);
    }
});


function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}