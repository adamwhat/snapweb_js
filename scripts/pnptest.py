import cv2
import numpy as np
import json

def mapToMat(m):
    keys = sorted(m.keys(), key=lambda a:int(a))
    n = int(np.round(np.sqrt(len(keys))))
    mat = np.zeros((n, n))
    for i, v in enumerate(keys):
        mat[i/n, i%n] = m[v]
    return mat

def vecToMat(m):
    n = np.zeros(len(m.keys()))
    for i in range(len(n)):
        n[i] = m[str(i)]
    return n

def solve(data):
    imgpoints = np.array(data['imgpoints']).astype('float32').reshape(4, 1, 2)
    objpoints = np.array(data['objpoints']).astype('float32').reshape(4, 1, 3)
    fx = data['fx']
    fy = data['fy']
    cx = data['cx']
    cy = data['cy']
    cameraMatrix = np.array([
                    [fx, 0, cx],
                    [0, fy, cy],
                    [0,  0, 1.0]]).astype('float32')

    rotation, translation = cv2.solvePnP(objpoints,
                                         imgpoints,
                                         cameraMatrix,
                                         None,
                                         flags=cv2.SOLVEPNP_P3P)[-2:]
    dst, _ = cv2.Rodrigues(rotation)

    translation = translation.flatten()
    translation1 = np.array(vecToMat(data['translation']))
    rotation0 = np.array(dst)
    rotation1 = np.array(mapToMat(data['rotation']))

    if (True or max(np.absolute(translation - translation1)) > 0.0001):
        # print "imgpoints", imgpoints
        print "rotation0", dst
        print "rotation1", rotation1

with open("testpt.txt", "rb") as f:
    for line in f:
        if not line.startswith("viewer.js:373"): continue
        line = line.replace("viewer.js:373", "").strip()
        d = json.loads(line)
        solve(d)
