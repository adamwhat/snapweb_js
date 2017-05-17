import cv2
from flask import Flask, request, send_from_directory
from flask_cors import CORS
import requests
import json
import numpy as np
app = Flask(__name__, static_url_path='')
CORS(app)
CALIBRATE_CAMERA = True

@app.route("/solvepnp", methods=['GET', 'POST'])
def hello():
    data = json.loads(request.data.decode("utf-8"))
    idxs = np.array([0,1,5,6])
    # idxs = np.array(range(data['imgpoints']))
    imgpoints = np.array(data['imgpoints']).astype('float32')[idxs].reshape(len(idxs), 1, 2)
    objpoints = np.array(data['objpoints']).astype('float32')[idxs].reshape(len(idxs), 1, 3)

    fx = data['fx']
    fy = data['fy']
    cx = data['cx']
    cy = data['cy']
    
    cameraMatrix = np.array([[fx, 0, cx],
                    [0, fy, cy],
                    [0,  0, 1.0]]).astype('float32')
    # print "old camera", cameraMatrix

    # import pdb; pdb.set_trace()
    if CALIBRATE_CAMERA:
        _, cameraMatrix, distCoeffs, _, _= cv2.calibrateCamera(
                objpoints.reshape(1, len(idxs), 3).astype('float32'),
                imgpoints.reshape(1, len(idxs), 2).astype('float32'),
                (fx, fy),
                cameraMatrix,
                np.zeros(6, 'float32'),
                flags=cv2.CALIB_USE_INTRINSIC_GUESS)
    # print "new camera", cameraMatrix
    # print "new dist", None if not CALIBRATE_CAMERA else distCoeffs

    rotation, translation = cv2.solvePnP(objpoints,
                                         imgpoints,
                                         cameraMatrix,
                                         distCoeffs if CALIBRATE_CAMERA else None,
                                         flags=cv2.SOLVEPNP_P3P)[-2:]

    # print("rotation from pnp: ", rotation)
    # print("rotation from pnpRansac: ", rotation1)
    # print("translation from pnp: ", translation)
    # print("translation from pnpRansac: ", translation1)

    dst, _ = cv2.Rodrigues(rotation)
    # print rotation, dst
    return json.dumps({"translation" : translation.tolist(), "rotation" : dst.tolist()})

if __name__ == "__main__":
    app.run(port=9999)
