
async function fetchAreas(){
    const url = 'http://127.0.0.1:8080/areas';
    const response = await fetch(url);

    if (response.ok){
        const data = await response.json();

        for (const item of data){
            const select = document.getElementById('area');
            const optionElement = document.createElement("option");
            optionElement.value = item.name;
            optionElement.textContent = item.name;
            select.appendChild(optionElement);
        }
    }
}
fetchAreas();

document.getElementById('improvementForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const sugerencia = document.getElementById('sugerencia').value;
    const area = document.getElementById('area').value;
    const categoria = document.getElementById('categoria').value;
    const empleadosInput = document.getElementById('empleados').value;
    const empleadosArray = empleadosInput.split(',');

    const data = {
        title: titulo,
        category: categoria,
        description: sugerencia,
        currentSituation: descripcion,
        area: area,
        status: 'Evaluando VSE',
        type: (categoria === 'seguridad' || categoria === '5s') ? 'No Contable' : 'Contable',
        feedback: '',
        usersId: empleadosArray
    };
    
    async function fetchData() {
        const response = await fetch('http://127.0.0.1:8080/proposals', {
            method: 'POST',
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

    fetchData();
    
});

function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `alert alert-${type}`;
    messageElement.style.display = 'block';

    // Después de unos segundos, ocultar el mensaje automáticamente
    setTimeout(function() {
        messageElement.style.display = 'none';
    }, 5000); // Oculta el mensaje después de 5 segundos (5000 milisegundos)
}