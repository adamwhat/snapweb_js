var env;

var rotationMatrix = mat4.create();
var transMatrix = mat4.create();

var translateX = 0.0;
var translateY = 35.0;
var translateZ = 250.0;

var latestTransformation = [];
var ctracker;

var fps = 30;
var removedFrameCounter = 0;

var objStr = "occluder";
var flowers = "flowers1";
var face = "occluder";
var eyes = "crazyEyes";
