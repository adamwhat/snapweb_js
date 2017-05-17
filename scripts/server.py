import cv2
from flask import Flask, request, send_from_directory
from flask_cors import CORS
import requests
import json
import numpy as np
app = Flask(__name__, static_url_path='')
CORS(app)

@app.route("/solvepnp", methods=['GET', 'POST'])
def hello():
    # print(request.data)
    # print(type(request.data))
    data = json.loads(request.data.decode("utf-8"))
    idxs = np.array([0,1,5,6])
    imgpoints = np.array(data['imgpoints']).astype('float32')[idxs].reshape(len(idxs), 1, 2)
    objpoints = np.array(data['objpoints']).astype('float32')[idxs].reshape(len(idxs), 1, 3)

    fx = data['fx']
    fy = data['fy']
    cx = data['cx']
    cy = data['cy']
    
    # print(imgpoints)
    # print(objpoints)
    # print(fx)
    # print(fy)
    # print(cx)
    # print(cy)
    cameraMatrix = [[fx, 0, cx],
                    [0, fy, cy],
                    [0,  0, 1.0]]
    rotation, translation = cv2.solvePnP(objpoints, imgpoints,
                                         np.array(cameraMatrix).astype('float32'),
                                         None, flags=cv2.CV_P3P)[-2:]
    """
    rotation1, translation1, inline = cv2.solvePnPRansac(np.array(objpoints).astype('float32'), 
                                                         np.array(imgpoints).astype('float32'), 
                                                         np.array(cameraMatrix).astype('float32'),
                                                         None,
                                                )
    """
    # print("rotation from pnp: ", rotation)
    # print("rotation from pnpRansac: ", rotation1)
    # print("translation from pnp: ", translation)
    # print("translation from pnpRansac: ", translation1)
    return json.dumps({"translation" : translation.tolist(), "rotation" : rotation.tolist()})

if __name__ == "__main__":
    app.run(port=9999)
