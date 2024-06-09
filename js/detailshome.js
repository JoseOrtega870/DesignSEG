function showModal(proposalDetails) {
    const modalContent = `
        <div class="modal fade" id="proposalDetailsModal" tabindex="-1" aria-labelledby="proposalDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="proposalDetailsModalLabel">Detalles de la Propuesta</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Título:</strong> ${proposalDetails.title}</p>
                        <p><strong>Área:</strong> ${proposalDetails.areaName}</p>
                        <p><strong>Categoría:</strong> ${proposalDetails.category}</p>
                        <p><strong>Estado:</strong> ${proposalDetails.status}</p>
                        <p><strong>Fecha de Registro:</strong> ${proposalDetails.creationDate}</p>
                        <p><strong>Puntos Asignados:</strong> ${proposalDetails.assignedPoints}</p>
                        <p><strong>Evaluador Actual:</strong> ${proposalDetails.currentEvaluatorUser}</p>
                        <!-- Agrega más detalles si es necesario -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalContent);

    const proposalDetailsModal = new bootstrap.Modal(document.getElementById("proposalDetailsModal"));
    proposalDetailsModal.show();
}

document.querySelectorAll("#proposals tr").forEach(row => {
    row.addEventListener("click", async function() {
        const proposalId = row.dataset.proposalId;
        
        try {
            const response = await fetch(`http://127.0.0.1:8080/proposals?id=${proposalId}`);
            if (!response.ok) throw new Error("No se pudieron obtener los detalles de la propuesta.");

            const proposalDetails = await response.json();

            showModal(proposalDetails);
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudieron obtener los detalles de la propuesta. Inténtalo de nuevo más tarde.");
        }
    });
});
