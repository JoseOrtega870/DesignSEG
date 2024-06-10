from flask import Blueprint, request
import os
from app.utils import *

bp = Blueprint('images',__name__, url_prefix='/images')

@bp.route('', methods = ['POST'])
def images():
    if 'image' not in request.files:
        response = responseJson(400,"No file found")
        return response

    image = request.files['image']
    if image.filename == '':
        response = responseJson(400,"No selected file")
        return response

    # Save the image to the current directory
    image_dir = os.path.join(os.getcwd(), os.pardir, 'img')
    image.save(os.path.join(image_dir, image.filename))
    return jsonify({"message": "Image uploaded successfully"}), 200