var objStr = "occluder";
var program;
var texture;
var obj;
var flowers = "flowers1";
var face = "occluder";

$("#filter").change(function () {
    objStr = $("#filter").val();
});

function createShape(gl, meshdata) {
    var shape = {};

    var attributeData = [];
    for (var i = 0; i < meshdata.vertices.length / 3; i++) {
        attributeData.push(meshdata.vertices[3*i]);
        attributeData.push(meshdata.vertices[3*i+1]);
        attributeData.push(meshdata.vertices[3*i+2]);
        attributeData.push(meshdata.vertexNormals[3*i]);        
        attributeData.push(meshdata.vertexNormals[3*i+1]);        
        attributeData.push(meshdata.vertexNormals[3*i+2]);
        attributeData.push(meshdata.textures[2*i]);     
        attributeData.push(meshdata.textures[2*i+1]);
    }

    shape.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeData), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    shape.triIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshdata.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    shape.triLen = meshdata.indices.length;
    return shape;
}

function drawFlowers(gl, shape, program, Mcam, Mproj, texture) {
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    var positionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 8, 0);

    var uvLocation = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 4 * 8, 4 * 6);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mcam"), false, Mcam);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mproj"), false, Mproj);

    if (gl.getUniformLocation(program, "texture") != null) {
        // Step 1: Activate a "texture unit" of your choosing.
        gl.activeTexture(gl.TEXTURE0);
        // Step 2: Bind the texture you want to use.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Step 3: Set the uniform to the "index" of the texture unit you just activated.
        var textureLocation = gl.getUniformLocation(program, "texture");
        gl.uniform1i(textureLocation, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
    gl.drawElements(gl.TRIANGLES, shape.triLen, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    gl.useProgram(null);
}


function drawFace(gl, shape, program, Mcam, Mproj, texture) {
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    var positionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 8, 0);
    var normalsLocation = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalsLocation);
    gl.vertexAttribPointer(normalsLocation, 3, gl.FLOAT, false, 4 * 8, 4 * 3);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mcam"), false, Mcam);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mproj"), false, Mproj);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
    gl.drawElements(gl.TRIANGLES, shape.triLen, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    gl.useProgram(null);
}

function drawShape(obj, gl, shape, program, Mcam, Mproj, texture) {
    switch (obj) {
        case flowers:
            drawFlowers(gl, shape, program, Mcam, Mproj, texture);
            break;
        case face:
            drawFace(gl, shape, program, Mcam, Mproj, texture);
            break;
        default:
            console.log(obj + "is not a valid filter");
            break;
    }

}

// function drawShape(gl, shape, program, Mcam, Mproj, texture) {
//     gl.useProgram(program);

//     gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
//     var positionLocation = gl.getAttribLocation(program, "vert_position");
//     gl.enableVertexAttribArray(positionLocation);
//     gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 8, 0);
//     if (gl.getAttribLocation(program, "normal") != null && objStr == "occluder") {
//         var normalsLocation = gl.getAttribLocation(program, "normal");
//         gl.enableVertexAttribArray(normalsLocation);
//         gl.vertexAttribPointer(normalsLocation, 3, gl.FLOAT, false, 4 * 8, 4 * 3);
//     }
//     if (objStr == "flowers1") {
//         var uvLocation = gl.getAttribLocation(program, "uv");
//         gl.enableVertexAttribArray(uvLocation);
//         gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 4 * 8, 4 * 6);
//     }
//     gl.bindBuffer(gl.ARRAY_BUFFER, null);

//     gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mcam"), false, Mcam);
//     gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mproj"), false, Mproj);
//     // var textureIndexLocation = gl.getUniformLocation(program, "textureIndex");
//     // gl.uniform1f(textureIndexLocation, textureIndex);
//     if (gl.getUniformLocation(program, "texture") != null && objStr == "flowers1") {
//         // Step 1: Activate a "texture unit" of your choosing.
//         gl.activeTexture(gl.TEXTURE0);
//         // Step 2: Bind the texture you want to use.
//         gl.bindTexture(gl.TEXTURE_2D, texture);
//         // Step 3: Set the uniform to the "index" of the texture unit you just activated.
//         var textureLocation = gl.getUniformLocation(program, "texture");
//         gl.uniform1i(textureLocation, 0);
//     }


//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
//     gl.drawElements(gl.TRIANGLES, shape.triLen, gl.UNSIGNED_SHORT, 0);
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


//     gl.useProgram(null);
// }

function initText(gl, textImg) {
    // Step 1: Create the texture object.
    var texture = gl.createTexture();
    // Step 2: Bind the texture object to the "target" TEXTURE_2D
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Step 3: (Optional) Tell WebGL that pixels are flipped vertically,
    //         so that we don't have to deal with flipping the y-coordinate.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Step 4: Download the image data to the GPU.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textImg);
    // Step 5: Creating a mipmap so that the texture can be anti-aliased.
    gl.generateMipmap(gl.TEXTURE_2D);
    // Step 6: Clean up.  Tell WebGL that we are done with the target.
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function glEnv(meshes, textImg) {
    var gl = initializeWebGL("webglCanvas");

    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);
    var flowers_shape = createShape(gl, meshes.flowers1);
    var occluder_shape = createShape(gl, meshes.occluder);

    function drawFrame(Mcam, Mproj) {
        var program;
        var texture;
        var obj;
        var shape;
        if (objStr === flowers) {
            shape = flowers_shape;
            program = createGlslProgram(gl, 
                flowers + "VertexShader", 
                flowers + "FragmentShader");
            texture = initText(gl, textImg);
            obj = meshes[objStr];
        } else if (objStr === face) {
            shape = occluder_shape;
            program = createGlslProgram(gl, 
                face + "VertexShader", 
                face + "FragmentShader");
            obj = meshes[objStr];
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.useProgram(program);

        gl.clearColor(0, 0, 0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        drawShape(objStr, gl, shape, program, Mcam, Mproj, texture);

        gl.useProgram(null);
    }

    return {
        drawFrame: drawFrame,
    };
}

function degreeToRadian(d) {
    return d * Math.PI / 180.0;
}

function radianToDegree(r) {
    return r * 180.0 / Math.PI;
}

function getProjectionMatrix() {
    var projMat = mat4.create();
    mat4.perspective(projMat, 70, 800.0 / 600.0, 0.01, 20000.0);
    return projMat;
}

function adjustAngle(r) {
    while (r < Math.pi / 2) {
        r = r + Math.pi;
    }
    while (r > Math.pi / 2) {
        r = r - Math.pi;
    }
    return r;
}

var count = 500;
function getMVMatrix() {
    if(ctracker !== undefined && ctracker !== null && ctracker.getCurrentPosition() != false) {
        requestData = {};
        var positions = ctracker.getCurrentPosition();
        requestData['objpoints'] = [];
        requestData['imgpoints'] = [];

        Object.keys(occluder_mapping).forEach(function (key) {
            requestData['imgpoints'].push(positions[key]);
            console.log(positions[key]);
            requestData['objpoints'].push(occluder_mapping[key]);
        })
        requestData['fx'] = 600;
        requestData['fy'] = 600;
        requestData['cx'] = 300;
        requestData['cy'] = 200;

        $.ajax({
            async: true,
            url: 'http://localhost:9999/solvepnp',
            data: JSON.stringify(requestData),
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            error: function (xhr, status, error) {
                console.log(error);
            },
            success: function (data) {
                if (count > 0) {
                    console.log(data);
                    count -= 1;
                }
                var newTranslateX = data["translation"][0][0];
                var newTranslateY = data["translation"][1][0];
                var newTranslateZ = data["translation"][2][0];

                var rot = data["rotation"];
                // var newRotationX = adjustAngle(data["rotation"][0]);
                // var newRotationY = adjustAngle(data["rotation"][1]);
                // var newRotationZ = adjustAngle(data["rotation"][2]);

                // var latestTransformation = [newTranslateX, newTranslateY, newTranslateZ];
                // if (isNewTransformationOutlier(latestTransformation)) {
                //     removedFrameCounter = removedFrameCounter + 1;
                //     console.log("Number of Outlier Transformation removed: " + removedFrameCounter);
                //     return;
                // }

                translateX = newTranslateX;
                translateY = newTranslateY;
                translateZ = newTranslateZ;

                var T = mat4.create();
                var translation = vec3.fromValues(translateX, translateY, translateZ);
                mat4.fromTranslation(T, translation);

                transMatrix = mat4.fromValues(
                    rot[0][0], rot[1][0], rot[2][0], 0,
                    rot[0][1], rot[1][1], rot[2][1], 0,
                    rot[0][2], rot[1][2], rot[2][2], 0,
                    0, 0, 0, 1,
                );
                // var yAxis = vec3.fromValues(0, 1, 0);
                // mat4.rotate(transMatrix, transMatrix, degreeToRadian(180), yAxis);
                mat4.mul(transMatrix, transMatrix, T);

                // var zAxis = vec3.fromValues(0, 0, 1);
                // mat4.rotate(transMatrix, transMatrix, degreeToRadian(-180), zAxis);
                // var xAxis = vec3.fromValues(1, 0, 0);
                // mat4.rotate(transMatrix, transMatrix, degreeToRadian(180), xAxis);

                // var cvToGl = mat4.create();
                // cvToGl[0][0] = 1;
                // cvToGl[1][1] = -1;
                // cvToGl[2][2] = -1;
                // mat4.mul(transMatrix, cvToGl, transMatrix);


                // transMatrix = mat4.fromValues(
                //     rot[0][0], rot[0][1], rot[0][2], newTranslateX,
                //     rot[1][0], rot[1][1], rot[1][2], newTranslateY,
                //     rot[2][0], rot[2][1], rot[2][2], newTranslateZ,
                //     0, 0, 0, 1,
                // );


                // rotationX = newRotationX;
                // rotationY = newRotationY;
                // rotationZ = newRotationZ;

            }
        });
    }




    // var xAxis = vec3.fromValues(1, 0, 0);
    // mat4.rotate(transMatrix, transMatrix, degreeToRadian(180), xAxis);
    // var yAxis = vec3.fromValues(0, 1, 0);
    // var zAxis = vec3.fromValues(0, 0, 1);

    // var T = mat4.create();
    // var translation = vec3.fromValues(translateX, translateY, translateZ);
    // mat4.fromTranslation(T, translation);

    // var M = mat4.create();

    // cvToGL[0][0] = -1.0;
    // cvToGL[1][1] = -1.0;
    // cvToGL[2][2] = -1.0;

    // mat4.mul(M, cvToGL, transMatrix);
    // var R = mat4.create();
    // // R = mat4.fromValues(0.5, 0.866, 0, 0,
    // //         -0.866, 0.6, 1, 0,
    // //         0, 0, 1, 0,
    // //         0, 0, 0, 1)
    // // // Rotation XYZ
    // // mat4.rotate(R, R, degreeToRadian(180), xAxis);
    // // mat4.rotate(R, R, degreeToRadian(180), yAxis);
    // // mat4.rotate(R, R, degreeToRadian(180), zAxis);

    // // mat4.rotate(R, R, rotationX, xAxis);
    // // mat4.rotate(R, R, rotationY, yAxis);
    // // mat4.rotate(R, R, rotationZ, zAxis);

    // var M = mat4.create();
    // // if (count > 0) {
    // //     console.log(R);
    // //     count -= 1;
    // // }
    // mat4.mul(M, R, T);
    var result = mat4.create();
    mat4.invert(result, transMatrix);

    return result;
}

function isNewTransformationOutlier(newTransformation) {
    if (latestTransformation.length > 0) {
        for (var p = 0; p < latestTransformation.length; p++) {
            var transformationDiffBetweenFrame = math.abs(newTransformation[p] - latestTransformation[p])
            if (transformationDiffBetweenFrame > 500.0) {
                return true;
            }
        }
    }
    latestTransformation = newTransformation
    return false;
}

function runWebGL(meshes, textImg) {
    env = glEnv(meshes, textImg);
    updateWebGL();
}

function updateWebGL() {
    setTimeout(function() {
        // Change camera matrix here
        var Mproj = getProjectionMatrix();
        var Mcam = getMVMatrix();
        env.drawFrame(Mcam, Mproj);
        // TODO:
        window.requestAnimationFrame(updateWebGL);
    }, 1000 / fps);
}

function initWebGlCanvas() {
    var textImg = new Image();
    textImg.onload = function () {
        OBJ.downloadMeshes({
            'occluder': 'data/occluder_n.obj',
            'flowers1': 'data/flowers1_n.obj',
        }, function (meshes) {
            runWebGL(meshes, textImg);
        });
    };
    textImg.src = "data/flower_wreath.png";
}

