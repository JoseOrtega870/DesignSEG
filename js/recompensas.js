function createProductCard(imgSrc, title, description, price) {
    const card = document.createElement('div');
    card.className = 'col-3 p-0';

    card.innerHTML = `
        <div class="card">
            <img src=img/${imgSrc} alt="${title}">
            <h3>${title}</h3>
            <p>${description}</p>
            <p class="precio d-grid gap-2 col-6 mx-auto">${price} pts</p>
            <button class="boton agregar-carrito">Agregar al Carrito</button>
        </div>
    `;
    return card;
}


async function fetchProducts(){
    const url = 'http://127.0.0.1:8080/products';
    const response = await fetch(url);

    if (response.ok){
        const data = await response.json();

        for (const item of data){
            const select = document.getElementById('products');
            const card = createProductCard(item.image,item.name,item.description,item.price)
            select.appendChild(card);
        }
    } else {
        console.log('Error fetching data')
    }
}

fetchProducts();

document.getElementById('boton_editar').addEventListener('click', function() {
    // Verificar si ya existe un botón "Terminar"
    const terminarButtonExists = document.getElementById('boton_terminar');
    if (!terminarButtonExists) {
        // Si no existe, crear uno nuevo
        const terminarButton = document.createElement('button');
        terminarButton.id = 'boton_terminar';
        terminarButton.className = 'btn btn-primary';
        terminarButton.innerText = 'Terminar';
        terminarButton.addEventListener('click', function() {
            // Recargar la página
            location.reload();
        });

        // Insertar el botón "Terminar" después del botón "Editar Tienda"
        this.parentNode.insertBefore(terminarButton, this.nextSibling);
    }
    
    // Verificar si ya existe un botón "Agregar"
    const agregarButtonExists = document.getElementById('boton_agregar');
    if (!agregarButtonExists) {
        // Si no existe, crear uno nuevo
        const agregarButton = document.createElement('button');
        agregarButton.id = 'boton_agregar';
        agregarButton.className = 'btn btn-success';
        agregarButton.innerText = 'Agregar';
        agregarButton.addEventListener('click', function() {
            // Agregar lógica para agregar un nuevo producto aquí
            alert('Agregar nuevo producto');
        });

        // Insertar el botón "Agregar" después del botón "Editar Tienda"
        this.parentNode.insertBefore(agregarButton, this.nextSibling);
    }

    const addButtons = document.querySelectorAll('.agregar-carrito');

    addButtons.forEach(button => {
        // Create Modify Button
        const modifyButton = document.createElement('button');
        modifyButton.className = 'boton modificar-producto';
        modifyButton.innerText = 'Modificar';
        modifyButton.addEventListener('click', function() {
            // Add modify product logic here
            alert('Modificar producto');
        });

        // Create Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'boton eliminar-producto';
        deleteButton.innerText = 'Eliminar';
        deleteButton.addEventListener('click', function() {
            // Add delete product logic here
            alert('Eliminar producto');
            const card = this.closest('.card');
            card.remove();
        });

        // Replace the "Agregar al Carrito" button with the new buttons
        button.parentNode.replaceChild(modifyButton, button);
        modifyButton.parentNode.insertBefore(deleteButton, modifyButton.nextSibling);
    });
});