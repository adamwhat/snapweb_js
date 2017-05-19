var env;

var transMatrix = mat4.create();

var translateX = 0.0;
var translateY = 35.0;
var translateZ = 250.0;

var translationHistory = [];
var prevQuat = -1;
var ctracker;

var fps = 60;

var objStr = "occluder";
var flowers = "flowers1";
var face = "occluder";
var eyes = "crazyEyes";
var face = "occluder";
var frenchman = "frenchman";

var showFaceContour = true;
var webglCanvas = $("#webglCanvas");
function getMatElement(m, x, y, size) {
    return m[x + y*size];
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
