function createProductCard(imgSrc, title, description, price) {
    const card = document.createElement('div');
    card.className = 'col-3 p-0';

    card.innerHTML = `
        <div class="card">
            <img src=img/${imgSrc} alt="${title}">
            <h3>${title}</h3>
            <p>${description}</p>
            <p class="precio d-grid gap-2 col-6 mx-auto">${price} pts</p>
            <button class="boton">Agregar al Carrito</button>
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