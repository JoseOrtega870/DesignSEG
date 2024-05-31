import subprocess
import sys
import os


ENV_NAME = 'SEGAutomotiveEnv'

# def download_packages(packages, download_dir):
#     subprocess.check_call([sys.executable, "-m", "pip", "download", "-d", download_dir] + packages)

# # Ejemplo de uso:
# packages = ['flask', 'flask_cors', 'bcrypt', 'gunicorn']
# download_dir = 'dependencies'
# download_packages(packages, download_dir)

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
gunicorn
'''
with open('./dependencies/requirements.txt', 'w') as f:
    f.write(requirements_content)

package_dir = 'dependencies'


def activate_virtualenv(env_name):
    # Step 2: Define the activation command based on the OS
    if os.name == 'nt':  # For Windows
        activation_script = os.path.join(env_name, 'Scripts', 'gunicorn')
        command = f'{activation_script} -w 4 app:app'
    else:  # For macOS/Linux
        activation_script = os.path.join(env_name, 'bin', 'gunicorn')
    
        command = f'{activation_script} -w 4 -b 127.0.0.1:5000 app:app'
        print(command)
    
    # Step 3: Run the activation and installation command
    subprocess.run(command, shell=True)

app_file = 'gunicorn -w 4 app:app'

create_virtualenv(ENV_NAME)

install_packages_from_dir(ENV_NAME, package_dir)

activate_virtualenv(ENV_NAME)