function init_camera_stream(vid) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

    // check for camerasupport
    if (navigator.getUserMedia) {
        // set up stream
        var videoSelector = {video : true};
        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
            var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
            if (chromeVersion < 20) {
                videoSelector = "video";
            }
        };

        navigator.getUserMedia(videoSelector, function( stream ) {
            if (vid.mozCaptureStream) {
                vid.mozSrcObject = stream;
            } else {
                vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
            }
            vid.play();
        }, function() {
            alert("There was some problem trying to fetch video from your webcam.");
        });
    } else {
        alert("Your browser does not seem to support getUserMedia.");
    }
}