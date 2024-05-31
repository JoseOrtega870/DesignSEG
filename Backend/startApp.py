import subprocess
import sys
import os


ENV_NAME = 'SEGAutomotiveEnv'

def create_virtualenv(env_name):
    subprocess.check_call([sys.executable, "-m", "venv", env_name])

def create_virtualenv(env_name):
    subprocess.check_call([sys.executable, "-m", "venv", env_name])

def install_packages_from_dir(env_name, package_dir):
    if os.name == 'nt':
        pip_path = os.path.join(env_name, 'Scripts', 'pip.exe')
    else:
        pip_path = os.path.join(env_name, 'bin', 'pip')
    
    subprocess.check_call([pip_path, "install", "--no-index", "--find-links", package_dir, "-r", os.path.join(package_dir, 'requirements.txt')])

# Crear un archivo requirements.txt con la lista de paquetes
requirements_content = '''
flask
flask_cors
bcrypt
'''
with open('./dependencies/requirements.txt', 'w') as f:
    f.write(requirements_content)

package_dir = 'dependencies'


def run_flask_app(env_name, app_file):
    # Detecta la plataforma (Windows o Unix)
    if os.name == 'nt':
        python_path = os.path.join(env_name, 'Scripts', 'python.exe')
    else:
        python_path = os.path.join(env_name, 'bin', 'python')
    
    # Ejecuta la aplicación Flask
    subprocess.check_call([python_path, app_file])

app_file = 'app.py'

create_virtualenv(ENV_NAME)

install_packages_from_dir(ENV_NAME, package_dir)

run_flask_app(ENV_NAME, app_file)