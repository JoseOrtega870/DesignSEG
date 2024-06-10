from flask import Blueprint, request
from app.utils import *
import time
bp = Blueprint('orders',__name__, url_prefix='/orders')


# Order endpoints
@bp.route("", methods=["GET", "POST", "PUT"]) 
def orders():
    if request.method == "GET":
        if len(request.args) > 0:
            if validateData(["username"],request.args):
                response = getOrdersByUser(request.args.get("username"))
                return jsonify(response)
            if validateData(["id"],request.args) == False:
                response = responseJson(400,"Incorrect parameters sent")
                return response
            # Get order by id
            response = getOrderById(request.args.get("id"))

            if response != None:
                response = jsonify(response)
                response.status_code = 200
                return response
            else:
                # Order not found
                response = responseJson(404,"Order not found")
                return response
        else:    
            response = getOrders()
            if response != None:
                response = jsonify(response)
                response.status_code = 200
                return response
            else:
                # Order not found
                response = responseJson(404,"No orders found")
                return response
    elif request.method == "POST":
        # Create a new order
        jsonData = request.get_json()
        if validateData(["username","productId","quantity","orderStatus","total","id"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        if validateData(["username", "products", "total"], jsonData):
            response = sendOrderEmail(jsonData)
            return response
        
        response = createOrder(jsonData)

        return responseJson(response["status"], response["result"])

    elif request.method == "PUT":
        # Edit an existing order
        if validateData(["currentUser", "orderId", "username", "orderStatus"],request.get_json()) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        response = updateOrder(request.get_json())
        return responseJson(response["status"], response["result"])
    
@query(database)
def createOrder(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:
    # Insert order
        cursor.execute("SELECT points FROM users WHERE username = ?", (data["username"],))
        user = cursor.fetchone()
        if not user:
            return { "status": 404, "result": "User not Found"}

        cursor.execute("SELECT * FROM products WHERE id = ?", (data["productId"],))
        product = cursor.fetchone()
        if not product:
            return { "status": 404, "result": "Product not Found"}
        
        elif user[0] < data["total"]:
            return { "status": 400, "result": "Not enough points"}

        # Insert order and update user points
        cursor.execute("INSERT INTO orders (id, user, productId, quantity, orderStatus, orderDate, total) VALUES (?, ?, ?, ?, ?, ?, ?)", (data["id"], data["username"], data["productId"], data["quantity"], data["orderStatus"], time.strftime("%Y-%m-%d"),data["total"]) )

        cursor.execute("UPDATE users SET points = points - ? WHERE username = ?", (data["total"], data["username"]))
        connection.commit()
        return { "status": 200, "result": "Order created"}
    except Exception as e:
        print(e)
        connection.rollback()
        return { "status": 500, "result": "Error"}
    
@query(database)
def sendOrderEmail(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:

        cursor.execute("SELECT firstname, middlename, lastname, email, name FROM users WHERE username = ?", (data["username"],))
        user = cursor.fetchone()

        user_name = user[0] + " " + user[1] + " " + user[2]

        vseUsers = cursor.execute("SELECT firstname, email FROM users WHERE role = 'VSE'")
        vseUsers = vseUsers.fetchall()

        for user in vseUsers:
            email_content = {
                "name": user[0],
                "user_name": user_name,
                "orderDate": time.strftime("%d-%b-%Y"),
                "products": data["products"],
                "points": data["total"]
            }
            send_email(user[1],email_content, "VSE_new_order")

        email_content = {
            "name": user[4],
            "orderDate": time.strftime("%d-%b-%Y"),
            "products": data["products"],
            "points": data["total"]
        }
        send_email(user[3], email_content, "user_order_confirmation")

        return { "status": 200, "result": "Email sent"}
    except Exception as e:
        print(e)
        return { "status": 500, "result": e}

@query(database)
def getOrdersByUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection, username:str):
    try:
        data = cursor.execute("SELECT * FROM Orders, Products WHERE Orders.productId = Products.id AND Orders.user = ?", (username,))
        row = data.fetchall()
        if not row:
            return None
        orders = []
        # Add keys to the values returned 
        for order in row:
            product = {
                "id": order[7],
                "name": order[8],
                "description": order[9],
                "price": order[10],
                "image": order[11]
            }
            order = {
                "id": order[0],
                "userId": order[1],
                "productId": order[2],
                "quantity": order[3],
                "orderStatus": order[4],
                "orderDate": order[5],
                "total": order[6],
                "product": product
            }
            orders.append(order)
        return orders
    except Exception as e:
        print(e)
        return None



@query(database)
def getOrders(cursor:sqlite3.Cursor,connection:sqlite3.Connection):
    # Retrieve order(will be None in case it's not found)
    try:
        data = cursor.execute("SELECT * FROM Orders, Products WHERE Orders.productId = Products.id;")
        row = data.fetchall()
        if not row:
            return None
        orders = []
        # Add keys to the values returned 
        for order in row:
            product = {
                "id": order[7],
                "name": order[8],
                "description": order[9],
                "price": order[10],
                "image": order[11]
            }
            order = {
                "id": order[0],
                "userId": order[1],
                "productId": order[2],
                "quantity": order[3],
                "orderStatus": order[4],
                "orderDate": order[5],
                "total": order[6],
                "product": product
            }
            orders.append(order)
        return orders
    except Exception as e:
        print(e)
        return None

@query(database)
def getOrderById(cursor:sqlite3.Cursor,connection:sqlite3.Connection, id:int):
    try:
        # Retrieve order(will be None in case it's not found)
        data = cursor.execute("SELECT * FROM orders, products WHERE orders.id = ? AND products.id = orders.productId;", (id,))
        row = data.fetchall()
        print(row)
        if not row:
            return None
        # Add keys to the values returned 
        orders = []
        # Add keys to the values returned 
        for order in row:
            product = {
                "id": order[7],
                "name": order[8],
                "description": order[9],
                "price": order[10],
                "image": order[11]
            }
            order = {
                "id": order[0],
                "userId": order[1],
                "productId": order[2],
                "quantity": order[3],
                "orderStatus": order[4],
                "orderDate": order[5],
                "total": order[6],
                "product": product
            }
            orders.append(order)
        return orders
    except Exception as e:
        print(e)
        return None

@query(database)
def updateOrder(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:

        # Checks whether the order exists
        cursor.execute("SELECT * FROM orders WHERE id = ?;", (data["orderId"],))
        order = cursor.fetchone()
        if not order:
            return {"status": 400, "result": "Order Not Found"}
        
        # Checks whether the user exists and is an admin and has order edit privileges
        cursor.execute("SELECT role FROM users WHERE username = ?", (data["currentUser"],))
        user = cursor.fetchone()

        if not user:
            return {"status": 404, "result": "User not Found"}
        if str(user[0]) != "admin" and str(user[0]) != "VSE":
            return {"status": 403, "result": "User has no order edit privileges"}

        # Update order
        cursor.execute("UPDATE orders SET orderStatus = ? WHERE id = ?",
                        (data["orderStatus"], data["orderId"]))
        connection.commit()


        cursor.execute("SELECT products.name, orders.quantity FROM products, orders WHERE orders.id = ? AND products.id = orders.productId", (data["orderId"],))
        products = cursor.fetchall()

        cursor.execute("SELECT email, firstName, middleName, lastName FROM users WHERE username = ?", (order[2],))
        order_user = cursor.fetchone()

        if data["orderStatus"] != order[0]:
            email_content = {
                "name": order_user[1] + " " + order_user[2] + " " + order_user[3],
                "id": data["orderId"],
                "orderDate": order[1],
                "products": products,
                "previousStatus": order[0],
                "newStatus": data["orderStatus"]
            }
            send_email(order_user[0],email_content, "user_order_status_changed")
        return {"status": 200, "result": "Order updated"}
    except Exception as e:
        connection.rollback()
        print(e)
        return {"status": 500, "result": "Internal Server Error"}
# End of order endpoints
