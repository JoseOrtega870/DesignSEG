from flask import Blueprint, request
from app.utils import *

bp = Blueprint('proposals',__name__, url_prefix='/proposals')


@bp.route('', methods=["POST","PUT","GET"])
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
        if validateData(["currentUser","proposalId","title","description","currentSituation","area","status","type","feedback","usersId","creationDate","closeDate"],jsonData) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        
        result = editProposal(jsonData)
        
        if result == 0:
            response = responseJson(404,"User not found")
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
        if id != None:
            # Looking for a single user
            proposal = getProposals(["id",id])
            if proposal:
                # Success
                response = jsonify(proposal)
                response.status_code = 200
                return response
            else:
                # User not found
                response = responseJson(404,"Proposal not found")
                return response
        elif not any(request.args.values()):
            # Looking for all users
            proposals = getProposals(["1",1])
            response = jsonify(proposals)
            response.status_code = 200
            return response
        else:
            # Incorrect parameters
            response = responseJson(400,"Incorrect parameters sent")
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
        data = cursor.execute("SELECT * FROM users WHERE username = ?", (id,))
        row = data.fetchone()
        if not row:
            connection.rollback()
            return False
        cursor.execute("INSERT INTO UserProposal (user, proposalId) VALUES (?, ?)",(id,proposalId))

    # Commit the transaction
    connection.commit()
    return True

# Function to edit an existing proposal, returns 0 if succesful. Other numbers are different errors
@query(database)
def editProposal(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    # Checks whether the proposal exists
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
        result = cursor.execute("SELECT * FROM users WHERE username = ?", (id,))
        row = result.fetchone()
        if not row:
            connection.rollback()
            return 0
        cursor.execute("INSERT INTO UserProposal (user, proposalId) VALUES (?, ?)",(id,data["proposalId"]))
    
    # Checks whether the user is an admin
    cursor.execute("SELECT role, email, firstname FROM users WHERE username = ?",(data["currentUser"],))
    row = result.fetchone()
    if row:
        # If the status is different, send an email
        if proposal[5] != data["status"]:
            email_content = {
                "name": row[2],
                "id": proposal[0],
                "title": proposal[1],
                "creationDate": proposal[8],
                "oldStatus": proposal[5],
                "status": data["status"]
            }
            send_email(row[1], email_content, "proposal_status_change")

        # 

        connection.commit()
        return 3
    # Checks whether the user editing is one of the people who suggested it
    cursor.execute("SELECT user FROM UserProposal WHERE proposalId = ?",(data["proposalId"],))
    for i in cursor:
        if i[0] == data["currentUser"]:
            connection.commit()
            return 3   
         
    connection.rollback()
    return 1

# Function to retrieve a proposal, return None if it fails
@query(database)
def getProposals(cursor:sqlite3.Cursor,connection:sqlite3.Connection,condition):
    # Retrieve proposal(will be None in case it's not found)
    data = cursor.execute("SELECT * FROM proposals WHERE " + condition[0] + " = ?", (condition[1],))
    proposals = []
    columns = data.description
    for i in data.fetchall():
        proposal = {}
        for id,column in enumerate(columns):
            proposal[column[0]] = i[id]

        # Append all the users involved
        cursor.execute("SELECT user FROM UserProposal WHERE proposalId = ?",(proposal["id"],))
        users = [] 
        for i in cursor:
            users.append(i[0])
        proposal["users"] = users
        
        proposals.append(proposal)
            
    if condition[0] == "id" and proposals:
        return proposals[0]
    return proposals
