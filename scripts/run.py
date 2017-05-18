import os

os.system('pip3 install opencv-python')
os.system('pip3 install flask')
os.system('pip3 install flask_cors')
os.system('pip3 install requests')
os.system('pip3 install numpy')
os.system('python3 scripts/server.py &')
os.system('python3 -m http.server 8000')
