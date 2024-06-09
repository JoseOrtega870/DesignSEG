const tbodyElement = document.getElementById("proposals");

async function fetchUser() {
    const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
    if (!response.ok) return;

    const user = await response.json();
    for (const proposalId of user.proposals) {
        const proposal = await (await fetch(`http://127.0.0.1:8080/proposals?id=${proposalId}`)).json();
        const area = await (await fetch(`http://127.0.0.1:8080/areas?id=${proposal.area}`)).json();
        
        const row = document.createElement("tr");
        ["title", "areaName", "category", "status", "creationDate", "assignedPoints", "currentEvaluatorUser"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = proposal[key] || area.name;
            row.appendChild(cell);
        });
        
        row.addEventListener('click', () => new bootstrap.Modal(document.getElementById('myModal')).show());
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
        feedback: '',
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