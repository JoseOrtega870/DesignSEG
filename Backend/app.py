from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import sqlite3
import bcrypt


app = Flask(__name__)
CORS(app, origins="*")

database = 'database.db'

# Function to decorate functions that requiere a connection to the database
def query(database:str): 
    def wrapper(customQuery):
        def wrapFunction(*args,**kwargs):
            # Creates connection to the database and closes it when done
            connection = sqlite3.connect(database)
            cursor = connection.cursor()
            result = customQuery(cursor,connection,*args,**kwargs)
            cursor.close()
            connection.close()
            return result
        return wrapFunction
    return wrapper

# Function to hash a password with bcrypt
def hashPassword(passwordString:str)->str:
    # Converting password to array of bytes 
    bytes = passwordString.encode('utf-8') 
    
    # Generating the salt 
    salt = bcrypt.gensalt() 
    
    # Hashing the password 
    passwordHash = bcrypt.hashpw(bytes, salt) 
    return passwordHash

# Function to validate that the json received includes all the parameters needed
def validateData(parameters:list[str],dictionary:dict)->bool:
    for i in parameters:
        if i not in dictionary:
            return False
    return True

# Function to create the response of the api(mostly used in case of an error)
def responseJson(code:int, motive:str)->Response:
    data = {
        "Status code" : code,
        "Motive" : motive}
    response = jsonify(data)
    response.status_code = code
    return response

@query(database)
def checkAdmin(cursor:sqlite3.Cursor,connection:sqlite3.Connection,username:str)->bool:
    # Retrieve user(will be None in case it's not found)
    data = cursor.execute("SELECT * FROM users WHERE username = ? AND role = 'admin' ", (username,))
    row = data.fetchone()
    if not row:
        return False
    return True

# Creates tables needed for the database
@query(database)
def createTables(cursor:sqlite3.Cursor,connection:sqlite3.Connection):
    cursor.execute("""CREATE TABLE IF NOT EXISTS Users( 
                username VARCHAR(50) PRIMARY KEY, 
                password VARCHAR(50) NOT NULL,
                role VARCHAR(10),
                firstName VARCHAR(50) NOT NULL,
                middleName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                email VARCHAR(50) NOT NULL,
                points INTEGER NOT NULL DEFAULT 0
               )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS Products(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL,
                description VARCHAR(50) NOT NULL,
                price DECIMAL NOT NULL,
                image VARCHAR(100) NOT NULL
                )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS Orders(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user VARCHAR(50) NOT NULL, 
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                orderStatus VARCHAR(50) NOT NULL,
                orderDate DATE NOT NULL DEFAULT CURRENT_DATE,
                total DECIMAL NOT NULL,
                FOREIGN KEY (productId) REFERENCES product(id),
                FOREIGN KEY (user) REFERENCES users(username)
               )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS Proposals(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(50) NOT NULL,
                description VARCHAR(300) NOT NULL,
                currentSituation VARCHAR(50) NOT NULL,
                area VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                type VARCHAR(50) NOT NULL,
                feedback VARCHAR(50),
                creationDate DATE NOT NULL DEFAULT CURRENT_DATE,
                closeDate DATE DEFAULT NULL,
                category VARCHAR(50) NOT NULL,
                assignedPoints INTEGER DEFAULT NULL,
                formerEvaluatorUser VARCHAR(50),
                currentEvaluatorUser VARCHAR(50),
                FOREIGN KEY (formerEvaluatorUser) REFERENCES users(username),
                FOREIGN KEY (currentEvaluatorUser) REFERENCES users(username)
               )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS UserProposal(
                user VARCHAR(50) NOT NULL,
                proposalId INTEGER NOT NULL,
                FOREIGN KEY (user) REFERENCES users(username),
                FOREIGN KEY (proposalId) REFERENCES proposals(id)
               )""")   
    connection.commit()  

@app.route('/')
def index():
    createTables()
    return 'Hello, World!'

@app.route('/login', methods=["POST"])
def login():
    if request.method == "POST":
        #Login

        # Validate data
        jsonData = request.get_json()
        if validateData(["username","password"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        # Get the parameters needed for the login
        username = request.get_json()["username"]
        password = request.get_json()["password"]
        if startSession(username,password):
            data = {
                "Status Code": 200,
                "success":True}
            response = jsonify(data)
            response.status_code = 200
            return response
        else:
            data = {
                "Status Code": 200,
                "success":False}
            response = jsonify(data)
            response.status_code = 200
            return response

# Function to validate the login info
@query(database)
def startSession(cursor:sqlite3.Cursor,connection:sqlite3.Connection,username,password):
    # Query the database for the provided username and password
    cursor.execute("SELECT username,password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    
    # If user exists, return True (valid credentials), otherwise return False
    if user:
        correctPassword = bcrypt.checkpw(password.encode('utf-8'), user[1])
        if correctPassword:
            return True
        else:
            return False
    else:
        return False
    
@app.route('/users', methods=["POST","DELETE","GET","PUT"])
def users():
    if request.method == "POST":
        # Signup a new user
        jsonData = request.get_json()
        if validateData(["username","password","role","firstname","middlename","lastname","email"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        jsonData["password"] = hashPassword(jsonData["password"])
        if insertUser(jsonData):
            return "",200
        else:
            response = responseJson(400,"User already exists")
            return response

    elif request.method == "DELETE":
        # Delete an existing user
        jsonData = request.get_json()
        if validateData(["currentUser","deleteUser"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        # Checks if the current user is an admin
        if not checkAdmin(jsonData["currentUser"]):
            response = responseJson(401,"Unauthorized access")
            return response

        # Checks if the user exists and deletes it
        if deleteUser(jsonData["deleteUser"]):
            return "",200
        else:
            response = responseJson(400,"User doesn't exist")
            return response
        
    elif request.method == "GET":
        # Get data for a given user
        username = request.args.get("username")
        role = request.args.get("role")
        if username:
            # Looking for a single user
            user = getUsers(["username",username])
            if user:
                # Success
                response = jsonify(user)
                response.status_code = 200
                return response
            else:
                # User not found
                response = responseJson(404,"User doesn't exist")
                return response
        elif role:
            # Looking for a particular role
            users = getUsers(["role",role])
            response = jsonify(users)
            response.status_code = 200
            return response
        elif not any(request.args.values()):
            # Looking for all users
            users = getUsers(["1",1])
            response = jsonify(users)
            response.status_code = 200
            return response
        else:
            # Incorrect parameters
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
    elif request.method == "PUT":
        # Edit existing user
        jsonData = request.get_json()

        if validateData(["currentUser","username","password","role","firstname","middlename","lastname","email"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        # Checks if the current user is an admin
        if not checkAdmin(jsonData["currentUser"]):
            response = responseJson(401,"Unauthorized access")
            return response

        jsonData["password"] = hashPassword(jsonData["password"])
        if editUser(jsonData):
            return "",200
        else:
            response = responseJson(400,"User doesn't exist")
            return response
        
# Function to check whether the user exists yet, if it doesn't then it registers the new user
@query(database)
def insertUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks wheter the user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (data["username"],))
    user = cursor.fetchone()
    if user:
        return False
    
    #Check if points where passed, if not default to 0
    if "points" not in data:
        data["points"] = 0

    # Insert user
    cursor.execute("INSERT INTO users (username, password, role, firstName, middleName, lastName, email, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                   (data["username"], data["password"], data["role"], data["firstname"], data["middlename"], data["lastname"], data["email"], data["points"]))
    
    # Commit the transaction
    connection.commit()
    
    return True

# Function to delete user if it exists
@query(database)
def deleteUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,username:str):
    # Checks wheter the user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if not user:
        return False

    # Borrar al usuario indicado
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    connection.commit()
    return True

# Function that returns user based on id
@query(database)
def getUsers(cursor:sqlite3.Cursor,connection:sqlite3.Connection,condition):
    # Retrieve user(will be None in case it's not found)
    data = cursor.execute("SELECT role,firstName,middleName,lastName,username,email,points FROM users WHERE " + condition[0] + " = ?", (condition[1],))
    users = []
    columns = data.description
    for i in data.fetchall():
        # Add keys to the values returned 
        user = {}
        for id,column in enumerate(columns):
            user[column[0]] = i[id]

        # Retrieve all proposals that have to do with the user
        result = cursor.execute("SELECT proposalId FROM UserProposal WHERE user = ?",(user["username"],))
        user["proposals"] = []
        for proposal in result.fetchall():
            user["proposals"].append(proposal)

        users.append(user)
    if condition[0] == "username" and users:
        return users[0]
    return users

# Function to check whether the user exists and edits it
@query(database)
def editUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks wheter the user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (data["username"],))
    user = cursor.fetchone()
    if not user:
        return False

    #Check if points where passed, if not default to 0
    if "points" not in data:
        data["points"] = 0

    # Insert user
    cursor.execute("UPDATE users SET password = ?, role = ?, firstname = ?, middlename = ?, lastname = ?, points = ?, email = ? WHERE username = ?",
                    (data["password"], data["role"], data["firstname"], data["middlename"], data["lastname"], data["points"], data["email"],data["username"]))
    
    # Commit the transaction
    connection.commit()
    return True

@app.route('/proposals', methods=["POST","PUT","GET"])
def proposals():
    if request.method == "POST":
        # Create a new proposal
        jsonData = request.get_json()
        if validateData(["title","description","currentSituation","area","status","type","feedback","usersId","category"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        if createProposal(jsonData):
            return "",200
        else:
            response = responseJson(400,"User not found")
            return response

    elif request.method == "PUT":
        # Edit an existing proposal
        jsonData = request.get_json()
        if validateData(["currentUserId","proposalId","title","description","currentSituation","area","status","type","feedback","usersId","creationDate","closeDate"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        result = editProposal(jsonData)
        
        if result == 0:
            response = responseJson(400,"User not found")
            return response
        elif result == 1:
            response = responseJson(401,"User not authorized to edit")
            return response
        elif result == 2:
            response = responseJson(404,"Proposal not found")
            return response
        else:
            return "",200
        

    elif request.method == "GET":   
        # Get data for a given user
        id = request.args.get("id")
        if not id:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        proposal = getProposal(id)
        if proposal != None:
            # Success
            response = jsonify(proposal)
            response.status_code = 200
            return response
        else:
            # Proposal not found
            response = responseJson(404,"Proposal not found")
            return response

# Function to create a proposal, returns true if succesful and false if unsuccesful
@query(database)
def createProposal(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Insert proposal
    cursor.execute("INSERT INTO proposals (title, description, currentSituation, area, status, type, feedback, category) VALUES (?,?, ?, ?, ?, ?, ?, ?)",
                    (data["title"], data["description"], data["currentSituation"], data["area"], data["status"], data["type"], data["feedback"], data["category"]))
    
    proposalId = cursor.lastrowid

    # Insert into UserProposal
    for id in data["usersId"]:
        data = cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
        row = data.fetchone()
        if not row:
            connection.rollback()
            return False
        cursor.execute("INSERT INTO UserProposal (userId, proposalId) VALUES (?, ?)",(id,proposalId))

    # Commit the transaction
    connection.commit()
    return True

# Function to edit an existing proposal, returns 0 if succesful. Other numbers are different errors
@query(database)
def editProposal(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks wheter the proposal exists
    cursor.execute("SELECT * FROM proposals WHERE id = ?", (data["proposalId"],))
    proposal = cursor.fetchone()
    if not proposal:
        return 2

    # Edit proposal
    cursor.execute("UPDATE proposals SET title = ?, category = ?,currentSituation = ?, area = ?, status = ?, description = ?, type = ?, creationDate = ?, closeDate = ? WHERE id = ?",
                    (data["title"], data["category"], data["currentSituation"], data["area"], data["status"], data["description"], data["type"], data["creationDate"], data["closeDate"], data["proposalId"]))
        
    cursor.execute("DELETE FROM UserProposal WHERE proposalId = ?",(data["proposalId"],))
    # Insert into UserProposal
    for id in data["usersId"]:
        result = cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
        row = result.fetchone()
        if not row:
            connection.rollback()
            return 0
        cursor.execute("INSERT INTO UserProposal (userId, proposalId) VALUES (?, ?)",(id,data["proposalId"]))
    
    # Checks whether the user is an admin
    cursor.execute("SELECT role FROM users WHERE id = ?",(data["currentUserId"],))
    row = result.fetchone()
    if row:
        connection.commit()
        return 3
    # Checks whether the user editing is one of the people who suggested it
    cursor.execute("SELECT userId FROM UserProposal WHERE proposalId = ?",(data["proposalId"],))
    for i in cursor:
        if i[0] == data["currentUserId"]:
            connection.commit()
            return 3   
         
    connection.rollback()
    return 1

# Function to retrieve a proposal, return None if it fails
@query(database)
def getProposal(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id):
    # Retrieve proposal(will be None in case it's not found)
    data = cursor.execute("SELECT * FROM proposals WHERE id = ?", (id,))
    row = data.fetchone()
    if not row:
        return None
    
    # Add keys to the values returned 
    proposal = {}
    for i,column in enumerate(data.description):
        proposal[column[0]] = row[i]

    # Append all the users involved
    cursor.execute("SELECT userId FROM UserProposal WHERE proposalId = ?",(id,))
    users = []
    for i in cursor:
        print(i)
        users.append(i[0])
    proposal["usersId"] = users
            
    return proposal

# Order endpoints
@app.route("/orders", methods=["GET", "POST", "PUT"]) 
def orders():
    if request.method == "GET":
        if len(request.args) > 0:
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
        if validateData(["userId","productId","quantity","orderStatus","orderDate","total"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        if createOrder(jsonData):
            return "",200
        else:
            response = responseJson(400,"Could not create order")
            return response

    elif request.method == "PUT":
        # Edit an existing order
        if updateOrder(request.get_json()):
            return "",200
        else:
            response = responseJson(404,"Order not found")
            return response
@query(database)
def createOrder(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:
    # Insert order
        cursor.execute("INSERT INTO orders (user_id, product_id, quantity, order_status, order_date, total) VALUES (?, ?, ?, ?, ?, ?)", (data["uderId"], data["productId"], data["quantity"], data["orderStatus"], data["orderDate"], data["total"]) )
        connection.commit()
        return True
    except Exception as e:
        print(e)
        connection.rollback()
        return False
    
@query(database)
def getOrders(cursor:sqlite3.Cursor,connection:sqlite3.Connection):
    # Retrieve order(will be None in case it's not found)
    try:

        data = cursor.execute("SELECT * FROM orders;")
        row = data.fetchall()
        if not row:
            return None
        
        # Add keys to the values returned 
        orders = {}
        for i,column in enumerate(data.description):
            orders[column[0]] = row[i]

                
        return orders
    except Exception as e:
        print(e)
        return None

@query(database)
def getOrderById(cursor:sqlite3.Cursor,connection:sqlite3.Connection, id:int):
    try:
        # Retrieve order(will be None in case it's not found)
        data = cursor.execute("SELECT * FROM orders WHERE id = ?;", (id,))
        row = data.fetchone()
        if not row:
            return None
        
        # Add keys to the values returned 
        orders = {}
        for i,column in enumerate(data.description):
            orders[column[0]] = row[i]

                
        return orders
    except Exception as e:
        print(e)
        return None

@query(database)
def updateOrder(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:

        # Checks wheter the order exists
        cursor.execute("SELECT * FROM orders WHERE id = ?", (data["orderId"],))
        order = cursor.fetchone()
        if not order:
            return False
        # Update order
        cursor.execute("UPDATE orders SET user_id = ?, product_id = ?, quantity = ?, order_status = ?, order_date = ?, total = ? WHERE id = ?",
                        (data["uderId"], data["productId"], data["quantity"], data["orderStatus"], data["orderDate"], data["total"], data["orderId"]))
        connection.commit()
        return True
    except Exception as e:
        print(e)
        connection.rollback()
        return False
# End of order endpoints

# Product endpoints
@app.route("/products", methods=["GET", "POST", "PUT", "DELETE"])
def products():
    if request.method == "GET":

        if len(request.args) > 0:

            if validateData(["id"],request.args) == False:
                response = responseJson(400,"Incorrect parameters sent")
                return response
            
            response = getProductById(request.args.get("id"))

            if response != None:
                response = jsonify(response)  
                return response  
            else:
                # Product not found
                response = responseJson(404,"Product not found")
                return response
        else:
            response = getProducts()
            if response != None:
                response = jsonify(response)
                response.status_code = 200
                return response
            else:
                # Product not found
                response = responseJson(404,"No Products found")
                return response
            
    elif request.method == "POST":
        # Create a new order
        jsonData = request.get_json()
        print(request.get_json())
        if validateData(["name", "description", "price", "image"], jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        if createProduct(jsonData):
            return "",200
        else:
            response = responseJson(400,"Could not create product ")
            return response
        

    elif request.method == "PUT":   
        # Edit an existing order
        if updateProduct(request.get_json()):
            return "",200
        else:
            response = responseJson(404,"Product not found")
            return response



    elif request.method == "DELETE":
        if deleteProduct(request.args.get("id")):
            return "",200
        else:
            response = responseJson(404,"Product not found")
            return response

@query(database)
def createProduct(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:

        print(data)
    # Insert product
        cursor.execute("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)", (data["name"], data["description"], data["price"], data["image"]) )
        connection.commit()
        return True
    except Exception as e:
        print(e)
        connection.rollback()
        return False

@query(database)
def getProducts(cursor:sqlite3.Cursor,connection:sqlite3.Connection):
    # Retrieve product(will be None in case it's not found)
    data = cursor.execute("SELECT * FROM products;")
    row = data.fetchall()
    if not row:
        return None
    products = []
    # Add keys to the values returned 
    for product in row:
        product = {
            "id": product[0],
            "name": product[1],
            "description": product[2],
            "price": product[3],
            "image": product[4]
        }
        products.append(product)
    return products

@query(database)
def getProductById(cursor:sqlite3.Cursor,connection:sqlite3.Connection, id:int):
    try:

        # Retrieve product(will be None in case it's not found)
        data = cursor.execute("SELECT * FROM products WHERE id = ?;", (id,))
        row = data.fetchone()
        if not row:
            return None

        # Add keys to the values returned 
        product = {}
        for i,column in enumerate(data.description):
            product[column[0]] = row[i]

        return product
    
    except Exception as e:
        print(e)
        return None

@query(database)
def updateProduct(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:
        # Checks wheter the product exists
        cursor.execute("SELECT * FROM products WHERE id = ?", (data["id"],))
        product = cursor.fetchone()
        if not product:
            return False
        # Update product
        cursor.execute("UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?",
                        (data["name"], data["description"], data["price"], data["image"], data["id"]))
        connection.commit()
        return True
    except Exception as e:
        print(e)
        connection.rollback()
        return False
    
@query(database)
def deleteProduct(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id):
    try:
        cursor.execute("SELECT * FROM products WHERE id = ?;", (id,))
        product = cursor.fetchone()
        if not product:
            return False
        # Delete product
        cursor.execute("DELETE FROM products WHERE id = ?", (id,))
        connection.commit()
        return True
    except Exception as e:
        print(e)
        connection.rollback()
        return False
# End of product endpoints