 # Sistema PLIM SEG Automotive 

## Servicios web

El siguiente software cuenta con los archivos html pertenecientes al frontEnd asi como el BackEnd

### Endpoints disponibles
* /users  > 
    _uso: < server  >/users_ 
     * Métodos disponibles
        * GET:
            * Obtiene todos los usuarios
        * GET: _< server  >/users/< id >_ 
            * Obtiene 1 usuario por id
        * PUT:
            * Actualiza 1 usuario 

        * DELETE: Borrar usuario  

        * POST: Crear usuario   
        
            ```js
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
            ```


* /login
    _uso: < server  >/login 
    * Métodos disponibles
        * POST: Crear una sesión de usuario

            ```js
                {
                    username: string
                    password: string
                }
            ```

        * DELETE: Cierra una sesión de usuario
* /propuestas
    _uso: < server  >/propuestas 
    * Métodos disponibles
        * POST: Crear una propuesta

        ```js
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
        ```


        * PUT: Editar una propuesta
        ```js
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
        ```
        * GET _< server >/proopuesta/< id >_
            * Obtiene una propuesta por ID
        
* /orders
    _uso: < server  >/orders 
    * Métodos disponibles
        * POST: Crear un pedido
            ```js
            {
                orderId: number
                userId: number
                orderStatus: string
                orderDate: string
                total: number
                productId: number
                quantity: number
            }
            ```
        * PUT: Editar un pedido
            ```js
            {
                orderId: number
                userId: number
                orderStatus: string
                orderDate: string
                total: number
                productId: number
                quantity: number
            }
            ```
        * GET _< server >/orders/< id >_
            * Obtiene un pedido por ID

## Posibles respuestas de error

```401 Unauthorized ```  - Si el usuario no tiene los permisos o el rol para realizar dichos cambios

```400 Bad Request ```  - Si la petición no cumple con las especificaciones

```404 Not Found ```   -  Si no se encuentra ningun valor que coincida o no existe el recurso