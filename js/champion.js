let currentProposalId = null;
function displayMessage(container,sender,message){
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    container.appendChild(messageDiv);
}

async function fetchUserById(username){
    const url = `http://127.0.0.1:8080/users?username=${username}`;
    const response = await fetch(url);

    if (response.ok){
        const data = await response.json();
        return data;
    } else {
        return null;
    }
}

async function handleUserAction(url, method, data) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}


async function fetchProposals() {
    const responseEvaluando = await fetch(`http://127.0.0.1:8080/proposals?status=Evaluando Champion`);
    
    const pendingByCurrentUser = (await responseEvaluando.json()).filter(element => element.currentEvaluatorUser == sessionStorage.getItem('username'));
    const responseApproved = await fetch(`http://127.0.0.1:8080/proposals?status=Aprobada`);
    const approvedByCurrentUser = (await responseApproved.json()).filter(element => element.currentEvaluatorUser == sessionStorage.getItem('username'));
    const status = pendingByCurrentUser.concat(approvedByCurrentUser);
    const tbodyElement = document.getElementById('proposals');
    for (const proposal of status) {
        const area = await (await fetch(`http://127.0.0.1:8080/areas?id=${proposal.area}`)).json();
        proposal.areaName = area.name;
        
        
        const row = document.createElement("tr");
        ["title", "areaName", "category", "status", "creationDate"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = proposal[key];
            row.appendChild(cell);
        });
        
        row.addEventListener('click', function(){
            currentProposalId = proposal.id; 
            const modal = new bootstrap.Modal(document.getElementById('myModal'));
            ["title", "currentSituation", "description","areaName", "status", "category", "creationDate", "assignedPoints"].forEach(key => {
                document.getElementById(key).value = proposal[key];
            });
            document.getElementById('users').value = proposal['users'].join(', ');
            messageContainer = document.getElementById('feedbackContainer');
            messageContainer.innerHTML = `<label>Mensajes</label>`;
            const proposalJSON = JSON.parse(proposal.feedback);
            proposalJSON.forEach(key => {
                displayMessage(messageContainer,key[0],key[1]);
            });
            const buttonsModal = document.getElementById("buttonsModal");
            if(proposal['status'] == 'Evaluando Champion'){

                const messageField = document.createElement('input');
                messageField.className = 'form-control';
                messageField.type = 'text';
                messageField.id = 'feedback';
                messageContainer.appendChild(messageField);
                const formField = document.getElementById('assignedPoints');
                formField.readOnly = false;
                console.log('here');
                buttonsModal.innerHTML = `<button type="button " class="btn btn-primary" data-toggle="modal" data-target="#redirectModal" data-dismiss="modal" id="redirect">Redirigir</button>
                <button type="button" class="btn btn-primary" id ='sendMessage'>Responder mensaje</button>
                <button type="button" class="btn btn-success" id ='accept'>Aceptar</button>
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" id ='deny'>Rechazar</button>`
                addListenersChampion();
            } else {
                const formField = document.getElementById('assignedPoints');
                formField.readOnly = true;
                buttonsModal.innerHTML = `<button type="button" class="btn btn-primary" id ='implement'>Marcar como implementada</button>`;
                addListenersApproved();
            }
            modal.show();
        });
        tbodyElement.appendChild(row);
    }
}

async function getChampsByArea(area){
    const champs = await (await fetch(`http://127.0.0.1:8080/users?role=champion`)).json();
    const usersArea = await (await fetch(`http://127.0.0.1:8080/users?area=${area}`)).json();
    const commonUsers = champs.filter(champ => 
        usersArea.some(user => user.username === champ.username)
    );
    return commonUsers;
}

async function addListenersApproved(){
    document.getElementById('implement').addEventListener('click', async function(){
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
        const area = await(await fetch(`http://127.0.0.1:8080/areas?id=${proposal['area']}`)).json();
        const areaManager = await (await fetch(`http://127.0.0.1:8080/users?username=${area['manager']}`)).json();
        const params = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                currentUser: sessionStorage.getItem('username'),
                proposalId: currentProposalId,
                title: proposal['title'],
                description: proposal['description'],
                currentSituation: proposal['currentSituation'],
                area: proposal['area'],
                status: 'Implementada',
                type: proposal['type'],
                feedback: proposal['feedback'],
                closeDate: proposal['closeDate'],
                category: proposal['category'],
                assignedPoints: proposal['assignedPoints'],
                usersId: proposal['users'],
                formerEvaluatorUser: proposal['formerEvaluatorUser'],
                currentEvaluatorUser: proposal['currentEvaluatorUser']
        })};
        const response = await fetch('http://127.0.0.1:8080/proposals', params);
        if(response.ok){
            alert(`Favor de enviar el formato Kaizen correspondiente a la mejora implementada al encargado de area por correo: ${areaManager['firstName']} ${areaManager['middleName']} --> ${areaManager['email']}`)
            location.reload();
        }

    });
}

async function addListenersChampion(){
    document.getElementById('redirect').addEventListener('click', async function(){
        const optionContainer = document.getElementById('selectUser');
        optionContainer.innerHTML = `<option value="" disabled selected>Seleccione un usuario</option>`;
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
        document.getElementById('proposalTitle').value = proposal['title']
        const users = await getChampsByArea(proposal['area']);
        for(const u of users){
            const option = document.createElement('option');
            option.text = `${u['username']}: ${u['firstName']} ${u['middleName']}`
            option.value = u['username'];
            optionContainer.appendChild(option);
        }
    });

    document.getElementById('proposalForm').addEventListener('submit', async function(evt){
        evt.preventDefault()
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
        const params = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                currentUser: sessionStorage.getItem('username'),
                proposalId: currentProposalId,
                title: proposal['title'],
                description: proposal['description'],
                currentSituation: proposal['currentSituation'],
                area: proposal['area'],
                status: 'Evaluando Champion',
                type: proposal['type'],
                feedback: proposal['feedback'],
                closeDate: proposal['closeDate'],
                category: proposal['category'],
                assignedPoints: proposal['assignedPoints'],
                usersId: proposal['users'],
                formerEvaluatorUser: sessionStorage.getItem('username'),
                currentEvaluatorUser: document.getElementById('selectUser').value
            })};
        const response = await fetch('http://127.0.0.1:8080/proposals', params);
        if(response.ok){location.reload();}
    });

    document.getElementById('sendMessage').addEventListener('click', async function (){
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
    
        const feedback = JSON.parse(proposal.feedback);
        if(document.getElementById('feedback').value == ""){
            alert('Mensaje vacio');
            return;
        }
        const currentMessage = [sessionStorage.getItem('username'),document.getElementById('feedback').value]
        feedback.push(currentMessage);
        const params = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                currentUser: sessionStorage.getItem('username'),
                proposalId: currentProposalId,
                title: proposal['title'],
                description: proposal['description'],
                currentSituation: proposal['currentSituation'],
                area: proposal['area'],
                status: proposal['status'],
                type: proposal['type'],
                feedback: JSON.stringify(feedback),
                closeDate: proposal['closeDate'],
                category: proposal['category'],
                assignedPoints: proposal['assignedPoints'],
                usersId: proposal['users'],
                formerEvaluatorUser: proposal['formerEvaluatorUser'],
                currentEvaluatorUser: proposal['currentEvaluatorUser']
            })};
        const response = await fetch('http://127.0.0.1:8080/proposals', params);
        if(response.ok){
            location.reload();
        }
        console.log(response.ok ? 'Mensaje añadido exitosamente' : 'No se pudo mandar el mensaje. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');
    });
    
    document.getElementById('accept').addEventListener('click', async function(){
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
        if(document.getElementById('assignedPoints').value == ""){
            alert('Por favor asigna puntos antes de aceptar la propuesta');
            return;
        }
    
        let now = new Date();
    
        let year = now.getFullYear();
        let month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        let day = now.getDate().toString().padStart(2, '0');
    
        const feedback = JSON.parse(proposal.feedback);
        const currentMessage = [sessionStorage.getItem('username'),document.getElementById('feedback').value]
        if(document.getElementById('feedback').value != ""){
            feedback.push(currentMessage);
        }
        const params = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                currentUser: sessionStorage.getItem('username'),
                proposalId: currentProposalId,
                title: proposal['title'],
                description: proposal['description'],
                currentSituation: proposal['currentSituation'],
                area: proposal['area'],
                status: 'Aprobada',
                type: proposal['type'],
                feedback: JSON.stringify(feedback),
                closeDate:`${year}-${month}-${day}`,
                category: proposal['category'],
                assignedPoints: document.getElementById('assignedPoints').value,
                usersId: proposal['users'],
                formerEvaluatorUser: proposal['formerEvaluatorUser'],
                currentEvaluatorUser: proposal['currentEvaluatorUser']
            })};
        const response = await fetch('http://127.0.0.1:8080/proposals', params);
        for(const user of proposal['users']){
            const userData = await fetchUserById(user);
            userData['points'] =  parseInt(document.getElementById('assignedPoints').value) + parseInt(userData['points']);
            userData['username'] = user;
            userData['currentUser'] = sessionStorage.getItem('username');
            userData['firstname'] = userData['firstName'];
            userData['lastname'] = userData['lastName'];
            userData['middlename'] = userData['middleName'];
            await handleUserAction('http://127.0.0.1:8080/users', 'PUT', userData);
        }
        if(response.ok){
            location.reload();
        }
        
    });
    
    document.getElementById('deny').addEventListener('click', async function(){
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${currentProposalId}`)).json();
    
        let now = new Date();
    
        let year = now.getFullYear();
        let month = (now.getMonth() + 1).toString().padStart(2, '0');
        let day = now.getDate().toString().padStart(2, '0');
    
        const feedback = JSON.parse(proposal.feedback);
        const currentMessage = [sessionStorage.getItem('username'),document.getElementById('feedback').value]
        if(document.getElementById('feedback').value == ""){
            alert('Por favor pon un mensaje con el motivo de rechazo antes de rechazar la propuesta');
            return;
        }
        const params = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                currentUser: sessionStorage.getItem('username'),
                proposalId: currentProposalId,
                title: proposal['title'],
                description: proposal['description'],
                currentSituation: proposal['currentSituation'],
                area: proposal['area'],
                status: 'Rechazada',
                type: proposal['type'],
                feedback: JSON.stringify(feedback),
                closeDate:`${year}-${month}-${day}`,
                category: proposal['category'],
                assignedPoints: document.getElementById('assignedPoints').value,
                usersId: proposal['users'],
                formerEvaluatorUser: proposal['formerEvaluatorUser'],
                currentEvaluatorUser: proposal['currentEvaluatorUser']
            })};
    
        const response = await fetch('http://127.0.0.1:8080/proposals', params);
        if(response.ok){
            location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', async function(){
    await fetchProposals();
    
});