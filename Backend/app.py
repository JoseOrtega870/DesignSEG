from flask import Flask, request, jsonify
import sqlite3
import bcrypt

#Creates tables needed for the database
def createTables(connection:sqlite3.Connection):
    cursor = connection.cursor()
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
    cursor.close()

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

#connection = sqlite3.connect('database.db')
#createTables(connection)
#connection.close()

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'

# 10.25.240.250

@app.route('/login', methods=["POST","DELETE"])
def login():
    if request.method == "POST":
        #Login

        # Validate data
        jsonData = request.get_json()
        if validateData(["username","password"],jsonData) == False:
            data = {
                "Status Code": 400,
                "Motive":"Incorrect parameters sent"}
            response = jsonify(data)
            response.status_code = 400
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
    elif request.method == "DELETE":
        # TODO
        pass

# Function to validate the login info
def startSession(username,password):
    # Connect to the database
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    # Query the database for the provided username and password
    cursor.execute("SELECT username,password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    
    # Close the database connection
    cursor.close()
    connection.close()

    
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
            data = {
                "Status Code": 400,
                "Motive":"Incorrect parameters sent"}
            response = jsonify(data)
            response.status_code = 400
            return response

        jsonData["password"] = hashPassword(jsonData["password"])
        if insertUser(jsonData):
            return "",200
        else:
            data = {
                "Status Code": 400,
                "Motive":"User already exists"}
            response = jsonify(data)
            response.status_code = 400
            return response


    elif request.method == "DELETE":
        pass
    elif request.method == "GET":
        pass
    elif request.method == "PUT":
        pass
        
# Function to check whether the user exists yet, if it doesn't then it registers the new user
def insertUser(data:dict):
    # Connect to the database
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    # Checks wheter the user exists
    cursor.execute("SELECT username,password FROM users WHERE username = ?", (data["username"],))
    user = cursor.fetchone()
    if user:
        # Close the database connection
        cursor.close()
        connection.close()
        return False

    # Insertar al usuario
    cursor.execute("INSERT INTO users (username, password, role, firstname, middlename, lastname) VALUES (?, ?, ?, ?, ?, ?)", (data["username"], data["password"], data["role"], data["firstname"], data["middlename"], data["lastname"]))
    
    # Commit the transaction
    connection.commit()
    
    # Close the database connection
    cursor.close()
    connection.close()
    return True


