from flask import Flask
from flask import request
import sqlite3

connection = sqlite3.connect('database.db')


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
    

# TEST DATA
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin', 'admin', 'admin', 'admin', 'admin', 'admin')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin1', 'admin1', 'admin1', 'admin1', 'admin1', 'admin1')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin2', 'admin2', 'admin2', 'admin2', 'admin2', 'admin2')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin3', 'admin3', 'admin3', 'admin3', 'admin3', 'admin3')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin4', 'admin4', 'admin4', 'admin4', 'admin4', 'admin4')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin5', 'admin5', 'admin5', 'admin5', 'admin5', 'admin5')""")

# connection.commit()

createTables(connection)

connection.close()


app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, World!'

# 10.25.240.250

@app.route('/login', methods=["POST"])
def login():
    # TO DO : VALIDATE DATA AND LOGIN

    print (request.get_json())
    return "200 OK"

""" 
    *** TEST END POINT ***
@app.route('/users', methods=["GET"])
def get_users():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users;")
    users = cursor.fetchall()
    print(users)
    connection.close()
    return {'users': users}

"""

