https://github.com/Ort22/DesignSEG


 # Sistema PLIM SEG Automotive 

## Servicios web

El siguiente software cuenta con los archivos html pertenecientes al frontEnd asi como el BackEnd

## Endpoints disponibles
### Endpoint para usuarios
Con este endpoint se maneja la tabla de usuarios registrados en el sistema para poder controlar el acceso al sistema y qué funcionalidades tiene el usuario en la plataforma

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

### Endpoint para login
Verificar acceso al sistema 

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
     
### Endpoint para mmanejo de propuestas
Con este endpoint se administran las propuestas, desde su creación hasta la revisión y aceptación o rechazo

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

### Endpoint para pedidos
Administrar pedidos para el canje de puntos 

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
