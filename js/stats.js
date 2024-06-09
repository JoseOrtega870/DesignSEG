async function createCharts( props ) {

    const response = await fetch('http://127.0.0.1:8080/users');

    const users = await response.json()
    console.log(users)

    let proposalsByUser = {}

    users.forEach( user => {
        if( !proposalsByUser[user.username] ) proposalsByUser[user.username] = user.proposals.length
    })


    const proposals = props.slice(0, 200)

    let proposalsByArea = {}

    let proposalsByDate = {}

    let proposalsByCategory = {}

    let proposalsByStatus = {}

    let proposalsByType = {}
    
    proposals.forEach( proposal => {

        if (!proposalsByArea[proposal.area]) {
          proposalsByArea[proposal.area] = 0
        }
        proposalsByArea[proposal.area]++


        if (!proposalsByDate[proposal.creationDate]) {
          proposalsByDate[proposal.creationDate] = 0
        }
        proposalsByDate[proposal.creationDate]++


        if (!proposalsByCategory[proposal.category]) {
          proposalsByCategory[proposal.category] = 0
        }
        proposalsByCategory[proposal.category]++

        if (!proposalsByStatus[proposal.status]) {
          proposalsByStatus[proposal.status] = 0
        }
        proposalsByStatus[proposal.status]++

        if (!proposalsByType[proposal.type]) {
          proposalsByType[proposal.type] = 0
        }
        proposalsByType[proposal.type]++

    })

    /* 
        <canvas id="approvedProposals"></canvas>
        <canvas id="rejectedProposals"></canvas>
        <canvas id="proposalsbyStatus'),"></canvas>
        <canvas id="proposalType'),"></canvas>
    */
    new Chart(
    document.getElementById('proposalsByArea'),
        {
            type: 'polarArea',
            data: {
            labels: Object.keys(proposalsByArea).map(row => row),
            datasets: [
                {
                    label: 'Propuestas por Área',
                    data: Object.values(proposalsByArea).map(row => row )
                }
            ]
            }
        })

    new Chart(
        document.getElementById('totalProposals'),
        {
            type: 'line',
            data: {
            labels: Object.keys(proposalsByDate).map(row => row),
            datasets: [
                {
                    label: 'Propuestas por fecha',
                    data: Object.values(proposalsByDate).map(row => row )
                }
            ]
            }
        })

    new Chart(
        document.getElementById('proposalsByCategory'),
        {
            type: 'doughnut',
            data: {
                labels: Object.keys(proposalsByCategory).map(row => row),
                datasets: [
                    {
                        label: 'Propuestas por categoria',
                        data: Object.values(proposalsByCategory).map(row => row )
                    }
                ]
            },
        })
    new Chart(
        document.getElementById('proposalsByStatus'),
        {
            type: 'bar',
            data: {
                labels: Object.keys(proposalsByStatus).map(row => row),
                datasets: [
                    {
                        label: 'Propuestas por estatus',
                        data: Object.values(proposalsByStatus).map(row => row ),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.3)',
                            'rgba(255, 159, 64, 0.3)',
                            'rgba(255, 205, 86, 0.3)',
                            'rgba(75, 192, 192, 0.3)',
                            'rgba(54, 162, 235, 0.3)',
                            'rgba(153, 102, 255, 0.3)',
                            'rgba(201, 203, 207, 0.3)'
                          ],
                          borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                          ],
                        borderWidth: 1
                    }
                ]
            },
        })
    new Chart(
        document.getElementById('proposalsByUser'),
        {
            type: 'bar',
            options: {
                indexAxis: 'y',
            },
            data: {
                labels: Object.keys(proposalsByUser).map(row => row),
                datasets: [
                    {
                        label: 'Propuestas por usuario',
                        data: Object.values(proposalsByUser).map(row => row ),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.3)',
                            'rgba(255, 159, 64, 0.3)',
                            'rgba(255, 205, 86, 0.3)',
                            'rgba(75, 192, 192, 0.3)',
                            'rgba(54, 162, 235, 0.3)',
                            'rgba(153, 102, 255, 0.3)',
                            'rgba(201, 203, 207, 0.3)'
                          ],
                          borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                          ],
                        borderWidth: 1
                    }
                ]
            },
        })
    new Chart(
        document.getElementById('proposalsType'),
        {
            type: 'bar',
            options: {
                indexAxis: 'y',
            },
            data: {
                labels: Object.keys(proposalsByType).map(row => row),
                datasets: [
                    {
                        label: 'Propuestas por tipo',
                        data: Object.values(proposalsByType).map(row => row ),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.3)',
                            'rgba(255, 159, 64, 0.3)',
                            'rgba(255, 205, 86, 0.3)',
                            'rgba(75, 192, 192, 0.3)',
                            'rgba(54, 162, 235, 0.3)',
                            'rgba(153, 102, 255, 0.3)',
                            'rgba(201, 203, 207, 0.3)'
                          ],
                          borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                          ],
                        borderWidth: 1
                    }
                ]
            },
        })
}

document.addEventListener('DOMContentLoaded', function () {
    startApp()
})


function startApp(){
    const proposals = loadProposals()

    document.getElementById('filtro-pendientes').addEventListener('change', orderProposals)
    document.getElementById('filtro-historial').addEventListener('change', orderProposals)
}

async function loadProposals(  ){

    const url = 'http://127.0.0.1:8080/proposals'
    const proposalFetch = await fetch(url)

    const proposals = await proposalFetch.json()

    renderProposals(proposals)
    createCharts(proposals)


}

function renderProposals(proposals) {
    const proposalsDiv = document.getElementById('propuestas-pendientes')
    const allProposalsDiv = document.getElementById('historial-propuestas')

    const pendingProposals = proposals.filter(proposal => proposal.status !== 'Aprobada' || proposal.status !== 'Rechazada')
    const allProposals = proposals.filter(proposal => proposal.status === 'Aprobada' || proposal.status === 'Rechazada')

    // Clean previous html 
    proposalsDiv.innerHTML = ''
    allProposalsDiv.innerHTML = ''

    allProposals.forEach(proposal => {
        const div = document.createElement('div')
        div.innerHTML += `
        <div class="container py-2 rounded text-center shadow-sm mb-4"> 
            <div class="row">
                <p class="col">Titulo: ${proposal.title}</p>
                <p class="col">Fecha de creación: ${proposal.creationDate}</p>
                <p class="col">Área: ${proposal.area}</p>
            </div>
            
            <div class="row">
                <p class="col">Estatus: ${proposal.status}</p>
                <p class="col">Evaluador: ${proposal.evaluator === null || proposal.evaluator === undefined ? 'Sin evaluador' : proposal.evaluator  }</p>
                <p class="col">Categoria: ${proposal.category}</p>

            </div>
            <div class="d-flex justify-content-end">
                <button class="btn btn-primary btn-sm">Más detalles</button>    

            </div>
        </div>
        ` 

        allProposalsDiv.appendChild(div)
    })
    pendingProposals.forEach(proposal => {
        const div = document.createElement('div')
        div.className = 'container py-2 rounded text-center shadow-sm mb-4'
        div.innerHTML += `
            <div class="row">
                <p class="col">Titulo: ${proposal.title}</p>
                <p class="col">Fecha de creación: ${proposal.creationDate}</p>
                <p class="col">Área: ${proposal.area}</p>
            </div>
            
            <div class="row">
                <p class="col">Estatus: ${proposal.status}</p>
                <p class="col">Evaluador: ${proposal.evaluator === null || proposal.evaluator === undefined ? 'Sin evaluador' : proposal.evaluator}</p>
                <p class="col">Categoria: ${proposal.category}</p>
            </div>
        ` 
        const buttonDiv = document.createElement('div')
        buttonDiv.className = 'd-flex justify-content-end'

        const button = document.createElement('button')
        button.className = 'btn btn-primary btn-sm'
        button.textContent = 'Mas detalles'
        button.addEventListener('click', function(){
            showProposal(proposal.id)
        })

        buttonDiv.appendChild(button)

        div.appendChild(buttonDiv)

        proposalsDiv.appendChild(div)
    })
}

async function showProposal(proposalId){
    const url = `http://127.0.0.1:8080/proposals?id=${proposalId}`
    const proposalFetch = await fetch(url)
    const proposal = await proposalFetch.json()
    console.log(proposal)
    
    disableScroll()

    const modalContainer = document.querySelector('#proposalModalContainer')
    modalContainer.classList.remove('d-none')
    
    const closeModalButton = document.querySelector('#closeModalButton')
    closeModalButton.addEventListener('click', function(){
        modalContainer.classList.add('d-none')
        enableScroll()
    })

    let usersHtml = ""

    proposal.users.forEach(user => {
        usersHtml += `
            <li class="list-group-item fs-5">${user}</li>
        `
    })

    const modal = document.querySelector('#proposalModal')
    modal.innerHTML = `
        <div class="container text-center">
            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Titulo</p>
                    <p class="fs-5">${proposal.title}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Fecha de creación </p>
                    <p class="fs-5">${proposal.creationDate}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Fecha de terminación </p>
                    <p class="fs-5">${proposal.closeDate === null || proposal.closeDate === undefined ? 'Pendiente' : proposal.closeDate}</p>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Estatus </p>
                    <p class="fs-5">${proposal.status}</p>
                </div>
                <div class="col">
                    <p class="my-0"><span class="fs-4 fw-bold my-0">Evaluador actual</span> </p>
                    <p class="fs-5">${proposal.closeDate === null || proposal.closeDate === undefined ? 'Sin evaluador' : proposal.closeDate}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Evaluador anterior </p>
                    <p class="fs-5">${proposal.closeDate === null || proposal.closeDate === undefined ? 'Sin evaluador anterior' : proposal.closeDate}</p>
                </div>
            </div>
                
            <div class="row">
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Categoría </p>
                    <p class="fs-5">${proposal.category}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Area </p>
                    <p class="fs-5">${proposal.area === null || proposal.area === undefined ? 'Sin area' : proposal.area}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Puntos asignados </p>
                    <p class="fs-5">${proposal.assignedPoints === null || proposal.assignedPoints === undefined ? 'Sin puntos asignados' : proposal.assignedPoints}</p>
                </div>
            </div>

            <div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Tipo de propuesta </p>
                    <p class="fs-5">${proposal.type}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Usuario/s creador/es de la propuesta </p>
                    <div class="col">
                        <ul class="list-group list-group-flush ">
                            ${usersHtml}
                        </ul>
                    </div>
                </div>

            </div>
                
            <div class="row">
                 <div class="col">
                    <p class="my-0 fs-4 fw-bold">Descripción</p>
                    <p class="fs-5">${proposal.description}</p>
                </div>
                <div class="col">
                    <p class="my-0 fs-4 fw-bold">Mensajes </p>
                    <p class="fs-5">${proposal.feedback}</p>

                </div>
            </div>
            <div class="row"></div>
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
    const url = 'http://127.0.0.1:8080/proposals'
    const proposalFetch = await fetch(url)

    const proposals = await proposalFetch.json()
    console.log(e.target.value)
    console.log(proposals)

    if (e.target.value === 'all') {
        renderProposals(proposals)
    }
    else if (e.target.value === 'status') {

        proposals.sort(function (a, b) {
            return a.status.localeCompare(b.status) // Grande el codeium
        })
        renderProposals(proposals)
    }
    else if (e.target.value === 'category') {
        proposals.sort(function (a, b) {
            return a.category.localeCompare(b.category) 
        })
        renderProposals(proposals)
    }
    else if (e.target.value === 'area') {
        proposals.sort(function (a, b) {
            return a.area.localeCompare(b.area) 
        })
        renderProposals(proposals)
    }
}