from flask import Flask
from flask import request
import sqlite3

connection = sqlite3.connect('database.db')

cursor = connection.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                username VARCHAR(30) NOT NULL, 
                password VARCHAR(30) NOT NULL,
                role VARCHAR(10) NOT NULL,
                firstname VARCHAR(30) NOT NULL,
                middlename VARCHAR(30) NOT NULL,
                lastname VARCHAR(30) NOT NULL,
                points INT(9) NOT NULL DEFAULT 0
               )""")

# TEST DATA
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin', 'admin', 'admin', 'admin', 'admin', 'admin')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin1', 'admin1', 'admin1', 'admin1', 'admin1', 'admin1')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin2', 'admin2', 'admin2', 'admin2', 'admin2', 'admin2')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin3', 'admin3', 'admin3', 'admin3', 'admin3', 'admin3')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin4', 'admin4', 'admin4', 'admin4', 'admin4', 'admin4')""")
# cursor.execute("""INSERT INTO users(username, password, role, firstname, middlename, lastname) VALUES ('admin5', 'admin5', 'admin5', 'admin5', 'admin5', 'admin5')""")

# connection.commit()

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

