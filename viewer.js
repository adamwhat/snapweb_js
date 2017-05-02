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

function drawShape(gl, shape, program, Mcam, Mproj) {
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
    var positionLocation = gl.getAttribLocation(program, "vert_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 4 * 6, 0);
    var normalsLocation = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normalsLocation);
    gl.vertexAttribPointer(normalsLocation, 3, gl.FLOAT, false, 4 * 6, 4 * 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mcam"), false, Mcam);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Mproj"), false, Mproj);
    // var textureIndexLocation = gl.getUniformLocation(program, "textureIndex");
    // gl.uniform1f(textureIndexLocation, textureIndex);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.triIndexBuffer);
    gl.drawElements(gl.TRIANGLES, shape.triLen, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    gl.useProgram(null);
}

function glEnv(meshes) {
    var gl = initializeWebGL("webglCanvas");

    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);

    var program = createGlslProgram(gl, "vertexShader", "fragmentShader");
    var occluder = meshes.occluder;

    var shape = createShape(gl, occluder);

    function drawFrame(Mcam, Mproj) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.useProgram(program);

        gl.clearColor(0, 0, 0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);



        drawShape(gl, shape, program, Mcam, Mproj);

        gl.useProgram(null);
    }

    return {
        shape: shape,
        drawFrame: drawFrame,
        occluder: occluder
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
    mat4.perspective(projMat, 70, 800.0 / 600.0, 0.01, 2000.0);
    return projMat;
}

function getMVMatrix() {
    var numOfPoints = 5;
    if(ctracker !== undefined && ctracker !== null && ctracker.getCurrentPosition() != false) {
        requestData = {};
        var positions = ctracker.getCurrentPosition();
        requestData['objpoints'] = [];
        requestData['imgpoints'] = [];

        Object.keys(occluder_mapping).forEach(function (key) {
            requestData['imgpoints'].push(positions[key]);
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

                translateX = data["translation"][0][0];
                translateY = data["translation"][1][0];
                translateZ = data["translation"][2][0];

                rotationX = data["rotation"][0][0];
                rotationY = data["rotation"][1][0];
                rotationZ = data["rotation"][2][0];
                console.log(data["translation"])
            }
        });
    }

    var xAxis = vec3.fromValues(1, 0, 0);
    var yAxis = vec3.fromValues(0, 1, 0);
    var zAxis = vec3.fromValues(0, 0, 1);

    var T = mat4.create();
    var translation = vec3.fromValues(translateX, translateY, translateZ);
    mat4.fromTranslation(T, translation);

    var R = mat4.create();
    // // Rotation XYZ
    mat4.rotate(R, R, degreeToRadian(rotationX), xAxis);
    mat4.rotate(R, R, degreeToRadian(rotationY), yAxis);
    mat4.rotate(R, R, degreeToRadian(rotationZ), zAxis);

    var M = mat4.create();
    mat4.mul(M, T, R);
    var result = mat4.create();
    mat4.invert(result, M);

    return result;
}

function runWebGL(meshes) {
    env = glEnv(meshes);
    updateWebGL();
}

function updateWebGL() {
    setTimeout(function() {
        // Change camera matrix here
        var Mproj = getProjectionMatrix();
        var Mcam = getMVMatrix();
        env.drawFrame(Mcam, Mproj);
        window.requestAnimationFrame(updateWebGL);
    }, 1000 / fps);
}

window.onload = function () {
    OBJ.downloadMeshes({
        'occluder': 'data/occluder.obj'
    }, runWebGL);
}

