document.addEventListener('DOMContentLoaded', function () {
    startApp()
})


function startApp(){
    loadProposals()

    document.getElementById('filtro-pendientes').addEventListener('change', orderProposals)
    document.getElementById('filtro-historial').addEventListener('change', orderProposals)
}

async function loadProposals(  ){

    const url = 'http://127.0.0.1:8080/proposals'
    const proposalFetch = await fetch(url)

    const proposals = await proposalFetch.json()

    const url2 = 'http://127.0.0.1:8080/orders'
    const orderFetch = await fetch(url2)
    const orders = await orderFetch.json()

    renderOrders(orders)

}

function renderOrders(orders) {
    const ordersDiv = document.getElementById('ordenes-pendientes')
    const allOrdersDiv = document.getElementById('historial-ordenes')

    const pendingOrders = orders.filter(order => order.orderStatus !== 'Aceptado, disponible para recoger' || order.orderStatus !== 'Rechazado' || order.orderStatus !== 'Entregado')
    const allOrders = orders.filter(order => order.orderStatus === 'Aceptado, disponible para recoger' || order.orderStatus === 'Rechazado' || order.orderStatus === 'Entregado')

    let pendingOrdersRenderData = {}
    let allOrdersRenderData = {}
    let products = {}

    pendingOrders.forEach(async order => {
        const productFetch = await fetch(`http://127.0.0.1:8080/products?id=${order.productId}`)
        const product = await productFetch.json()
        if (!pendingOrdersRenderData[order.id]) {
            pendingOrdersRenderData[order.id] = {
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                products: [product]
            }
        }
        pendingOrdersRenderData[order.id].products.push(product)

        if (!products[order.id]) {
            products[order.id] = []
        }

        products[order.id].push(product)
    })
    allOrders.forEach(async order => {
        const productFetch = await fetch(`http://127.0.0.1:8080/products?id=${order.productId}`)
        const product = await productFetch.json()

        if (!allOrdersRenderData[order.id]) {
            allOrdersRenderData[order.id] = {
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                products: [product]
            }
        }
        allOrdersRenderData[order.id].products.push(product)

        if (!products[order.id]) {
            products[order.id] = []
        }

        products[order.id].push(product)
    })

    console.log(allOrdersRenderData)
    console.log(pendingOrdersRenderData)

    // Clean previous html 
    ordersDiv.innerHTML = ''
    allOrdersDiv.innerHTML = ''

    Object.values(allOrdersRenderData).forEach( orders => {
        console.log(orders)
        const productsRender = products[orders[0][0].id]
        const div = document.createElement('div')
        div.className = 'container py-2 rounded text-center shadow-sm mb-4'
        div.innerHTML += `

            <div class="row">
                <p class="col">Id: ${order.id}</p>
                <p class="col">Fecha del pedido: ${order.orderDate}</p>
                <p class="col">Producto: ${product.name}</p>
            </div>
            
            <div class="row">
                <p class="col">Estatus: ${order.orderStatus}</p>
                <p class="col">Cantidad: ${order.quantity}</p>
                <p class="col">Total: ${order.total}</p>
            </div>


        ` 
        const buttonDiv = document.createElement('div')
        buttonDiv.className = 'd-flex justify-content-end'

        const button = document.createElement('button')
        button.className = 'btn btn-primary btn-sm'
        button.textContent = 'Mas detalles'
        button.addEventListener('click', function(){
            showOrder(order.id)
        })

        buttonDiv.appendChild(button)

        div.appendChild(buttonDiv)

        ordersDiv.appendChild(div)

        allOrdersDiv.appendChild(div)
    })

    Object.values(pendingOrdersRenderData).forEach( orders => {
        console.log(orders)
        const productsRender = products[orders[0][0].id]

        const div = document.createElement('div')
        div.className = 'container py-2 rounded text-center shadow-sm mb-4'
        div.innerHTML += `

        <div class="row">
            <p class="col">Id: ${order.id}</p>
            <p class="col">Fecha del pedido: ${order.orderDate}</p>
            <p class="col">Producto: ${product.name}</p>
        </div>
        
        <div class="row">
            <p class="col">Estatus: ${order.orderStatus}</p>
            <p class="col">Cantidad: ${order.quantity}</p>
            <p class="col">Total: ${order.total}</p>
        </div>


    ` 
        const buttonDiv = document.createElement('div')
        buttonDiv.className = 'd-flex justify-content-end'

        const button = document.createElement('button')
        button.className = 'btn btn-primary btn-sm'
        button.textContent = 'Mas detalles'
        button.addEventListener('click', function(){
            showOrder(order.id)
        })

        buttonDiv.appendChild(button)

        div.appendChild(buttonDiv)

        ordersDiv.appendChild(div)
    })
}

async function showOrder(orderId){
    const url = `http://127.0.0.1:8080/orders?id=${orderId}`
    const ordersFetch = await fetch(url)
    const order = await ordersFetch.json()
    
    disableScroll()

    const modalContainer = document.querySelector('#proposalModalContainer')
    modalContainer.classList.remove('d-none')
    
    const closeModalButton = document.querySelector('#closeModalButton')
    closeModalButton.addEventListener('click', function(){
        modalContainer.classList.add('d-none')
        enableScroll()
    })

    let products = []
    let total = 0


    order.forEach(order => {
        console.log(order)
    })

    const modal = document.querySelector('#proposalModal')
    modal.innerHTML = `
        <div class="container text-center">
            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Titulo</p>
                    <p class="fs-5">${order.title}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Fecha del pedido </p>
                    <p class="fs-5">${order.orderDate}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Fecha de terminación </p>
                    <p class="fs-5">${order.closeDate === null || order.closeDate === undefined ? 'Pendiente' : order.closeDate}</p>
                </div>
            </div>
        </div>
    `
}

function disableScroll() {
    // Get the current page scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    // if any scroll is attempted,
    // set this to the previous value
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
}

function enableScroll() {
    window.onscroll = function () { };
}

async function orderProposals(e) {
    const url = 'http://127.0.0.1:8080/orders'
    const ordersFetch = await fetch(url)

    const orders = await ordersFetch.json()

    if (e.target.value === 'all') {
        orders.sort(function (a, b) {
            return a.orderDate.localeCompare(b.orderDate) // Grande el codeium
        })
        renderOrders(orders)
    }
    else if (e.target.value === 'status') {

        orders.sort(function (a, b) {
            return a.orderStatus.localeCompare(b.orderStatus) // Grande el codeium
        })
        renderOrders(orders)
    }
    else if (e.target.value === 'product') {
        orders.sort(function (a, b) {
            return a.productId === b.productId ? 0 : a.productId > b.productId ? 1 : -1
        })
        renderOrders(orders)
    }
    else if (e.target.value === 'date') {
        orders.sort(function (a, b) {
            return a.orderDate.localeCompare(b.orderDate) // Grande el codeium
        })
        renderOrders(orders)
    }
}