import cv2
from flask import Flask, request, send_from_directory
from flask_cors import CORS
import requests
import json
app = Flask(__name__, static_url_path='')
CORS(app)

@app.route("/solvepnp", methods=['GET', 'POST'])
def hello():
    print request.data
    print type(request.data)
    # data = json.loads(request.data)
    # imgpoints = data['imgpoints']
    # objpoints = data['objpoints']
    # translation, rotation = cv2.solvePnP(imgpoints, objpoints, None, None)
    translation = [1,2,3]
    rotation = [3,4,5]
    return json.dumps({"translation" : translation, "rotation" : rotation})

if __name__ == "__main__":
    app.run(port=8000)
