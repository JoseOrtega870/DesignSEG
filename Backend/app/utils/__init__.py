import sqlite3
import bcrypt
from flask import Response,jsonify

import smtplib, ssl
from .emails import *

PORT = 587

CONTEXT = ssl.create_default_context()

SENDER = "correo"

PASSWORD = "password"

HOST = "smtp-mail.outlook.com"

database = 'database.db'

def send_email( receiver : str, email_content: dict, email_type : str ): 
    message = None

    # Set email content
    match email_type: 
        case "proposal_status_change":
            message = proposal_status_change(email_content, receiver)
        case "VSE_new_order":
            message = VSE_new_order(email_content, receiver)
        case "VSE_new_proposal":
            message = VSE_new_proposal(email_content, receiver)
        case "VSE_new_proposal":
            message = VSE_new_proposal(email_content, receiver)
        case "user_signup_confirmation":
            message = user_signup_confirmation(email_content, receiver)
        case "user_data_change_confirmation":
            message = user_data_change_confirmation(email_content, receiver)
        case "user_order_confirmation":
            message = user_order_confirmation(email_content, receiver)

    with smtplib.SMTP(host=HOST, port=PORT) as email_server:
        # Login to email_server server
        email_server.starttls(context=CONTEXT)
        email_server.login(SENDER, PASSWORD)

        # Send email
        email_server.sendmail(SENDER, receiver, message.as_string())


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
                points INTEGER NOT NULL DEFAULT 0,
                area INTEGER NOT NULL,
                FOREIGN KEY (area) REFERENCES Area(id)
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
    cursor.execute("""CREATE TABLE IF NOT EXISTS Area(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL,
                manager VARCHAR(50) ,
                FOREIGN KEY (manager) REFERENCES users(username)
               )""")      
    connection.commit()  
