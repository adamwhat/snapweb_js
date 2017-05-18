var env;

var rotationX = 0.0;
var rotationY = 0.0;
var rotationZ = 0.0;
var rotationMatrix = mat4.create();

var transMatrix = mat4.create();

var translateX = 0.0;
var translateY = 35.0;
var translateZ = 250.0;

var latestTransformation = [];
var ctracker;

var fps = 30;
var removedFrameCounter = 0;

function getMatElement(m, x, y, size) {
    return m[x + y*size];
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}