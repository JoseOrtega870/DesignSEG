document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('usuario').value;
    const password = document.getElementById('contrasena').value;

    // console.log(username, password);

    // Perform validation and populate the error messages in an array
    const errors = [];

    if (!username) {
        errors.push('Ingrese un nombre de usuario.');
    }

    if (!password) {
        errors.push('Ingrese una contraseña.');
    }

    // Check if the username and password are correct
    if (errors.length === 0) {
        fetch('127.0.0.1:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to the dashboard or perform other actions
                } else {
                    errors.push('Usuario o Contraseña Inválidos');
                    displayErrorAlert(errors);
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    } else {
        displayErrorAlert(errors);
    }

    function displayErrorAlert(errors) {
        const errorAlert = document.getElementById('errorAlert');
        errorAlert.innerHTML = '';

        errors.forEach(function (error) {
            const errorElement = document.createElement('p');
            errorElement.textContent = error;
            errorAlert.appendChild(errorElement);
        });

        errorAlert.style.display = 'block';
    }
    
});document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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