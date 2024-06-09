document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('usuario').value;
    const password = document.getElementById('contrasena').value;

    try {
        const response = await fetch('http://127.0.0.1:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        console.log('Success:', data);

        if (data.success) {
            sessionStorage.setItem('username', username);
            location.href = "home.html";
        } else {
            alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Se produjo un error al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
    }
});