var helper_information_element;

function init_helper_information(element) {
    helper_information_element = element;
    positionLoop();
}

function positionLoop() {
    requestAnimationFrame(positionLoop);
    var positions = ctracker.getCurrentPosition();
    // do something with the positions ...
    // print the positions
    var positionString = "";
    if (positions) {
        for (var p = 0; p < 10; p++) {
            positionString += "featurepoint " + p + " : [" + positions[p][0].toFixed(2) + "," + positions[p][1].toFixed(2) + "]<br/>";
        }
        helper_information_element.innerHTML = positionString;
    }
}
