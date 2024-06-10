document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const noEmpleado = document.getElementById('noEmpleado').value;
    const email = document.getElementById('email').value;
    const nombre = document.getElementById('nombre').value;
    const apellidoPaterno = document.getElementById('apellidos').value;
    const contrasena = document.getElementById('contrasena').value;
    const repetirContrasena = document.getElementById('repetirContrasena').value;

    // Perform validation and populate the error messages in an array
    const errors = [];

    if (!noEmpleado) {
        errors.push('Ingrese un Número de Empleado');
    }

    if (!email) {
        errors.push('Ingrese un Correo Electrónico');
    }

    if (!nombre) {
        errors.push('Ingrese un Nombre');
    }

    if (!apellidoPaterno) {
        errors.push('Ingrese sus Apellidos');
    }

    if (!contrasena) {
        errors.push('Ingrese su Contraseña');
    }

    if (!repetirContrasena) {
        errors.push('Confirme su contraseña');
    }

    if (contrasena !== repetirContrasena) {
        errors.push('Las contrasenas no coinciden');
    }

    // Display the alert if there are any errors
    if (errors.length > 0) {
        const errorAlert = document.getElementById('errorAlert');
        errorAlert.innerHTML = '';

        errors.forEach(function (error) {
            const errorElement = document.createElement('p');
            errorElement.textContent = error;
            errorAlert.appendChild(errorElement);
        });

        errorAlert.style.display = 'block';
    } else {
        // Submit the form if there are no errors
        const formData = {
            noEmpleado: noEmpleado,
            email: email,
            nombre: nombre,
            apellidoPaterno: apellidoPaterno,
            contrasena: contrasena
        };

        fetch('/usercreation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to the dashboard or perform other actions
                } else {
                    errors.push('Failed to create user.');
                    displayErrorAlert(errors);
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
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

});