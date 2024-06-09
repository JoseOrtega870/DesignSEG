document.addEventListener("DOMContentLoaded", async function () {
    let areas = [];

    async function fetchAreas() {
        const response = await fetch('http://127.0.0.1:8080/areas');
        if (!response.ok) return;

        const data = await response.json();
        areas = data;
        const selects = [document.getElementById('area'), document.getElementById('selectEditArea')];
        selects.forEach(select => {
            select.innerHTML = select === selects[1] ? '<option value="" disabled selected>Seleccione un área</option>' : '';
            data.forEach(item => {
                const optionElement = document.createElement("option");
                optionElement.value = select === selects[1] ? item.id : item.name;
                optionElement.textContent = item.name;
                select.appendChild(optionElement);
            });
        });
    }

    document.getElementById('selectEditArea').addEventListener('change', function() {
        const selectedArea = areas.find(area => area.id == this.value);
        document.getElementById('editAreaName').value = selectedArea.name;
        document.getElementById('editEmployeeInCharge').value = selectedArea.manager;
    });

    function openForm(data) {
        const formMapping = { "employeeNumber": data[0], "firstName": data[3], "lastName": data[1], "middleName": data[2], "area": data[4], "role": data[5], "points": data[6], "email": data[7] };
        Object.entries(formMapping).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element.tagName === "SELECT") {
                Array.from(element.options).forEach(option => { if (option.textContent === value) option.selected = true; });
            } else {
                element.value = value;
                if (key === "employeeNumber") element.setAttribute("readonly", 'true');
            }
        });
        new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    async function fetchUsers() {
        const response = await fetch('http://127.0.0.1:8080/users');
        if (!response.ok) return;

        const users = await response.json();
        const tbodyElement = document.getElementById("users");
        tbodyElement.innerHTML = '';
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

            row.addEventListener('click', () => openForm([user.username, user.lastName, user.middleName, user.firstName, user.areaName, user.role, user.points, user.email, user.proposals]));
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
        return password === '' || [/^.{8,}$/, /[A-Z]/, /[a-z]/, /\d/, /[!@#$%^&*(),.?":{}|<>]/].every(regex => regex.test(password));
    }

    async function handleUserAction(url, method, data, successMessage, errorMessage) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showMessage('message', response.ok ? successMessage : errorMessage, response.ok ? 'success' : 'error');
            if (response.ok && method !== 'DELETE') fetchUsers();
        } catch (error) {
            console.error('Error:', error);
            showMessage('message', errorMessage, 'error');
        }
    }

    async function handleAreaAction(url, method, data, successMessage, errorMessage) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showMessage(method === 'POST' ? 'areaMessage' : 'areaEditMessage', response.ok ? successMessage : errorMessage, response.ok ? 'success' : 'error');
            if (response.ok) fetchAreas();
        } catch (error) {
            console.error('Error:', error);
            showMessage(method === 'POST' ? 'areaMessage' : 'areaEditMessage', errorMessage, 'error');
        }
    }

    document.getElementById('userForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const areaId = areas.find(area => area.name === formData.get('area')).id;
        const password = formData.get('newPassword');
        const passwordConfirmation = formData.get('newPasswordConfirmation');

        if (password !== passwordConfirmation) {
            showMessage('message', 'Contraseñas no coinciden', 'error');
        } else if (!validatePassword(password)) {
            showMessage('message', 'Contraseña no cumple parámetros de seguridad', 'error');
        } else {
            const updatedUser = Object.fromEntries(formData.entries());
            updatedUser.area = Number(areaId);
            updatedUser.currentUser = sessionStorage.getItem('username');
            if (password === '') delete updatedUser.password;
            handleUserAction('http://127.0.0.1:8080/users', 'PUT', updatedUser, 'Usuario actualizado exitosamente', 'No se pudo actualizar el usuario. Inténtalo de nuevo más tarde.');
            event.target.reset();
        }
    });

    

    document.getElementById('areaForm').addEventListener('submit', function (event) {
        event.preventDefault();
        handleAreaAction('http://127.0.0.1:8080/areas', 'POST', { name: document.getElementById('areaName').value, manager: document.getElementById('employeeInCharge').value }, 'Área registrada exitosamente', 'No se pudo registrar el área. Inténtalo de nuevo más tarde.');
    });

    document.getElementById('editAreaForm').addEventListener('submit', function (event) {
        event.preventDefault();
        handleAreaAction(`http://127.0.0.1:8080/areas?id=${document.getElementById('selectEditArea').value}`, 'PUT', { currentUser: sessionStorage.getItem('username'), id: document.getElementById('selectEditArea').value, name: document.getElementById('editAreaName').value, manager: document.getElementById('editEmployeeInCharge').value }, 'Área actualizada exitosamente', 'No se pudo actualizar el área. Inténtalo de nuevo más tarde.');
    });

    await fetchAreas();
    await fetchUsers();
});
