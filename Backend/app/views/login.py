from flask import Blueprint, request
from app.utils import *

bp = Blueprint('login',__name__, url_prefix='/login')

@bp.route('', methods=["POST"])
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
