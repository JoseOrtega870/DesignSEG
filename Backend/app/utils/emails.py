from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SENDER = "correo@SEG_Automotive.com"

FONT_BOLD = "style = ' font-weight: bold; '"
END_STYLE = "style = ' font-style: italic; '"

def set_message(subject : str, receiver : str)-> MIMEMultipart:
    message = MIMEMultipart("alternative")
    message["From"] = SENDER
    message["To"] = receiver
    message["Subject"] = subject
    return message


def proposal_status_change( email_content : dict, receiver : str ) -> MIMEMultipart: 


    message = set_message("Estado de Propuesta de Mejora Actualizado", receiver)
    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que el estado de su propuesta de mejora registrada en el sistema PLIM ha sido actualizado. A continuación, encontrará los detalles de su propuesta:</p>
                    
                    <p>
                        <span {FONT_BOLD}>ID de la Propuesta:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Título:</span> {email_content["title"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha de Registro:</span> {email_content["creationDate"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Estado Anterior:</span> {email_content["oldStatus"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Nuevo Estado:</span> {email_content["status"]}
                    </p>

                    { 
                        "<p>Comentarios del evaluador: \n" + email_content["feedback"] + "</p>" if email_content['feedback'] != "" else ""

                    }

                    <p>Puede acceder a los detalles completos de su propuesta y su estado actualizado en la plataforma PLIM.</p>

                    <p>Le agradecemos su participación y compromiso para mejorar nuestro sistema. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con el equipo de soporte.</p>

                    <h3>Gracias por su colaboración.</h3>
                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def VSE_new_order( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Nuevo Pedido Realizado en la Tienda", receiver)

    products_div_content = ""
    for product in email_content["products"]:
        products_div_content += f"<p> <span {FONT_BOLD}>{product['product']}:</span> {product['quantity']}</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que se ha generado un nuevo pedido en la tienda del sistema PLIM. A continuación, encontrará los detalles del pedido:</p>
                    <p>
                        <span {FONT_BOLD}>ID de la Orden:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Pedido realizado por:</span> {email_content["user_name"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha del pedido:</span> {email_content["orderDate"]}
                    </p>

                    <div>
                        { products_div_content }
                    </div>

                    <p>Le solicitamos que revise y gestione este pedido a la mayor brevedad posible. Puede acceder a los detalles completos del pedido y realizar las acciones correspondientes en la plataforma PLIM.</p>

                    <p>Gracias por su colaboración y dedicación para garantizar un proceso de gestión de pedidos eficiente y eficaz.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def VSE_new_proposal( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Nueva Propuesta de Mejora Registrada", receiver)
    
    user_list = ""
    for user in email_content["proposalUsers"]:
        user_list += "<p>" + user + "</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Nos complace informarle que se ha registrado una nueva propuesta de mejora en el sistema PLIM. A continuación, encontrará los detalles de la propuesta:</p>
                    <p>
                        <span {FONT_BOLD}>ID de la Propuesta:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Título:</span> {email_content["title"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Descripción de la propuesta:</span> {email_content["description"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Area:</span> {email_content["area"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Categoria:</span> {email_content["category"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha de registro:</span> {email_content["creationDate"]}
                    </p>
                    <div>
                        <p {FONT_BOLD}>Usuarios que registraron la propuesta:</p> 
                        { user_list }
                    </div>

                    <p>Le solicitamos que revise esta propuesta a la mayor brevedad posible y tome las acciones correspondientes, ya sea evaluarla o redirigirla según sea necesario</p>

                    <p>Puede acceder a la propuesta y realizar las acciones pertinentes en la plataforma PLIM</p>

                    <p>Gracias por su colaboración y dedicación para garantizar un proceso de gestión de propuestas eficiente y eficaz.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def user_signup_confirmation( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Confirmación de Registro en el Sistema PLIM", receiver)

    user_list = ""
    for user in email_content["proposalUsers"]:
        user_list += "<p>" + user + "</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <h2>¡Bienvenido/a al sistema PLIM!</h2>

                    <p>Le confirmamos que su registro ha sido completado con éxito. A continuación, encontrará los detalles de su cuenta:</p>

                    <p> <span {FONT_BOLD}>Nombre:</span>{email_content["name"]}</p>
                    <p> <span {FONT_BOLD}>Correo electrónico registrado: {email_content["email"]}</span>  </p>
                    <p> <span {FONT_BOLD}>Número de empleado: {email_content["username"]}</span>  </p>


                    <p>Ahora puede acceder a todas las funcionalidades del sistema PLIM y comenzar a participar activamente.</p>

                    <p>Gracias por unirse a nuestra comunidad y contribuir a las mejoras de nuestro sistema.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def password_reset_confirmation( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Confirmación de Cambio de Contraseña", receiver)

    user_list = ""
    for user in email_content["proposalUsers"]:
        user_list += "<p>" + user + "</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 

                    <h3 {FONT_BOLD}>Le informamos que su contraseña en el sistema PLIM ha sido cambiada con éxito. Si usted realizó este cambio, no es necesario que realice ninguna otra acción.</h3>

                    <p>Si no ha solicitado este cambio o cree que ha habido un error, por favor, póngase en contacto con nuestro equipo VSE inmediatamente para asegurar la protección de su cuenta.</p>

                    <p>Para su seguridad, le recomendamos no compartir su contraseña con nadie.</p>

                    <p>Gracias por su atención.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def user_data_change_confirmation( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Confirmación de Cambio en sus Datos Personales", receiver)

    user_list = ""
    for user in email_content["proposalUsers"]:
        user_list += "<p>" + user + "</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 

                    <p>Le informamos que sus datos personales en el sistema PLIM han sido actualizados con éxito. A continuación, encontrará los detalles de los cambios realizados:</p>

                    <p {FONT_BOLD}>Datos anteriores:</p>

                    <ul>
                        <li><span {FONT_BOLD}>Nombre:</span> {email_content["previousName"]}</li>
                        <li><span {FONT_BOLD}>Correo:</span> {email_content["previousEmail"]}</li>
                    </ul>

                    <p {FONT_BOLD}>Datos actualizados:</p>

                    <ul>
                        <li><span {FONT_BOLD}>Nombre:</span> {email_content["name"]}</li>
                        <li><span {FONT_BOLD}>Correo:</span> {email_content["email"]}</li>
                    </ul>

                    <p>Gracias por mantener sus datos actualizados.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def user_order_confirmation( email_content : dict, receiver : str ) -> MIMEMultipart: 

    message = set_message("Confirmación de Registro de su Pedido en la Tienda PLIM", receiver)

    products_div_content = ""
    for product in email_content["products"]:
        products_div_content += f"<p> <span {FONT_BOLD}>{product['product']}:</span> {product['quantity']}</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>¡Gracias por su pedido en la tienda PLIM! Nos complace confirmar que hemos recibido su solicitud. A continuación, encontrará los detalles de su pedido:</p>

                    <p>
                        <span {FONT_BOLD}>ID de la Orden:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha del pedido:</span> {email_content["orderDate"]}
                    </p>

                    <div>
                        { products_div_content }
                    </div>

                    <p>Total de Puntos Canjeados: {email_content['points']}</p>

                    <p>Su pedido está actualmente en proceso. Le notificaremos a medida que el estado de su pedido cambie.</p>

                    <p>Puede acceder a los detalles completos de su pedido a través de la plataforma PLIM en las computadoras de kiosko ubicado en las instalaciones.</p>

                    <p>Gracias por su colaboración y dedicación para garantizar un proceso de gestión de pedidos eficiente y eficaz.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def user_order_status_changed( email_content : dict, receiver : str ) -> MIMEMultipart: 

    """
        Returns a User order confirmation email.
        email_content: {
            "name": User name,
            "id": Order id
            "user_name": Name of the user who placed the order,
            "orderDate: Order creation date,
            "products": Array of order products [ { "product": Product name , "quantity": Quantity } ],
            "previousStatus": Previous order status,
            "newStatus": New order status
        }
    """

    message = set_message("Actualización del Estado de su Pedido en la Tienda PLIM", receiver)

    products_div_content = ""
    for product in email_content["products"]:
        products_div_content += f"<p> <span {FONT_BOLD}>{product['product']}:</span> {product['quantity']}</p> \n"

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que el estado de su pedido en la tienda PLIM ha sido actualizado. A continuación, encontrará los detalles de su pedido:</p>

                    <p>
                        <span {FONT_BOLD}>ID de la Orden:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha del pedido:</span> {email_content["orderDate"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Estatus anterior:</span> {email_content["previousStatus"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Estatus nuevo:</span> {email_content["newStatus"]}
                    </p>

                    <div>
                        { products_div_content }
                    </div>

                    { "<p>Comentarios:<p/>" if email_content["newStatus"] != "" else "" }
                    { 
                        "<p>Favor de ponerse en contacto con el departamento de mejora continua para organizar la entrega</p>"  if email_content["newStatus"] != "" else "<p>Favor de ponerse en contacto con el departamento de mejora continua para más detalles</p>" 
                    }

                    <p>Puede acceder a los detalles completos de su pedido a través de la plataforma PLIM en las computadoras de kiosko ubicado en las instalaciones.</p>

                    <p>Le agradecemos por su paciencia y comprensión. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nuestro equipo de soporte.</p>

                    <p>Gracias por su participación en el sistema PLIM.</p>


                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def champion_has_a_new_proposal( email_content : dict, receiver : str ) -> MIMEMultipart: 

    """
        Returns a champion has a new proposal email.
        email_content: {
            "name": Champion name,
            "id": Proposal id
            "title": Proposal title,
            "creationDate: Proposal creation date,
            "proposalUsers": List of users who created the proposal,

        }
    """

    message = set_message("Nueva Propuesta de Mejora Asignada para Evaluación", receiver)

    user_list = ""
    for user in email_content["proposalUsers"]:
        user_list += "<p>" + user + "</p> \n"
        
    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que se le ha asignado una nueva propuesta de mejora para su evaluación en el sistema PLIM. A continuación, encontrará los detalles de la propuesta asignada:</p>

                    <p>
                        <span {FONT_BOLD}>ID de la Propuesta:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Título:</span> {email_content["title"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha de registro:</span> {email_content["creationDate"]}
                    </p>

                    <div>
                        <p {FONT_BOLD}>Usuarios que registraron la propuesta:</p> 
                        { user_list }
                    </div>

                    <p>Le solicitamos que revise esta propuesta a la mayor brevedad posible y tome las acciones correspondientes según su criterio. Puede acceder a la propuesta y realizar la evaluación a través de la plataforma PLIM en las computadoras de kiosko ubicado en las instalaciones.</p>

                    <p>Le agradecemos por su paciencia y comprensión. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nuestro equipo de soporte.</p>

                    <p>Gracias por su participación en el sistema PLIM.</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def user_has_a_new_message( email_content : dict, receiver : str ) -> MIMEMultipart: 

    """
        Returns a User has a new message confirmation email.
        email_content: {
            "name": User name,
            "id": Message id
            "title": Message title,
            "creationDate: Message creation date,
            "message": Message
        }
    """

    message = set_message("Nuevo Mensaje de Evaluación sobre su Propuesta de Mejora", receiver)

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que se le ha asignado una nueva propuesta de mejora para su evaluación en el sistema PLIM. A continuación, encontrará los detalles de la propuesta asignada:</p>

                    <p>
                        <span {FONT_BOLD}>ID de la Propuesta:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Título:</span> {email_content["title"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha de registro:</span> {email_content["creationDate"]}
                    </p>

                    <div>
                        <h3 {FONT_BOLD}>Mensaje del evaluador:</h3> 
                        <p>{email_content["message"]}</p>
                    </div>

                    <p>Le recomendamos revisar este mensaje y proporcionar cualquier información adicional que pueda ser requerida para la evaluación de su propuesta. Puede acceder a los detalles completos de su propuesta y responder al mensaje del evaluador a traves de la plataforma PLIM en las computadoras de kiosko ubicado en las instalaciones.</p>

                    <p>Gracias por su participación y contribuciones al sistema PLIM. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con el equipo VSE</p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message

def VSE_or_CHAMPION_has_a_new_message( email_content : dict, receiver : str ) -> MIMEMultipart: 

    """
        Returns a VSE/Champion has a new message confirmation email.
        email_content: {
            "name": VSE/Champion name,
            "id": Message id
            "title": Message title,
            "creationDate: Message creation date,
            "message": Message
        }
    """

    message = set_message("Nuevo Mensaje de Usuario sobre Propuesta de Mejora registrada", receiver)

    content = f"""
        <html>
            <body>
                <h1 {FONT_BOLD}>Estimado/a {email_content["name"]}</h1>

                <div> 
                    <p>Le informamos que ha recibido un nuevo mensaje del asociado sobre su propuesta de mejora registrada en el sistema PLIM pendiente de evaluación. A continuación, encontrará los detalles de su propuesta:</p>

                    <p>
                        <span {FONT_BOLD}>ID de la Propuesta:</span> {email_content["id"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Título:</span> {email_content["title"]}
                    </p>
                    <p>
                        <span {FONT_BOLD}>Fecha de registro:</span> {email_content["creationDate"]}
                    </p>

                    <div>
                        <h3 {FONT_BOLD}>Mensaje del evaluador:</h3> 
                        <p>{email_content["message"]}</p>
                    </div>

                    <p>Le recomendamos revisar este mensaje y proporcionar cualquier información adicional que pueda ser requerida para la evaluación de su propuesta. Puede acceder a los detalles completos de su propuesta y responder al mensaje a traves de la plataforma PLIM en las computadoras de kiosko ubicado en las instalaciones.</p>

                    <p>Gracias por su participación y contribuciones al sistema PLIM </p>

                </div>

                <h2 {FONT_BOLD}>Saludos cordiales.</h2>

                <p {END_STYLE}>Este correo es generado automáticamente. Por favor, no responda a este mensaje.</p>
            </body>
        </html>
    """
    html = MIMEText(content, "html")
    message.attach(html)
    return message