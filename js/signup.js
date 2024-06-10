let areasOut = [];

async function fetchAreas() {
    const response = await fetch('http://127.0.0.1:8080/areas');
    if (!response.ok) return;
    
    const areas = await response.json();
    const select = document.getElementById('area');
    areas.forEach(area => select.add(new Option(area.name, area.name)));
    areasOut = areas;
}

fetchAreas();

document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        firstname: document.getElementById('firstname').value,
        middlename: document.getElementById('middlename').value,
        lastname: document.getElementById('lastname').value,
        password: document.getElementById('password').value,
        area: areasOut.find(area => area.name === document.getElementById('area').value).id,
        points: 0,
        role: ''
    };

    if (formData.password !== document.getElementById('passwordConfirm').value) {
        return showMessage('Las contraseñas no coinciden, Por favor intente de nuevo.', 'danger');
    }


    if (formData.password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres.');
        return; 
    }

    if (!/[A-Z]/.test(formData.password)) {
        alert('La contraseña debe contener al menos una letra mayúscula.');
        return;
    }

    if (!/[a-z]/.test(formData.password)) {
        alert('La contraseña debe contener al menos una letra minúscula.');
        return;
    }

    if (!/[0-9]/.test(formData.password)) {
        alert('La contraseña debe contener al menos un número (0-9).');
        return;
    }

    if (!/[*@_]/.test(formData.password)) {
        alert('La contraseña debe contener al menos un carácter especial (*@_).');
        return;
    }

    const response = await fetch('http://127.0.0.1:8080/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        showMessage('Usuario creado exitosamente.', 'success');
        // Redirigir
        sessionStorage.setItem('username', username);
        location.href = "home.html";
    } else {
        alert('No se pudo realizar el registro. Intente más tarde.');
    }
});
function showMessage(message, type) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `alert alert-${type}`;
    messageContainer.textContent = message;
    document.querySelector('.form-container').prepend(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 5000);
};