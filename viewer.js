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

function getCircleData(gl, cornerCount, center, radius) {
    var vertexData = [];
    vertexData.push(0.0 + center[0]);
    vertexData.push(0.0 + center[1]);
    vertexData.push(0.0 + center[2]);
    vertexData.push(0.5);
    vertexData.push(0.5);
    for (var j = 0; j < cornerCount; j++) {
        var theta = 2*Math.PI*j/cornerCount;
        var x = Math.cos(theta) * radius;
        var y = Math.sin(theta) * radius;
        vertexData.push(x + center[0]);
        vertexData.push(y + center[1]);
        vertexData.push(0.0 + center[2]);
        vertexData.push(0.5+0.45*x);
        vertexData.push(0.5+0.45*y);
    }
    var vertexArray = new Float32Array(vertexData);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexData = [];
    for(var j = 0; j < cornerCount; j ++) {
        indexData.push(0);
        indexData.push(j + 1);
        indexData.push((j + 1) % cornerCount + 1);
    }
    var indexArray = new Uint16Array(indexData);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        "vertexBuffer": vertexBuffer,
        "triIndexBuffer": indexBuffer,
        "triLen": cornerCount * 3,
    }
}

function drawOneEye(gl, shape, program, Mcam, Mproj, texture) {
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    var positionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 5, 0);

    var uvLocation = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 4 * 5, 4 * 3);
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

function drawEyes(gl, shape, program, Mcam, Mproj, texture) {    
    var leftEyeCenter = [-0.8, 0.4166, 0.78];
    var rightEyeCenter = [0.8, 0.4166, 0.78];

    // var rightEyeCenter = occluder_mapping[32];
    var radius = 0.6;
    var cornerCount = 32;

    var leftShape = getCircleData(gl, cornerCount, leftEyeCenter, radius);
    var rightShape = getCircleData(gl, cornerCount, rightEyeCenter, radius);

    drawOneEye(gl, leftShape, program, Mcam, Mproj, texture);
    drawOneEye(gl, rightShape, program, Mcam, Mproj, texture);

    gl.useProgram(program);

}

function drawShape(obj, gl, shape, program, Mcam, Mproj, texture) {
    switch (obj) {
        case flowers:
            drawFlowers(gl, shape, program, Mcam, Mproj, texture);
            break;
        case face:
            drawFace(gl, shape, program, Mcam, Mproj, texture);
            break;
        case eyes:
            drawEyes(gl, shape, program, Mcam, Mproj, texture);
            break;
        default:
            console.log(obj + "is not a valid filter");
            break;
    }

}

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
        var shape;
        var cornerCount = 32;

        switch (objStr) {
            case flowers:
                shape = flowers_shape;
                program = createGlslProgram(gl, 
                    flowers + "VertexShader", 
                    flowers + "FragmentShader");
                texture = initText(gl, textImg);
                break;
            case face:
                shape = occluder_shape;
                program = createGlslProgram(gl, 
                    face + "VertexShader", 
                    face + "FragmentShader");
                break;
            case eyes:
                program = createGlslProgram(gl, 
                    eyes + "VertexShader", 
                    eyes + "FragmentShader");
                texture = initText(gl, textImg);
                break;
            default:
                console.log(objStr + "is not a valid filter");
                break;
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.useProgram(program);
        gl.canvas.width = webglCanvas.width();
        gl.canvas.height = webglCanvas.height();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        $(window).resize(function () {
            gl.canvas.width = webglCanvas.width();
            gl.canvas.height = webglCanvas.height();
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        });

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
    mat4.perspective(projMat, 70, webglCanvas.width()/webglCanvas.height(), 0.01, 20000.0);
    return projMat;
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
            requestData['objpoints'].push(occluder_mapping[key]);
        })
        requestData['fx'] = webglCanvas.width();
        requestData['fy'] = webglCanvas.width();
        requestData['cx'] = webglCanvas.width()/2.0;
        requestData['cy'] = webglCanvas.height()/2.0;

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
                var newTranslateX = data["translation"][0][0];
                var newTranslateY = data["translation"][1][0];
                var newTranslateZ = data["translation"][2][0];

                var rot = data["rotation"];

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
                var zAxis = vec3.fromValues(0, 0, 1);

                // hack that convert cv convention to gl
                var cvToGl = mat4.fromValues(
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                );
                mat4.mul(transMatrix, cvToGl, transMatrix);
                mat4.rotate(transMatrix, transMatrix, degreeToRadian(-180), zAxis);

                mat4.mul(transMatrix, transMatrix, T);

            }
        });
    }

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

