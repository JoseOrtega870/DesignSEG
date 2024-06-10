const buttons = [
    {href:'home.html', text: 'Inicio'},
    {href:'#', text: 'Recompensas'},
    {href:'stats.html', text: 'Estadisticas'},
    {href:'vse.html', text: 'Evaluar'},
    {href:'#', text: 'Pedidos'},
    {href:'admin.html', text: 'Usuarios'}
]

function createButton(buttonDetails,container) {
    const a = document.createElement('a');
    a.href = buttonDetails.href;
    a.className = 'botones perfil';
    a.textContent = buttonDetails.text;
    container.appendChild(a);
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
document.addEventListener('DOMContentLoaded',async function(){
    const data = await fetchUser();
    document.getElementById('nombre').textContent = data['firstName'];
    document.getElementById('puntos').textContent = data['points'].toString().concat(' pts');

    
    
    switch (data['role']) {
        case 'admin':{
            let container = document.getElementById('containerLeft');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[0],container);
            createButton(buttons[1],container);
            createButton(buttons[2],container);
            createButton(buttons[3],container);


            container = document.getElementById('containerRight');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[4],container);
            createButton(buttons[5],container);

            break;
        }
        case 'vse':{
            let container = document.getElementById('containerLeft');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[0],container);
            createButton(buttons[1],container);
            createButton(buttons[2],container);
            createButton(buttons[3],container);


            container = document.getElementById('containerRight');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[4],container);


            break;
        }
        case 'champion':{
            let container = document.getElementById('containerLeft');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[0],container);
            createButton(buttons[1],container);
            createButton({href:'champion.html',text:"Evaluar"},container);

            container = document.getElementById('containerRight');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            break;
        }
        default:{
            let container = document.getElementById('containerLeft');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            createButton(buttons[0],container);
            createButton(buttons[1],container);
            container = document.getElementById('containerRight');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            break;
        }
    }
} )


document.querySelector('#cerrarSesion').addEventListener('click', function(event) {
    event.prevent();
    sessionStorage.removeItem('username');
    window.location.href='login.html';
});