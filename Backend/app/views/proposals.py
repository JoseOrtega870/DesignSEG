from flask import Blueprint, request
from app.utils import *
import time

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
        if validateData(["currentUser","proposalId","title","description","currentSituation","area","status","type","feedback","usersId","creationDate","closeDate","assignedPoints","formerEvaluatorUser","currentEvaluatorUser"],jsonData) == False:
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
    proposalUsers = []
    # Insert into UserProposal
    for id in data["usersId"]:
        data = cursor.execute("SELECT firstname, middlename, lastname FROM users WHERE username = ?", (id,))
        row = data.fetchone()
        proposalUsers.append(row[0] + " " + row[1] + " " + row[2])
        if not row:
            connection.rollback()
            return False
        cursor.execute("INSERT INTO UserProposal (user, proposalId) VALUES (?, ?)",(id,proposalId))

    # Send email to all VSE
    vseUsers = cursor.execute("SELECT firstname, email FROM users WHERE role = 'VSE'")
    vseUsers = vseUsers.fetchall()
    for user in vseUsers:
        email_content = {
            "name": user[0],
            "id": proposalId,
            "title": data["title"],
            "description": data["description"],
            "area": data["area"],
            "category": data["category"],
            "creationDate": time.strftime("%d-%b-%Y"),
            "proposalUsers": proposalUsers
        }
        send_email(user[1],email_content, "VSE_new_proposal")

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
    cursor.execute("UPDATE proposals SET title = ?, category = ?,currentSituation = ?, area = ?, status = ?, description = ?, type = ?, creationDate = ?, closeDate = ?, assignedPoints = ?, formerEvaluatorUser = ?, currentEvaluatorUser = ? WHERE id = ?",
                    (data["title"], data["category"], data["currentSituation"], data["area"], data["status"], data["description"], data["type"], data["creationDate"], data["closeDate"], data["assignedPoints"], data["formerEvaluatorUser"], data["currentEvaluatorUser"], data["proposalId"]))
        
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
    sender = result.fetchone()

    if sender[0] == "VSE" or sender[0] == "admin" or sender[0] == "Champion":
        cursor.execute("SELECT Users.email, Users.firstname FROM users, UserProposal WHERE Users.username = UserProposal.user AND UserProposal.proposalId = ?",(data["proposalId"],))
        receivers = cursor.fetchone()
        # If the status is different, send an email
        if proposal[5] != data["status"]:
            for receiver in receivers:
                email_content = {
                    "name": receiver[1],
                    "id": proposal[0],
                    "title": proposal[1],
                    "creationDate": proposal[8],
                    "oldStatus": proposal[5],
                    "status": data["status"]
                }
                send_email(receiver[0], email_content, "proposal_status_change")
        # If the feedback is different, send an email
        if proposal[7] != data["feedback"]:
            for receiver in receivers:
                email_content = {
                    "name": receiver[1],
                    "id": proposal[0],
                    "title": proposal[1],
                    "creationDate": proposal[8],
                    "message": data["feedback"]
                }
                send_email(receiver[0], email_content, "user_has_a_new_message")

        connection.commit()
        return 3
    
    # Gets the current evaluator of the proposal
    currentEvaluator = cursor.execute("SELECT email, firstname FROM users, proposals WHERE Users.username = Proposals.currentEvaluatorUser AND proposals.id = ?",(data["proposalId"],))
    currentEvaluator = currentEvaluator.fetchone()

    # Checks whether the user editing is one of the people who suggested it
    cursor.execute("SELECT user FROM UserProposal WHERE proposalId = ?",(data["proposalId"],))
    for i in cursor:
        if i[0] == data["currentUser"]:
            if proposal[7] != data["feedback"]:
                email_content = {
                    "name": currentEvaluator[1],
                    "id": proposal[0],
                    "title": proposal[1],
                    "creationDate": proposal[8],
                    "message": data["feedback"]
                }
                send_email(currentEvaluator[0], email_content, "VSE_or_CHAMPION_has_a_new_message")
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
