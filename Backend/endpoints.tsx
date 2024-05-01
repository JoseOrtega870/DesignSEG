
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
    usersId: Array<number>
}
