var CIRCLE = (function(x, y, freq) {
	var self = {};

	minFreq = 440;
	maxFreq = 880;

	minRadius = 20
	maxRadius = 200

	minPulseSpeed = 1
	maxPulseSpeed = 20

	x = x;
	y = y;
	freq = Math.max(Math.min(freq, maxFreq), minFreq);
	radius = map(freq, minFreq, maxFreq, minRadius, maxRadius);

	self.pulsing = false
	pulseAmount = 0
	pulseMax = 1000;
	pulseSpeed = map(freq, minFreq, maxFreq, minPulseSpeed, maxPulseSpeed);

	red = Math.round(Math.random() * 255);
	green = Math.round(Math.random() * 255);
	blue = Math.round(Math.random() * 255);

	self.inside = function(pointX, pointY) {
		return Math.pow((pointX - x), 2) + Math.pow((pointY - y), 2) < Math.pow(radius, 2);
	}

	self.draw = function(ctx) {
		ctx.fillStyle = "rgb("+red+", "+green+", "+blue+")";

		ctx.beginPath();
		ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
		ctx.fill();

		if (self.pulsing) {
			console.log("Size: "+(radius + pulseAmount));

			ctx.strokeStyle = "rgb("+red+", "+green+", "+blue+")";
			ctx.lineWidth = 5;

			ctx.beginPath();
			ctx.arc(x, y, radius + pulseAmount, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	}

	self.pulse = function() {
		if (self.pulsing) {
			console.log("Circle pulsing... ");
			if (radius + pulseAmount < pulseMax) {
				pulseAmount += pulseSpeed;
			} else {
				pulseAmount = 0;
				self.pulsing = false;
			}
		}
	}

	function map(x, inMin, inMax, outMin, outMax) {
		return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	return self;
});

$(document).ready(function() {
	resizeCanvas();

	var circles = []
	addCircle(CIRCLE(50, 50, 500));

	draw();
	setInterval(draw, 100);

	$("canvas").on("touchstart mousedown", function(event) {
		var touch = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
		pulseCircle(touch.pageX, touch.pageY);
	});

	$(window).resize(resizeCanvas);

	function resizeCanvas() {
		$("canvas").attr("width", $(document).width());
		$("canvas").attr("height", $(document).height());
	}

	function draw() {
		console.log("Drawing the canvas...");

		$("canvas").draw(function(ctx) {
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(0, 0, $(document).width(), $(document).height());

			for (var i = 0; i < circles.length; i++) {
				circles[i].pulse();
				circles[i].draw(ctx);
			}
	    });
	}

	function addCircle(circle) {
		circles[circles.length] = circle;
	}

	function pulseCircle(pointX, pointY) {
		for (var i = 0; i < circles.length; i++) {
				if (circles[i].inside(pointX, pointY)) {
					circles[i].pulsing = true;
				}
			}
	}
});