function createProductCard(imgSrc, title, description, price, id) {
    const card = document.createElement('div');
    card.className = 'col-3 p-0';

    card.innerHTML = `
        <div class="card">
            <img src=img/${imgSrc} alt="${title}">
            <h3>${title}</h3>
            <p>${description}</p>
            <p class="precio d-grid gap-2 col-6 mx-auto">${price} pts</p>
            <button class="boton agregar-carrito" data-id="${id}" data-price=${price} data-name="${title}">Agregar al Carrito</button>
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
            const card = createProductCard(item.image,item.name,item.description,item.price,item.id)
            select.appendChild(card);
        }
    } else {
        console.log('Error fetching data')
    }
}

async function fetchUser(){
    const baseurl = 'http://127.0.0.1:8080/users?username=';
    const url = baseurl.concat(sessionStorage.getItem('username'))
    const response = await fetch(url);

    if (response.ok){
        const data = await response.json();
        return data;
    } else {
        return null;
    }
}


async function makeOrder(total,id,quantity){
    const url = 'http://127.0.0.1:8080/orders';
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username : sessionStorage.getItem('username'),
            orderStatus : 'Pending',
            total : total,
            productId : id,
            quantity : quantity
        })}
    const response = await fetch(url,params)

    if(response.ok){
        return true;
    } else {
        console.log(response.json)
    }
    return false;
}


document.addEventListener('DOMContentLoaded',async function() {
    await fetchProducts();
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

    // Agregar alerta cuando se agrega al carrito
    const cart = document.getElementById('cart')
    cart.addEventListener('click', function() {
        const cartModal = new bootstrap.Modal(document.getElementById('display-cart'));
        cartModal.show();
    });

    const addToCartButtons = document.querySelectorAll('.agregar-carrito');
    const cartItems = {};
    const modalCartItemsElement = document.getElementById('modal-cart-items');
    const modalCartTotalElement = document.getElementById('modal-cart-total');
    const cartAlertElement = document.getElementById('cart-alert');
    const cartAlertMessageElement = document.getElementById('cart-alert-message');

    let cartTotal = 0;
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Group all items that are the same
            console.log(this)
            const id = this.getAttribute('data-id')
            const product = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));

            // Add or update the product in the cart
            if (cartItems[id]) {
                cartItems[id].quantity += 1;
            } else {
                cartItems[id] = {
                    id: id,
                    name: product,
                    price: price,
                    quantity: 1
                };
            }

            // Update the cart total
            cartTotal += price;
            modalCartTotalElement.textContent = cartTotal.toFixed(2);

            function updateCartDisplay() {
                // Clear current cart items display
                modalCartItemsElement.innerHTML = '';
            
                // Populate the modal with updated cart items
                for (const [product, item] of Object.entries(cartItems)) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    li.innerHTML = `
                        ${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
                        <button class="btn btn-danger btn-sm remove-item" data-id="${product}">Remove</button>
                    `;
                    modalCartItemsElement.appendChild(li);
            
                    // Add event listener for remove button
                    li.querySelector('.remove-item').addEventListener('click', function() {
                        const product = this.getAttribute('data-id');
            
                        // Update the cart total
                        cartTotal -= cartItems[product].price * cartItems[product].quantity;
                        modalCartTotalElement.textContent = cartTotal.toFixed(2);
            
                        // Remove the product from the cart items
                        delete cartItems[product];
            
                        // Update the cart display
                        updateCartDisplay();
                    });
                }
            }
            
            updateCartDisplay(modalCartTotalElement);

            // Mostrar alerta cuando se agrega al carrito
            cartAlertMessageElement.textContent = `${product} se ha añadido al carrito`;
            cartAlertElement.classList.remove('d-none');
            cartAlertElement.classList.add('show');
            setTimeout(() => {
                cartAlertElement.classList.remove('show');
                cartAlertElement.classList.add('d-none');
            }, 3000);
        });
    });

    const modalCheckoutButton = document.getElementById('modal-checkout-btn');
    modalCheckoutButton.addEventListener('click',async function() {
        userData = await fetchUser();
        if(cartTotal > userData['points']){
            // Alert of insufficient points
            return;
        }

        //for loop of all items
        for(const [id,item] of Object.entries(cartItems)){
            console.log(id,item)
        }
        //reset all needed values to 0
    });

});

