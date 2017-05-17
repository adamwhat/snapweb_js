$(document).ready(function() {
    $('.thumbnail').click(function(e) {
        var thumbnailId = $(e.target).attr('id');
        var thumbnailElement = $("#" + thumbnailId);
        console.log(thumbnailElement.data("stickername"))
    });
});