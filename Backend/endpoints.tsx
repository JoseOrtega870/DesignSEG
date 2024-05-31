
// USER ENDPOINTS

interface UserCreation 
{
    username: string 
    password: string
    role: string
    firstname: string
    middlename: string
    lastname: string
    points: number  // DEFAULT 0
    email: string
}
interface UserPut
{
    currentUserId: number
    userId: number
    username: string 
    password: string
    role: string
    firstname: string
    middlename: string
    lastname: string
    points: number  // DEFAULT 0
    email: string
}

interface UserDelete
{
    currentUserId: number
    userId: number
}

interface UserLogin 
{
    username: string
    password: string
}


interface GetUser
{
    id: number
    role: string
    name: string
    username: string
    points : number
}

// Proposal endpoints

interface PostProposal 
{
    title: string
    description: string
    currentSituation: string
    area: string
    status: string
    type: string
    feedback: string
    creationDate: string
    usersId: Array<number>
    category: string
}
interface PutProposal 
{
    currentUserId: number
    proposalId: number
    title: string
    category: string
    description: string
    currentSituation: string
    area: string
    status: string
    type: string
    feedback: string
    usersId: Array<number>
}

interface eliminarPropuesta
{
    currentUserId: number
    proposalId: number
}
// 
interface PutProposal 
{
    proposalId: number
    title: string
    description: string
    currentSituation: string
    area: string
    status: string
    type: string
    feedback: string
    usersId: Array<number>
}

type decimal = number


interface PostPedido
{
    idProducto: number
    idUsuario: number
    cantidad: number
    totalPuntos: decimal
}
interface PutPedido
{
    idProducto: number
    idUsuario: number
    cantidad: number
    totalPuntos: decimal
}
interface PostProduct 
{
    name: string
    description: string
    price: decimal
    image: string
}
interface PutProduct 
{
    id: number
    name: string
    description: string
    price: decimal
    image: string
}