document.getElementById('improvementForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const sugerencia = document.getElementById('sugerencia').value;
    const area = document.getElementById('area').value;
    const categoria = document.getElementById('categoria').value;
    const empleadosInput = document.getElementById('empleados').value;
    const empleadosArray = empleadosInput.split(',').map(Number);

    // Crear el objeto de datos a enviar al servidor
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

    // Enviar los datos al servidor
    fetch('/proposals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            // Si la respuesta es exitosa, mostrar mensaje de éxito
            showMessage('Propuesta registrada exitosamente', 'success');
            // Opcionalmente, puedes cerrar el modal y reiniciar el formulario
            // $('#nueva-mejora').modal('hide');
            // document.getElementById('improvementForm').reset();
        } else {
            // Si la respuesta no es exitosa, mostrar mensaje de error
            showMessage('No se pudo registrar la propuesta. Inténtalo de nuevo más tarde', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Si hay un error, mostrar mensaje de error
        showMessage('No se pudo registrar la propuesta. Inténtalo de nuevo más tarde', 'error');
    });
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