document.addEventListener("DOMContentLoaded", () => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('username').value = loggedUser.username;
    document.getElementById('email').value = loggedUser.email;

    const API_BASE = 'http://localhost:8080/api/v1/user';

    // UPDATE
    document.getElementById('updateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

        if (!isValidUsername(username)) {
            showErrorUpdate('ERR. invalid username format.');
            return;
        }

        if (!isValidEmail(email)) {
            showErrorUpdate('ERR. invalid email format.');
            return;
        }

        try {
            const params = new URLSearchParams({
                username: username,
                email: email
            });

            const res = await fetch(`${API_BASE}/me?${params.toString()}`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (res.ok) {
                showSuccessUpdate('OK. user information updated successfully.');

                loggedUser.username = username;
                loggedUser.email = email;
                localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            } else {
                const msg = await res.text();
                showErrorUpdate(msg);
            }
        } catch (err) {
            showErrorUpdate('NET. ERR.: ' + err.message);
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (!isValidPassword(current) || !isValidPassword(newPass)) {
            showError('ERR. invalid password format.');
            return;
        }

        if (newPass !== confirmPass) {
            showError('ERR. passwords do not match.');
            return;
        }

        try {
            const updateRes = await fetch(`${API_BASE}/me/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    password: current,
                    replacementPassword: newPass
                })
            });

            if (updateRes.ok) {
                showSuccess('OK. password changed successfully.');
                e.target.reset();
            } else {
                const msg = await updateRes.text();
                showError(msg);
            }
        } catch (err) {
            showError('NET. ERR.: ' + err.message);
        }
    });

    // DELETE
    document.getElementById('deleteBtn').addEventListener('click', async () => {
        clearMessages();
        localStorage.removeItem('loggedUser');

        try {
            const res = await fetch(`${API_BASE}/me`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                window.location.href = 'register.html';
            } else {
                const msg = await res.text();
                showError(msg);
            }
        } catch (err) {
            showError('NET. ERR.: ' + err.message);
        }
    });
});

function showErrorUpdate(message) {
    const msg = document.getElementById('message_update');
    msg.className = 'alert alert-danger';
    msg.textContent = message;
    msg.style.display = 'block';
}

function showError(message) {
    const msg = document.getElementById('message');
    msg.className = 'alert alert-danger';
    msg.textContent = message;
    msg.style.display = 'block';
}

function showSuccessUpdate(message) {
    const msg = document.getElementById('message_update');
    msg.className = 'alert alert-success';
    msg.textContent = message;
    msg.style.display = 'block';
}

function showSuccess(message) {
    const msg = document.getElementById('message');
    msg.className = 'alert alert-success';
    msg.textContent = message;
    msg.style.display = 'block';
}

function clearMessages() {
    const msg = document.getElementById('message');
    msg.style.display = 'none';
    msg.textContent = '';
}