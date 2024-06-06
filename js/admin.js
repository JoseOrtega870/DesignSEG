document.addEventListener("DOMContentLoaded",function(){
 
    async function fetchAreas(id){
        const url = `http://127.0.0.1:8080/areas/:${id}`;
        const response = await fetch(url);

        if (response.ok){
            const data = await response.json();
            console.log(data);
        }
    }    
    users = [];

    function openForm(data) {
        document.getElementById("employeeNumber").value = data[0];
        document.getElementById("employeeNumber").setAttribute("readonly",'true');
        document.getElementById("lastName").value = data[1];
        document.getElementById("middleName").value = data[2];
        document.getElementById("firstName").value = data[3];
        document.getElementById("area").value = data[4];
        document.getElementById("role").value = data[5];
        document.getElementById("points").value = data[6];
        const userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    }

    async function fetchUsers(){
        const url = 'http://127.0.0.1:8080/users';
        const response = await fetch(url);

        if (response.ok){
            const data = await response.json();

            for (const item of data){


                users.push({
                    username: item.username,                
                    middlename: item.midlename,
                    lastname:item.lastname,
                    firstname: item.firstname,
                    area: item.area,
                    role: item.role,
                    points: item.points
                })
            }
            const tbodyElement = document.getElementById("users");
            users.forEach(item => {
                // Crea una nueva fila (tr)
                const row = document.createElement("tr");
                // Crea y agrega celdas (td) a la fila
                for (const key in item) {
                    const cell = document.createElement("td");
                    cell.textContent = item[key];
                    row.appendChild(cell);
                    
                }
                row.addEventListener('click',function(){
                    const data = Array.from(this.children).map(cell => cell.textContent);
                    openForm(data);
                })
                // Agrega la fila completa al cuerpo de la tabla
                tbodyElement.appendChild(row);
            })
                
                }
    }

    fetchUsers();

    document.getElementById('userForm').addEventListener('submit',function(event){
        event.preventDefault();

        const username = document.getElementById('employeeNumber').value;
        const firstname = document.getElementById('firstname').value;
        const lastName = document.getElementById('lastName').value;
        const area = document.getElementById('area').value;
        const middleName = document.getElementById('middleName').value;
        const role = document.getElementById('role').value;
        const points = document.getElementById('points').value;

        

        async function updateUser() {
            const response = await fetch('http://127.0.0.1:8080/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                if(response.ok){
                    showMessage('Propuesta registrada exitosamente', 'success');
                } else{
                    showMessage('No se pudo registrar la propuesta. Inténtalo de nuevo más tarde.', 'error');
                }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('No se pudo registrar la propuesta. Inténtalo de nuevo más tarde.', 'error');
                });

        };
    })
    })
