const tbodyElement = document.getElementById("proposals");
let currentProposalId = null;

function displayMessage(container,sender,message){
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    container.appendChild(messageDiv);
}

async function fetchUser() {
    const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
    if (!response.ok) return;

    const user = await response.json();
    for (const proposalId of user.proposals) {
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${proposalId}`)).json();
        const area = await (await fetch(`http://127.0.0.1:8080/areas?id=${proposal.area}`)).json();
        proposal.areaName = area.name;
        
        
        const row = document.createElement("tr");
        ["title", "areaName", "category", "status", "creationDate", "assignedPoints", "currentEvaluatorUser"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = proposal[key];
            row.appendChild(cell);
        });
        
        row.addEventListener('click', function(){
            currentProposalId = proposalId; 
            const modal = new bootstrap.Modal(document.getElementById('myModal'));
            ["title", "currentSituation", "description","areaName", "status", "category", "creationDate", "assignedPoints"].forEach(key => {
                document.getElementById(key).value = proposal[key];
            });
            proposal['users'] = proposal['users'].filter(item => item != sessionStorage.getItem('username'));
            document.getElementById('users').value = proposal['users'].join(', ');
            messageContainer = document.getElementById('feedbackContainer');
            messageContainer.innerHTML = `<label>Mensajes</label>`;
            const proposalJSON = JSON.parse(proposal.feedback);
            console.log(proposalJSON);
            proposalJSON.forEach(key => {
                displayMessage(messageContainer,key[0],key[1]);
            });
            const messageField = document.createElement('input');
            messageField.className = 'form-control';
            messageField.type = 'text';
            messageField.id = 'feedback';
            messageContainer.appendChild(messageField);
            modal.show();
        });
        tbodyElement.appendChild(row);
    }
}
fetchUser();

var areasOut = [];
async function fetchAreas(){
    const response = await fetch('http://127.0.0.1:8080/areas');
    if (!response.ok) return;

    const areas = await response.json();
    const select = document.getElementById('area');
    areas.forEach(area => {
        const optionElement = document.createElement("option");
        optionElement.value = area.name;
        optionElement.textContent = area.name;
        select.appendChild(optionElement);
    });
    areasOut = areas;
}
fetchAreas();

document.getElementById('improvementForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const areaId = areasOut.find(area => area.name === formData.get('area')).id;
    const currentUser = sessionStorage.getItem('username');
    const empleadosArray = formData.get('empleados').split(',').concat(currentUser);

    const data = {
        title: formData.get('titulo'),
        category: formData.get('categoria'),
        description: formData.get('sugerencia'),
        currentSituation: formData.get('descripcion'),
        area: areaId,
        status: 'Evaluando VSE',
        type: (formData.get('categoria') === 'seguridad' || formData.get('categoria') === '5s') ? 'No Contable' : 'Contable',
        feedback: '[]',
        usersId: empleadosArray
    };

    try {
        const response = await fetch('http://127.0.0.1:8080/proposals', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        showMessage(response.ok ? 'Propuesta registrada exitosamente' : 'No se pudo registrar la propuesta. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');
    } catch (error) {
        console.error('Error:', error);
        showMessage('No se pudo registrar la propuesta. Inténtalo de nuevo más tarde.', 'error');
    }

    event.target.reset();
});

function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `alert alert-${type}`;
    messageElement.style.display = 'block';

    setTimeout(() => messageElement.style.display = 'none', 5000);
}

function adjustModalBodyHeight() {
    const modalBody = document.querySelector('.modal-body');
    const windowHeight = window.innerHeight;
    const maxHeight = windowHeight * 0.7; // 70% of the window height
    modalBody.style.maxHeight = `${maxHeight}px`;
}

window.addEventListener('resize', adjustModalBodyHeight);
 
adjustModalBodyHeight();


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
        console.log(JSON.parse(params.body));
    const response = await fetch('http://127.0.0.1:8080/proposals', params);
    if(response.ok){
        location.reload();
    }
    console.log(response.ok ? 'Mensaje añadido exitosamente' : 'No se pudo mandar el mensaje. Inténtalo de nuevo más tarde.', response.ok ? 'success' : 'error');

});