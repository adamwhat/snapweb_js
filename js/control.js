$(document).ready(function() {
    $('.thumbnail').click(function(e) {
        var target = $(e.target);
        if (!target.is("a")) {
            target = target.parent();
        }
        objStr = target.data("stickername");
    });

    $("input[type='radio']").click(function(){
        var radioValue = $("input[name='facecontour']:checked").val();
        if(radioValue == 'show'){
            showFaceContour = true;
        } else {
            showFaceContour = false;
        }
    });
});