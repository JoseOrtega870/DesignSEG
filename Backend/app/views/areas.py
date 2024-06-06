from flask import Blueprint, request
from app.utils import *

bp = Blueprint('areas',__name__, url_prefix='/areas')


@bp.route('', methods=["POST","DELETE","GET","PUT"])
def areas():
    if request.method == "POST":
        # Signup a new area
        jsonData = request.get_json()
        if validateData(["name","manager"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        result = insertArea(jsonData)
        if result == 0:
            return "",200
        elif result == 1:
            response = responseJson(400,"Area already exists")
            return response
        else:
            response = responseJson(404,"Manager doesn't exist")
            return response

    elif request.method == "DELETE":
        # Delete an existing area
        jsonData = request.get_json()
        if validateData(["currentUser","area"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        # Checks if the current area is an admin
        if not checkAdmin(jsonData["currentUser"]):
            response = responseJson(401,"Unauthorized access")
            return response

        # Checks if the area exists and deletes it
        if deleteArea(jsonData["area"]):
            return "",200
        else:
            response = responseJson(404,"Area doesn't exist")
            return response
        
    elif request.method == "GET":
        # Get data for a given area
        id = request.args.get("id")
        if id:
            # Looking for a single area
            area = getAreas(["id",id])
            if area:
                # Success
                response = jsonify(area)
                response.status_code = 200
                return response
            else:
                # Area not found
                response = responseJson(404,"Area doesn't exist")
                return response
        elif not any(request.args.values()):
            # Looking for all areas
            areas = getAreas(["1",1])
            response = jsonify(areas)
            response.status_code = 200
            return response
        else:
            # Incorrect parameters
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
    elif request.method == "PUT":
        # Edit existing area
        jsonData = request.get_json()

        if validateData(["name","manager","id","currentUser"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response

        # Checks if the current area is an admin
        if not checkAdmin(jsonData["currentUser"]):
            response = responseJson(401,"Unauthorized access")
            return response

        result = editArea(jsonData)
        if result == 0:
            return "",200
        elif result == 1:
            response = responseJson(404,"Area doesn't exist")
            return response
        else:
            response = responseJson(404,"Manager doesn't exist")
            return response
        
# Function to check whether the area exists yet, if it doesn't then it registers the new area
@query(database)
def insertArea(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks whether the area exists
    cursor.execute("SELECT * FROM area WHERE name = ?", (data["name"],))
    area = cursor.fetchone()
    if area:
        return 1
    
    # Checks whether the user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (data["manager"],))
    user = cursor.fetchone()
    if not user:
        return 2

    # Insert area
    cursor.execute("INSERT INTO area (name, manager) VALUES (?, ?)", (data["name"], data["manager"]))
    
    # Commit the transaction
    connection.commit()
    
    return 0

# Function to delete area if it exists
@query(database)
def deleteArea(cursor:sqlite3.Cursor,connection:sqlite3.Connection,id:int):
    # Checks whether the area exists
    cursor.execute("SELECT * FROM area WHERE id = ?", (id,))
    area = cursor.fetchone()
    if not area:
        return False

    # Borrar al usuario indicado
    cursor.execute("DELETE FROM area WHERE id = ?", (id,))
    connection.commit()
    return True

# Function that returns area based on id
@query(database)
def getAreas(cursor:sqlite3.Cursor,connection:sqlite3.Connection,condition):
    # Retrieve area(will be None in case it's not found)
    data = cursor.execute("SELECT id,name,manager FROM area WHERE " + condition[0] + " = ?", (condition[1],))
    areas = []
    columns = data.description
    for i in data.fetchall():
        # Add keys to the values returned 
        area = {}
        for id,column in enumerate(columns):
            area[column[0]] = i[id]

        areas.append(area)
    if condition[0] == "id" and areas:
        return areas[0]
    return areas

# Function to check whether the area exists and edits it
@query(database)
def editArea(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks whether the area exists
    cursor.execute("SELECT * FROM area WHERE id = ?", (data["id"],))
    area = cursor.fetchone()
    if not area:
        return 1
    
    # Checks whether the user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (data["manager"],))
    user = cursor.fetchone()
    if not user:
        return 2

    # Insert area
    cursor.execute("UPDATE area SET name = ?, manager = ? WHERE id = ?",
                    (data["name"], data["manager"], data["id"]))
    
    # Commit the transaction
    connection.commit()
    return False
