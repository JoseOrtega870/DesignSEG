# Sistema PLIM SEG Automotive 

Se desarrolla una página web donde los empleados de SEG Automotive puedan hacer propuestas de mejora dentro de las diferentes áreas de la organización. El área de mejora continua y los ingenieros VSC son los encargados de evaluar las propuestas de mejora y posteriormente revisar los resultados del sistema con:
* Gráficos y estadísticas de las propuestas, puntos, canjes de puntos, y estatus de propuestas
* Datos en tiempo real desde la base de datos
* Plataforma con inicio de sesión y permisos personalizados
Para impulsar la participación de los usuarios, se agrega una tienda de recompensas donde los usuarios podrán intercambiar los puntos que son asignados en sus propuestas registradas por productos y recompensas que registre el área de mejora continua.

# Funcionalidades que integra el proyecto

Se encuentran los requerimientos y funcionalidades que abarca el proyecto se encuentran en el siguiente link: 
https://docs.google.com/document/d/1HUJdTpBp63LkMxctWFp1x6mZQeYSsSuMbTd1YPV7Wyo/edit?usp=sharing 

# Instrucciones de ejecución
1.- Descargar como zip el proyecto
2.- Ubicarse en la carpeta Backend dentro de DesignSEG
        cd DesignSEG/Backend
3.- Ejecutar el archivo startApp.py 
       python startApp.py

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
