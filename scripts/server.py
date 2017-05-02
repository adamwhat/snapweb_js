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
    data = json.loads(request.data.decode("utf-8"))

    imgpoints = data['imgpoints']
    objpoints = data['objpoints']
    objpoints = np.array(objpoints).astype('float32')
    t_objpoints = objpoints.reshape(1, objpoints.shape[0], 3)
    imgpoints = np.array(imgpoints).astype('float32')
    t_imgpoints = imgpoints.reshape(1, imgpoints.shape[0], 2)

    width = data['width']
    height = data['height']
    imgsize = (int(width), int(height))

    print("size", imgsize)
    print("obj", objpoints.shape)
    print("img", imgpoints.shape)

    cameraMatrixInit = np.array([[600, 0, 300],[0, 600, 200],[0,0,1]]).astype('float32')
    retval, cameraMatrix, distCoeffs, rvecs, tvecs = cv2.calibrateCamera(t_objpoints, t_imgpoints, imgsize, cameraMatrixInit, None, None, None, cv2.CALIB_USE_INTRINSIC_GUESS)

    print("retval: ", retval)
    print("cameraMatrix: ", cameraMatrix)
    print("distCoeffs: ", distCoeffs)
    print("rvecs from camera: ", rvecs)
    print("tvecs from camera: ", tvecs)

    rotation, translation = cv2.solvePnP(objpoints, imgpoints, cameraMatrix, distCoeffs)[-2:]

    print("rvecs from pnp: ", rotation)
    print("tvecs from pnp: ", translation)

    return json.dumps({"translation" : translation.tolist(), "rotation" : rotation.tolist()})

if __name__ == "__main__":
    app.run(port=9999)
