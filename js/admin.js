document.addEventListener("DOMContentLoaded", function () {  
    
    var areas = [];

    async function fetchAreas() {
        const url = 'http://127.0.0.1:8080/areas';
        const response = await fetch(url);
    
        if (response.ok) {
            const data = await response.json();
            areas = data;
            for (const item of data) {
                const select = document.getElementById('area');
                const optionElement = document.createElement("option");
                optionElement.value = item.name;
                optionElement.textContent = item.name;
                select.appendChild(optionElement);
            }
        }
    }

    fetchAreas();

    function openForm(data) {
        document.getElementById("employeeNumber").value = data[0];
        document.getElementById("employeeNumber").setAttribute("readonly", 'true');
        document.getElementById("lastName").value = data[1];
        document.getElementById("middleName").value = data[2];
        document.getElementById("firstName").value = data[3];
        const selectElement = document.getElementById('area');
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].textContent === data[4]) {
                selectElement.options[i].selected = true;
                break;
            }
        }
        document.getElementById("role").value = data[5];
        document.getElementById("points").value = data[6];
        document.getElementById("email").value = data[7];
        const userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    }

    async function fetchUsers() {
        const response = await fetch('http://127.0.0.1:8080/users');

        if (response.ok) {
            const users = await response.json();
            const processedUsers = [];
            for (const user of users) {
                const areaResponse = await fetch(`http://127.0.0.1:8080/areas?id=${user.area}`);
                const area = await areaResponse.json();
                const areaName = area.name;
                const processedUser = {
                    ...user,
                    areaName,
                };
                processedUsers.push(processedUser);
            }
            const tbodyElement = document.getElementById("users");
            processedUsers.forEach(user => {
                const row = document.createElement("tr");                   

                const usernameCell = document.createElement("td");
                usernameCell.textContent = user.username;
                row.appendChild(usernameCell);

                const lastNameCell = document.createElement("td");
                lastNameCell.textContent = user.lastName;
                row.appendChild(lastNameCell);

                const middleNameCell = document.createElement("td");
                middleNameCell.textContent = user.middleName;
                row.appendChild(middleNameCell);
                
                const firstNameCell = document.createElement("td");
                firstNameCell.textContent = user.firstName;
                row.appendChild(firstNameCell);

                const areaCell = document.createElement("td");
                areaCell.textContent = user.areaName;
                areaCell.setAttribute('id', user.area);
                row.appendChild(areaCell);

                const roleCell = document.createElement("td");
                roleCell.textContent = user.role;
                row.appendChild(roleCell);

                const pointsCell = document.createElement("td");
                pointsCell.textContent = user.points;
                row.appendChild(pointsCell);

                const emailCell = document.createElement("td");
                emailCell.textContent = user.email;
                row.appendChild(emailCell);

                const proposalsCell = document.createElement("td");
                proposalsCell.textContent = user.proposals;
                row.appendChild(proposalsCell);

                row.addEventListener('click', function () {
                    const data = Array.from(this.children).map(cell => cell.textContent);                    
                    openForm(data);
                    areas.push({ id: user.area, name: user.areaName });
                });
                tbodyElement.appendChild(row);
            });                
        }           
    }

    fetchUsers();

    document.getElementById('userForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('employeeNumber').value;
        const firstname = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const areaName = document.getElementById('area').value;
        const areaId = areas.find(area => area.name == areaName).id;
        const middleName = document.getElementById('middleName').value;
        const role = document.getElementById('role').value;
        const points = document.getElementById('points').value;
        const email = document.getElementById('email').value;
        const currentUser = sessionStorage.getItem('username');
        const password = document.getElementById('newPassword').value;
        const passwordConfirmation = document.getElementById('newPasswordConfirmation').value;

        var updatedUser = {};

        if (password == '') {
            updatedUser = {
                username: username,
                firstname: firstname,
                lastname: lastName,
                middlename: middleName,
                role: role,
                points: points,
                email: email,
                area: Number(areaId),
                currentUser: currentUser
            };
        } else {
            updatedUser = {
                username: username,
                firstname: firstname,
                lastname: lastName,
                middlename: middleName,
                role: role,
                points: points,
                email: email,
                area: Number(areaId),
                currentUser: currentUser,
                password: password
            };
        }

        async function updateUser() {
            const response = await fetch('http://127.0.0.1:8080/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            })
                .then(response => {
                    if (response.ok) {
                        showMessage('Usuario actualizado exitosamente', 'success');
                    } else {
                        showMessage('No se actualizar el usuario. Inténtalo de nuevo más tarde.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('No se actualizar el usuario. Inténtalo de nuevo más tarde.', 'error');
                });
        }

        if (password !== passwordConfirmation) {
            showMessage('Contraseñas no coinciden', 'error');
        } else if (!validatePassword(password)) {
            showMessage('Contraseña no cumple parámetros de seguridad', 'error');
        } else {
            updateUser();
            document.getElementById('newPassword').value = '';
            document.getElementById('newPasswordConfirmation').value = '';
        } 
    });

    document.getElementById('deleteUser').addEventListener('click', function (event) {
        event.preventDefault();

        const currentUser = sessionStorage.getItem('username');
        const username = document.getElementById('employeeNumber').value;

        const deletedUser = {
            currentUser: currentUser,
            deleteUser: username
        };

        async function deleteUser() {
            const response = await fetch('http://127.0.0.1:8080/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deletedUser)
            })
            .then(response => {
                if (response.ok) {
                    showMessage('Usuario eliminado exitosamente', 'success');
                } else {
                    showMessage('No se pudo eliminar el usuario. Inténtalo de nuevo más tarde.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('No se pudo eliminar el usuario. Inténtalo de nuevo más tarde.', 'error');
            });
        }

        deleteUser();

        const formElements = document.getElementById('userForm').querySelectorAll('input, textarea');
        for (const element of formElements) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            } else if (element.type === 'select-one') {
                element.selectedIndex = 0;
            } else {
                element.value = '';
            }
        }
    });

    document.getElementById('areaForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const areaName = document.getElementById('areaName').value;
        const employeeInCharge = document.getElementById('employeeInCharge').value; // Nuevo campo

        async function registerArea() {
            const response = await fetch('http://127.0.0.1:8080/areas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: areaName, employeeInCharge: employeeInCharge }) // Nuevo campo
            })
            .then(response => {
                if (response.ok) {
                    showAreaMessage('Área registrada exitosamente', 'success');
                    fetchAreas();
                } else {
                    showAreaMessage('No se pudo registrar el área. Inténtalo de nuevo más tarde.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAreaMessage('No se pudo registrar el área. Inténtalo de nuevo más tarde.', 'error');
            });
        }

        registerArea();
    });

    function showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';
    
        setTimeout(function () {
            messageElement.style.display = 'none';
        }, 5000);
    }

    function showAreaMessage(message, type) {
        const messageElement = document.getElementById('areaMessage');
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type}`;
        messageElement.style.display = 'block';
    
        setTimeout(function () {
            messageElement.style.display = 'none';
        }, 5000);
    }

    function validatePassword(password) {
        if (password == '') return true;
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const hasSpecialChar = specialCharRegex.test(password);
        
        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    }
});
