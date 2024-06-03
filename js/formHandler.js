function handleFormSubmission(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const sugerencia = document.getElementById('sugerencia').value;
    const area = document.getElementById('area').value;
    const categoria = document.getElementById('categoria').value;
    const empleadosInput = document.getElementById('empleados').value;
    const empleadosArray = empleadosInput.split(',').map(Number);

    const status = 'Evaluando VSE';
    const type = (categoria === 'seguridad' || categoria === '5s') ? 'No Contable' : 'Contable';
    const feedback = '';
    const usersId = empleados;

    const data = {
        title: titulo,
        category: categoria,
        description: sugerencia,
        currentSituation: descripcion,
        area: area,
        status: status,
        type: type,
        feedback: feedback,
        usersId: usersId
    };

    fetch('/proposals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Optionally, close the modal and reset the form
        // $('#nueva-mejora').modal('hide');
        // document.getElementById('improvementForm').reset();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('improvementForm').addEventListener('submit', handleFormSubmission);
