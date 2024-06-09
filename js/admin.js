document.addEventListener("DOMContentLoaded", async function () {
    let areas = [];

    async function fetchAreas() {
        const response = await fetch('http://127.0.0.1:8080/areas');
        if (!response.ok) return;

        const data = await response.json();
        areas = data;
        const select = document.getElementById('area');
        data.forEach(item => {
            const optionElement = document.createElement("option");
            optionElement.value = item.name;
            optionElement.textContent = item.name;
            select.appendChild(optionElement);
        });
    }

    function openForm(data) {
        const formMapping = {
            "employeeNumber": data[0],
            "firstName": data[3],
            "lastName": data[1],
            "middleName": data[2],
            "area": data[4],
            "role": data[5],
            "points": data[6],
            "email": data[7]
        };

        for (const [key, value] of Object.entries(formMapping)) {
            const element = document.getElementById(key);
            if (element.tagName === "SELECT") {
                for (const option of element.options) {
                    if (option.textContent === value) {
                        option.selected = true;
                        break;
                    }
                }
            } else {
                element.value = value;
                if (key === "employeeNumber") {
                    element.setAttribute("readonly", 'true');
                }
            }
        }

        new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    async function fetchUsers() {
        const response = await fetch('http://127.0.0.1:8080/users');
        if (!response.ok) return;

        const users = await response.json();
        const tbodyElement = document.getElementById("users");
        for (const user of users) {
            const areaResponse = await fetch(`http://127.0.0.1:8080/areas?id=${user.area}`);
            const area = await areaResponse.json();
            user.areaName = area.name;

            const row = document.createElement("tr");
            ["username", "lastName", "middleName", "firstName", "areaName", "role", "points", "email", "proposals"].forEach(key => {
                const cell = document.createElement("td");
                cell.textContent = user[key];
                row.appendChild(cell);
            });

            row.addEventListener('click', () => openForm([
                user.username, user.lastName, user.middleName, user.firstName,
                user.areaName, user.role, user.points, user.email, user.proposals
            ]));
            tbodyElement.appendChild(row);
        }
    }

    function showMessage(elementId, message, type) {
        const messageElement = document.getElementById(elementId);
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';
        setTimeout(() => messageElement.style.display = 'none', 5000);
    }

    function validatePassword(password) {
        if (password === '') return true;
        return [
            /.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[!@#$%^&*(),.?":{}|<>]/
        ].every(regex => regex.test(password));
    }

    async function updateUser(data) {
        try {
            const response = await fetch('http://127.0.0.1:8080/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showMessage('message', response.ok ? 'Usuario actualizado exitosamente' : 'No se pudo actualizar el usuario. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');
        } catch (error) {
            console.error('Error:', error);
            showMessage('message', 'No se pudo actualizar el usuario. Inténtalo de nuevo más tarde.', 'error');
        }
    }

    async function deleteUser(data) {
        try {
            const response = await fetch('http://127.0.0.1:8080/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showMessage('message', response.ok ? 'Usuario eliminado exitosamente' : 'No se pudo eliminar el usuario. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');
        } catch (error) {
            console.error('Error:', error);
            showMessage('message', 'No se pudo eliminar el usuario. Inténtalo de nuevo más tarde.', 'error');
        }
    }

    async function registerArea(data) {
        try {
            const response = await fetch('http://127.0.0.1:8080/areas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showMessage('areaMessage', response.ok ? 'Área registrada exitosamente' : 'No se pudo registrar el área. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');
            if (response.ok) fetchAreas();
        } catch (error) {
            console.error('Error:', error);
            showMessage('areaMessage', 'No se pudo registrar el área. Inténtalo de nuevo más tarde.', 'error');
        }
    }

    document.getElementById('userForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const areaId = areas.find(area => area.name === formData.get('area')).id;
        const currentUser = sessionStorage.getItem('username');
        const password = formData.get('newPassword');
        const passwordConfirmation = formData.get('newPasswordConfirmation');

        if (password !== passwordConfirmation) {
            showMessage('message', 'Contraseñas no coinciden', 'error');
        } else if (!validatePassword(password)) {
            showMessage('message', 'Contraseña no cumple parámetros de seguridad', 'error');
        } else {
            const updatedUser = Object.fromEntries(formData.entries());
            updatedUser.area = Number(areaId);
            updatedUser.currentUser = currentUser;
            if (password === '') delete updatedUser.password;
            updateUser(updatedUser);
            event.target.reset();
        }
    });

    document.getElementById('deleteUser').addEventListener('click', function (event) {
        event.preventDefault();
        deleteUser({
            currentUser: sessionStorage.getItem('username'),
            deleteUser: document.getElementById('employeeNumber').value
        });
        document.getElementById('userForm').reset();
    });

    document.getElementById('areaForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const areaName = document.getElementById('areaName').value;
        const employeeInCharge = document.getElementById('employeeInCharge').value;
        registerArea({
            name: areaName,
            manager: employeeInCharge
        });
    });

    await fetchAreas();
    await fetchUsers();
});
