function createProductCard(imgSrc, title, description, price, id) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <div class="card">
            <img src="img/${imgSrc}" alt="${title}">
            <h3>${title}</h3>
            <p>${description}</p>
            <p class="precio d-grid gap-2 col-6 mx-auto">${price} pts</p>
            <button class="boton agregar-carrito" data-id="${id}" data-price="${price}" data-name="${title}">Agregar al Carrito</button>
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
            const card = createProductCard(item.image, item.name, item.description, item.price, item.id);
            select.appendChild(card);
        }
    } else {
        console.log('Error fetching data');
    }
}

async function fetchUser(){
    const baseurl = 'http://127.0.0.1:8080/users?username=';
    const url = baseurl.concat(sessionStorage.getItem('username'));
    const response = await fetch(url);

    if (response.ok){
        const data = await response.json();
        return data;
    } else {
        return null;
    }
}

async function makeOrder(total, id, quantity){
    const url = 'http://127.0.0.1:8080/orders';
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: sessionStorage.getItem('username'),
            orderStatus: 'Pending',
            total: total,
            productId: id,
            quantity: quantity
        })
    };
    const response = await fetch(url, params);

    if(response.ok){
        return true;
    } else {
        console.log(response.json);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async function() {
    await fetchProducts();

    document.getElementById('boton_editar').addEventListener('click', function() {
        const terminarButtonExists = document.getElementById('boton_terminar');
        if (!terminarButtonExists) {
            const terminarButton = document.createElement('button');
            terminarButton.id = 'boton_terminar';
            terminarButton.className = 'btn btn-primary';
            terminarButton.innerText = 'Terminar';
            terminarButton.addEventListener('click', function() {
                location.reload();
            });
            this.parentNode.insertBefore(terminarButton, this.nextSibling);
        }

        const agregarButtonExists = document.getElementById('boton_agregar');
        if (!agregarButtonExists) {
            const agregarButton = document.createElement('button');
            agregarButton.id = 'boton_agregar';
            agregarButton.className = 'btn btn-success';
            agregarButton.innerText = 'Agregar';
            agregarButton.addEventListener('click', function() {
                alert('Agregar nuevo producto');
            });
            this.parentNode.insertBefore(agregarButton, this.nextSibling);
        }

        const addButtons = document.querySelectorAll('.agregar-carrito');
        addButtons.forEach(button => {
            const modifyButton = document.createElement('button');
            modifyButton.className = 'boton modificar-producto';
            modifyButton.innerText = 'Modificar';
            modifyButton.addEventListener('click', function() {
                alert('Modificar producto');
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'boton eliminar-producto';
            deleteButton.innerText = 'Eliminar';
            deleteButton.addEventListener('click', function() {
                const card = this.closest('.product-card');
                card.remove();
            });

            button.parentNode.replaceChild(modifyButton, button);
            modifyButton.parentNode.insertBefore(deleteButton, modifyButton.nextSibling);
        });
    });

    const cart = document.getElementById('cart');
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
            const id = this.getAttribute('data-id');
            const product = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));

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

            cartTotal += price;
            modalCartTotalElement.textContent = cartTotal.toFixed(2);

            function updateCartDisplay() {
                modalCartItemsElement.innerHTML = '';

                for (const [product, item] of Object.entries(cartItems)) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    li.innerHTML = `
                        ${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
                        <button class="btn btn-danger btn-sm remove-item" data-id="${product}">Remove</button>
                    `;
                    modalCartItemsElement.appendChild(li);

                    li.querySelector('.remove-item').addEventListener('click', function() {
                        const product = this.getAttribute('data-id');
                        cartTotal -= cartItems[product].price * cartItems[product].quantity;
                        modalCartTotalElement.textContent = cartTotal.toFixed(2);
                        delete cartItems[product];
                        updateCartDisplay();
                    });
                }
            }

            updateCartDisplay();

            cartAlertMessageElement.textContent = `${product} ha sido añadido al carrito`;
            cartAlertElement.classList.remove('d-none');
            cartAlertElement.classList.add('show');
            setTimeout(() => {
                cartAlertElement.classList.remove('show');
                cartAlertElement.classList.add('d-none');
            }, 3000);
        });
    });

    const modalCheckoutButton = document.getElementById('modal-checkout-btn');
    modalCheckoutButton.addEventListener('click', async function() {
        const userData = await fetchUser();
        if (cartTotal > userData['points']) {
            alert('Insufficient points');
            return;
        }

        for (const [id, item] of Object.entries(cartItems)) {
            console.log(id, item);
        }

        // Reset cart
        cartTotal = 0;
        modalCartTotalElement.textContent = '0.00';
        Object.keys(cartItems).forEach(key => delete cartItems[key]);
        updateCartDisplay();
    });
});