const $panelBody = $('.panel-body');
const $info = $('.info');

function toggleDisplay() {
    if ($info.attr('class') === "info disable") {
        $info.removeClass('disable');
        $info.addClass('enable');
    } else {
        $info.removeClass('enable');
        $info.addClass('disable');
    }
}

$(document).ready(function() {
    $panelBody.click(function() {
        toggleDisplay();
    });
});