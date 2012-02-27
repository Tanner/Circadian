$(document).ready(function() {
	resizeCanvas();

	draw();
});

$(window).resize(resizeCanvas);

function resizeCanvas() {
	$("canvas").attr("width", $(document).width());
	$("canvas").attr("height", $(document).height());
}

function draw() {
	$("canvas").draw(function(ctx) {
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, $(document).width(), $(document).height());
    });
}