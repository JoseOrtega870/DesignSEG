async function fetchProposals() {
    const response = await fetch(`http://127.0.0.1:8080/proposals?status=Evaluando VSE`);
    if (!response.ok) return;
    const status = await response.json();
    const tbodyElement = document.getElementById('proposals');
    for (const proposal of status) {
        const area = await (await fetch(`http://127.0.0.1:8080/areas?id=${proposal.area}`)).json();
        proposal.areaName = area.name;
        
        
        const row = document.createElement("tr");
        ["title", "areaName", "category", "status", "creationDate", "assignedPoints"].forEach(key => {
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

document.addEventListener('DOMContentLoaded',async function(){
    let currentProposalId = null;
    await fetchProposals();
});