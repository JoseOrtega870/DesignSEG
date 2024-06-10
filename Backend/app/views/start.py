from flask import Blueprint, send_file, redirect, url_for
from app.utils import *
import os

bp = Blueprint('a',__name__, url_prefix='/')

@bp.route('', methods = ['GET'])
def run():
    login_dir = os.path.join(os.getcwd(), os.pardir,'login.html')
    return send_file(login_dir)

@bp.route('<htmlFile>', methods = ['GET'])
def getHTML(htmlFile):
    html_dir = os.path.join(os.getcwd(), os.pardir,htmlFile)
    return send_file(html_dir)


@bp.route('/img/<imageName>', methods = ['GET'])
def getImage(imageName):
    image_dir = os.path.join(os.getcwd(), os.pardir, 'img', imageName)
    return send_file(image_dir)

@bp.route('/js/<fileName>', methods = ['GET'])
def getJS(fileName):
    file_dir = os.path.join(os.getcwd(), os.pardir, 'js', fileName)
    return send_file(file_dir)

@bp.route('/css/<fileName>', methods = ['GET'])
def getCSS(fileName):
    file_dir = os.path.join(os.getcwd(), os.pardir, 'css', fileName)
    return send_file(file_dir)
