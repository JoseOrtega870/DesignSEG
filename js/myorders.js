document.addEventListener('DOMContentLoaded', function () {
    startApp()
})

function startApp(){
    loadOrders()

    document.getElementById('pendant-filter').addEventListener('change', orderProposals)
    document.getElementById('history-filter').addEventListener('change', orderProposals)
}



async function loadOrders(  ){

    const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
    if (!response.ok) return;

    const user = await response.json();
    const username = user.username;

    const url = `http://127.0.0.1:8080/orders?username=${username}`

    // console.log(url)
    
    const orderFetch = await fetch(url)
    const orders = await orderFetch.json()

    // console.log(orders)
    renderOrders(orders)

}

async function renderOrders( orders ){

    const ordersDiv = document.getElementById('pendant-orders')
    const allOrdersDiv = document.getElementById('order-history')

    const pendingOrders = orders.filter(order => order.orderStatus !== 'Aceptado, disponible para recoger' || order.orderStatus !== 'Rechazado' || order.orderStatus !== 'Entregado')
    const allOrders = orders.filter(order => order.orderStatus === 'Aceptado, disponible para recoger' || order.orderStatus === 'Rechazado' || order.orderStatus === 'Entregado')

    let pendingOrdersRenderData = {}
    let allOrdersRenderData = {}

    pendingOrders.forEach( order => {

        if (!pendingOrdersRenderData[order.id]) {
            pendingOrdersRenderData[order.id] = {
                id: order.id,
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                total: order.total
            }
        }
        else {
            pendingOrdersRenderData[order.id].total += order.total
        }
        
    })
    allOrders.forEach( order => {
        if (!allOrdersRenderData[order.id]) {
            allOrdersRenderData[order.id] = {
                id: order.id,
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                total: order.total
            }
        }
        else {
            allOrdersRenderData[order.id].total += order.total
        }

    })

    // console.log(allOrdersRenderData)
    // console.log(pendingOrdersRenderData)


    // Clean previous html 
    ordersDiv.innerHTML = ''
    allOrdersDiv.innerHTML = ''

    Object.values(allOrdersRenderData).forEach( order => {

        const div = document.createElement('div')
        div.className = 'container py-2 rounded text-center shadow-sm mb-4'
        div.innerHTML += `
            <div class="row">
                <p class="col">Id: ${order.id}</p>
                <p class="col">Fecha del pedido: ${order.orderDate}</p>

            </div>
            
            <div class="row">
                <p class="col">Estatus: ${order.orderStatus}</p>
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

    Object.values(pendingOrdersRenderData).forEach( order => {

        const div = document.createElement('div')
        div.className = 'container py-2 rounded text-center shadow-sm mb-4'
        div.innerHTML += `

        <div class="row">
            <p class="col">Id: ${order.id}</p>
            <p class="col">Fecha del pedido: ${order.orderDate}</p>

        </div>
        
        <div class="row">
            <p class="col">Estatus: ${order.orderStatus}</p>
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

async function showOrder(orderId){
    const url = `http://127.0.0.1:8080/orders?id=${orderId}`
    const ordersFetch = await fetch(url)
    const order = await ordersFetch.json()
    let orderRenderData = {}

    order.forEach( order => {
        if (!orderRenderData[order.id]) {
            orderRenderData[order.id] = {
                id: order.id,
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                total: order.total,
                products : [order.product],
                userId: order.userId
            }
        }
        else {
            orderRenderData[order.id].total += order.total
            orderRenderData[order.id].products.push(order.product)
        }
        
    })
    disableScroll()

    const modalContainer = document.querySelector('#proposalModalContainer')
    modalContainer.classList.remove('d-none')
    
    const closeModalButton = document.querySelector('#closeModalButton')
    closeModalButton.addEventListener('click', function(){
        modalContainer.classList.add('d-none')
        enableScroll()
    })

    let products = ""

    Object.values(orderRenderData).forEach( order => {
        order.products.forEach( product => {
            products += `<li class="fs-5 list-group-item">${product.name}</li>`
        })
    })

    let total = 0

    const modal = document.querySelector('#proposalModal')
    modal.innerHTML = `
        <div class="container text-center">

            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Id del pedido</p>
                    <p class="fs-5">${orderRenderData[orderId].id}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Fecha del pedido </p>
                    <p class="fs-5">${orderRenderData[orderId].orderDate}</p>
                </div>
            </div>
                
            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Estatus de la orden</p>
                    <p class="fs-5">${orderRenderData[orderId].orderStatus}</p>
                    
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Total de la orden</p>
                    <p class="fs-5">${orderRenderData[orderId].total} puntos</p>
                </div>
            </div>

            <div class="row">
                <div class="col"></div>
                    <p class="my-0 fs-4 fw-bold">Productos</p>
                    <ul class="fs-5 list-group list-group-flush">${products}</ul>
                </div>
            </div>
            
        </div>
    `


}

async function orderProposals(e) {
    console.log('Event occurred:', e);
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