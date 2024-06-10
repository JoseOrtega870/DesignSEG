document.addEventListener('DOMContentLoaded', function () {
    startApp()
})

function startApp(){
    loadOrders()

    document.getElementById('filtro-pendientes').addEventListener('change', orderProposals)
    document.getElementById('filtro-historial').addEventListener('change', orderProposals)
}


async function loadOrders(  ){

    const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
    if (!response.ok) return;

    const user = await response.json();
    const username = user.username;

    const url = `http://127.0.0.1:8080/orders/?username=${username}`

    console.log(url)
    
    const orderFetch = await fetch(url)
    const orders = await orderFetch.json()

    console.log(orders)
    showOrders(orders)

}

async function showOrders( orders ){

    


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

    console.log(allOrdersRenderData)
    console.log(pendingOrdersRenderData)
}

// async function fetchUser() {
//     const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
//     if (!response.ok) return;

//     const user = await response.json();

//     console.log(user)

//     const order = await fetch(`http://127.0.0.1:8080/orders/?=${user['name']}`);
//     if (!order.ok) return;

//     console.log(order)

//     // for () {
//     //     console.log(orderId);

//     //     const order = await fetch(`http://127.0.0.1:8080/orders?id=${orderId}`);
//     //     if (!order.ok) return;



//     // }
// };

// fetchUser();
