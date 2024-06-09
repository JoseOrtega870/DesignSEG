async function fetchAreaName(areaId) {
    try {
        const response = await fetch("http://127.0.0.1:8080/areas?id=${areaId}");
        if (response.ok) {
            const area = await response.json();
            return area.name;
        } else {
            console.error('Failed to fetch area:', response.status);
            return 'No Disponible'; // Valor predeterminado en caso de error
        }
    } catch (error) {
        console.error('Error fetching area:', error);
        return 'No Disponible'; // Valor predeterminado en caso de error
    }
}

function createTableCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

function appendRowToTable(tableBody, cells) {
    const row = document.createElement("tr");
    cells.forEach(cell => row.appendChild(cell));
    tableBody.appendChild(row);
}

async function fetchProposals() {
    const response = await fetch('http://127.0.0.1:8080/proposals');

    if (response.ok) {
        const proposals = await response.json();
        const tbodyElement = document.getElementById("proposals");
        tbodyElement.innerHTML = ''; // Limpiar el contenido anterior de la tabla

        for (const proposal of proposals) {
            const areaName = await fetchAreaName(proposal.area);
            const cells = [
                createTableCell(proposal.title),
                createTableCell(areaName),
                createTableCell(proposal.category),
                createTableCell(proposal.status),
                createTableCell(proposal.creationDate),
                createTableCell(proposal.assignedPoints || 'N/A'),
                createTableCell(proposal.currentEvaluatorUser)
            ];
            appendRowToTable(tbodyElement, cells);
        }
    } else {
        console.error('Failed to fetch proposals:', response.status);
    }
}