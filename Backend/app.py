from flask import Flask, request, jsonify, Response
import sqlite3
import bcrypt


app = Flask(__name__)
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
def checkAdmin(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id:int)->bool:
    # Retrieve user(will be None in case it's not found)
    data = cursor.execute("SELECT * FROM users WHERE id = ? AND role = 'admin' ", (id,))
    row = data.fetchone()
    if not row:
        return False
    return True

#Creates tables needed for the database
@query(database)
def createTables(cursor:sqlite3.Cursor,connection:sqlite3.Connection):
    cursor.execute("""CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                username VARCHAR(50) NOT NULL, 
                password VARCHAR(50) NOT NULL,
                role VARCHAR(10) NOT NULL,
                firstname VARCHAR(50) NOT NULL,
                middlename VARCHAR(50) NOT NULL,
                lastname VARCHAR(50) NOT NULL,
                points INT NOT NULL DEFAULT 0
               )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS productOrders(
                order_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                customer_id INT NOT NULL,
                order_date DATE NOT NULL DEFAULT CURRENT_DATE,
                FOREIGN KEY (order_id) REFERENCES users(id)
               )""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS proposals(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                current_situation VARCHAR(50) NOT NULL,
                area VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                proposal VARCHAR(300) NOT NULL,
                type VARCHAR(50) NOT NULL,
                feedback VARCHAR(50) NOT NULL
               )""")
    
    cursor.execute("""CREATE TABLE IF NOT EXISTS userProposals(
                user_id INT NOT NULL,
                proposal_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (proposal_id) REFERENCES proposals(id)
               )""")     

@app.route('/')
def index():
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
        if validateData(["username","password","role","firstname","middlename","lastname"],jsonData) == False:
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
        if validateData(["currentUserId","userId"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        # Checks if the current user is an admin
        if not checkAdmin(jsonData["currentUserId"]):
            response = responseJson(401,"Unauthorized access")
            return response

        # Checks if the user exists and deletes it
        if deleteUser(jsonData["userId"]):
            return "",200
        else:
            response = responseJson(400,"User doesn't exist")
            return response
        
    elif request.method == "GET":
        # Get data for a given user
        id = request.args.get("id")
        if not id:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        user = getUser(id)
        if user != None:
            # Success
            response = jsonify(user)
            response.status_code = 200
            return response
        else:
            # User not found
            response = responseJson(404,"User doesn't exist")
            return response
        
    elif request.method == "PUT":
        # Edit existing user
        jsonData = request.get_json()

        if validateData(["currentUserId","userId","username","password","role","firstname","middlename","lastname","points"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        # Checks if the current user is an admin
        if not checkAdmin(jsonData["currentUserId"]):
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
    cursor.execute("INSERT INTO users (username, password, role, firstname, middlename, lastname, points) VALUES (?, ?, ?, ?, ?, ?, ?)", (data["username"], data["password"], data["role"], data["firstname"], data["middlename"], data["lastname"], data["points"]))
    
    # Commit the transaction
    connection.commit()
    
    return True

# Function to delete user if it exists
@query(database)
def deleteUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id:str):
    # Checks wheter the user exists
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    if not user:
        return False

    # Borrar al usuario indicado
    cursor.execute("DELETE FROM users WHERE id = ?", (id,))
    connection.commit()
    return True

# Function that returns user based on id
@query(database)
def getUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id:str):
    # Retrieve user(will be None in case it's not found)
    data = cursor.execute("SELECT id,role,firstname,middlename,lastname,username,points FROM users WHERE id = ?", (id,))
    row = data.fetchone()
    if not row:
        return None
    
    # Add keys to the values returned 
    user = {}
    for id,column in enumerate(data.description):
        user[column[0]] = row[id]
        
    return user

# Function to check whether the user exists and edits it
@query(database)
def editUser(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks wheter the user exists
    cursor.execute("SELECT * FROM users WHERE id = ?", (data["userId"],))
    user = cursor.fetchone()
    if not user:
        return False

    # Insert user
    cursor.execute("UPDATE users SET username = ?, password = ?, role = ?, firstname = ?, middlename = ?, lastname = ?, points = ? WHERE id = ?",
                    (data["username"], data["password"], data["role"], data["firstname"], data["middlename"], data["lastname"], data["points"],data["userId"]))
    
    # Commit the transaction
    connection.commit()
    return True
