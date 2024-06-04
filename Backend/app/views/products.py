from flask import Blueprint, request
from app.utils import *

bp = Blueprint('products',__name__, url_prefix='/products')


# Product endpoints
@bp.route("/", methods=["GET", "POST", "PUT", "DELETE"])
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
        if validateData(["id", "name", "description", "price", "image"],request.get_json()) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        if updateProduct(request.get_json()):
            return "",200
        else:
            response = responseJson(404,"Product not found")
            return response



    elif request.method == "DELETE":
        if validateData(["id"],request.args) == False:
            response = responseJson(400,"Incorrect parameters sent")
            return response
        if deleteProduct(request.args.get("id")):
            return "",200
        else:
            response = responseJson(404,"Product not found")
            return response

@query(database)
def createProduct(cursor:sqlite3.Cursor,connection:sqlite3.Connection,data:dict):
    try:
        
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
        # Checks whether the product exists
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
