

async function fetchUser() {
    const response = await fetch(`http://127.0.0.1:8080/users?username=${sessionStorage.getItem('username')}`);
    if (!response.ok) return;

    const user = await response.json();

    console.log(user)

    const order = await fetch(`http://127.0.0.1:8080/orders`);
    if (!order.ok) return;

    console.log(order)

    // for () {
    //     console.log(orderId);

    //     const order = await fetch(`http://127.0.0.1:8080/orders?id=${orderId}`);
    //     if (!order.ok) return;



    // }
};

fetchUser();
