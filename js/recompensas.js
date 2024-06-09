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

async function fetchProductDetails(id) {
    const url = `http://127.0.0.1:8080/products?id=${id}`;
    const response = await fetch(url);
  
    if (response.ok) {
      const product = await response.json();
      return product;
    } else {
      console.log('Error fetching product details');
      return null;
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

async function makeOrder(total, productId, quantity, id){
    const url = 'http://127.0.0.1:8080/orders';
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id : id,
            username: sessionStorage.getItem('username'),
            orderStatus: 'En Proceso',
            total: total,
            productId: productId,
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

async function editProduct(id,name,description,price,image) {
    const url = `http://127.0.0.1:8080/products`
    const params = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id : id,
            name: name,
            description: description,
            price: price,
            image: image
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

async function deleteProduct(id){
    const url = `http://127.0.0.1:8080/products?id=${id}`
    const params = {
        method: 'DELETE',
    };
    const response = await fetch(url, params);

    if(response.ok){
        return true;
    } else {
        console.log(response.json);
    }
    return false;
}

async function addProduct(name,description,price,image){
    const url = `http://127.0.0.1:8080/products`
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description,
            price: price,
            image: image
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

function updateCartDisplay(modalCartItemsElement,modalCartTotalElement,cartItems) {
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
            updateCartDisplay(modalCartItemsElement,modalCartTotalElement);
        });
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    await fetchProducts();

    const productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
    const productoForm = document.getElementById('productoForm');
    let currentProductId = null;
    let isEdit = null;
    const user = await fetchUser(sessionStorage.getItem('username'));

    if(user.role == 'admin' || user.role == 'vse'){
        document.getElementById('boton_editar').style.display = 'block';

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
                agregarButton.addEventListener('click', async function() {
                    isEdit = false;
                    currentProductId = null;

                    productoForm.reset();

                    document.getElementById('productoModalLabel').innerText = 'Agregar Producto';

                    productoModal.show();

                });
                this.parentNode.insertBefore(agregarButton, this.nextSibling);
            }

            const addButtons = document.querySelectorAll('.agregar-carrito');
            addButtons.forEach(button => {
                const modifyButton = document.createElement('button');
                modifyButton.className = 'boton modificar-producto';
                modifyButton.innerText = 'Modificar';
                modifyButton.addEventListener('click',async function() {
                    isEdit = true;
                    currentProductId = button.getAttribute('data-id');
                    const product = await fetchProductDetails(currentProductId);
                    if (product) {
                        // Populate form fields
                        document.getElementById('productName').value = product.name;
                        document.getElementById('productDescription').value = product.description;
                        document.getElementById('productPrice').value = product.price;
                        document.getElementById('productImage').value = product.image;
                        
                        document.getElementById('productoModalLabel').innerText = 'Modificar Producto';

                        // Show modal
                        productoModal.show();
                      } else {
                        alert('Error fetching product details');
                      }
                    productoModal.show();
                });

                const deleteButton = document.createElement('button');
                deleteButton.className = 'boton eliminar-producto';
                deleteButton.innerText = 'Eliminar';
                deleteButton.addEventListener('click',async function() {
                    const card = this.closest('.product-card');
                    const id = button.getAttribute('data-id');
                    if (confirm(`¿Estas seguro que quieres borrar ${button.getAttribute('data-name')} de la lista de productos?`)){
                        const success = await deleteProduct(id);
                        if(success){
                            card.remove();  
                        }
                    }
                });

                button.parentNode.replaceChild(modifyButton, button);
                modifyButton.parentNode.insertBefore(deleteButton, modifyButton.nextSibling);
            });
        });
    }

    // Event listener for when a modify product form is submited
    productoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = document.getElementById('productPrice').value;
        const image = document.getElementById('productImage').value;
    
        let success;
        if (isEdit) {
        success = await editProduct(currentProductId, name, description, price, image);
        } else {
        success = await addProduct(name, description, price, image);
        }

        if (success) {
            alert(`Producto ${isEdit ? 'modificado' : 'agregado'} con éxito`);
            productoModal.hide();
            location.reload();
        } else {
            alert(`Error al ${isEdit ? 'modificar' : 'agregar'} el producto`);
        }
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

    // Functionality for the addToCart buttons
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


            updateCartDisplay(modalCartItemsElement,modalCartTotalElement,cartItems);

            cartAlertMessageElement.textContent = `${product} ha sido añadido al carrito`;
            cartAlertElement.classList.remove('d-none');
            cartAlertElement.classList.add('show');
            setTimeout(() => {
                cartAlertElement.classList.remove('show');
                cartAlertElement.classList.add('d-none');
            }, 3000);
        });
    });

    // Code for the checkout
    const modalCheckoutButton = document.getElementById('modal-checkout-btn');
    modalCheckoutButton.addEventListener('click', async function() {
        const userData = await fetchUser();
        if (cartTotal > userData['points']) {
            alert('Insufficient points');
            return;
        }
        orderId = Math.random(Date.now()).toString(32).replace("0.","").slice(0,5) + Date.now().toString(32).replace("0,","");
        for (const [id, item] of Object.entries(cartItems)) {
            const result = await makeOrder(item.quantity*item.price,id,item.quantity,orderId);
            console.log("Producto ", id, " Resultado: ", result);
        }

        // Reset cart
        cartTotal = 0;
        modalCartTotalElement.textContent = '0.00';
        Object.keys(cartItems).forEach(key => delete cartItems[key]);
        const user = await fetchUser(sessionStorage.getItem('username'));   
        document.getElementById('puntos').textContent = `${user.points} pts `;
        updateCartDisplay(modalCartItemsElement,modalCartTotalElement,cartItems);
    });
});