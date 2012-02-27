var CIRCLE = (function(x, y, freq) {
	var self = {};

	minFreq = 440;
	maxFreq = 880;

	minRadius = 20
	maxRadius = 100

	minPulseSpeed = 1
	maxPulseSpeed = 2

	x = x;
	y = y;
	freq = Math.max(Math.min(freq, maxFreq), minFreq);
	radius = map(freq, minFreq, maxFreq, minRadius, maxRadius);

	self.pulsing = false
	pulseAmount = 0
	pulseMax = 1000;
	pulseSpeed = map(freq, minFreq, maxFreq, minPulseSpeed, maxPulseSpeed);
	maxGlow = radius * 5;
	darknessFactor = 1.5;

	red = Math.round(Math.random() * 255);
	green = Math.round(Math.random() * 255);
	blue = Math.round(Math.random() * 255);

	red = 0;
	green = 255;
	blue = 0;

	self.inside = function(pointX, pointY) {
		return Math.pow((pointX - x), 2) + Math.pow((pointY - y), 2) < Math.pow(radius, 2);
	}

	self.draw = function(ctx) {
		ctx.fillStyle = "rgb("+red+", "+green+", "+blue+")";

		ctx.beginPath();
		ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
		ctx.fill();

		if (self.pulsing) {
			console.log("Pulse Amount: "+pulseAmount);
			if (pulseAmount <= maxGlow) {
				// Gradient Glow
				var gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseAmount);
			    gradient.addColorStop(0, "rgba("+red+", "+green+", "+blue+", "+map(pulseAmount, 0, maxGlow, 0.75, 0)+")");
			    gradient.addColorStop(0.5, "rgba("+red+", "+green+", "+blue+", "+map(pulseAmount, 0, maxGlow, 0.5, 0)+")");
			    gradient.addColorStop(1, "rgba("+red+", "+green+", "+blue+", 0)");

			    ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(x, y, radius + pulseAmount, 0, 2 * Math.PI, false);
				ctx.fill();

				// Darkness on Circle
				if (pulseAmount >= radius) {
					ctx.strokeStyle = "rgb("+Math.round(red / darknessFactor)+", "+Math.round(green / darknessFactor)+", "+Math.round(blue / darknessFactor)+")";
					ctx.lineWidth = radius - map(pulseAmount, 0, maxGlow, 0, radius);

					ctx.beginPath();
					ctx.arc(x, y, radius + 1 - ctx.lineWidth / 2, 0, 2 * Math.PI, false);
					ctx.stroke();
				} else {
					ctx.fillStyle = "rgb("+Math.round(red / darknessFactor)+", "+Math.round(green / darknessFactor)+", "+Math.round(blue / darknessFactor)+")";

					ctx.beginPath();
					ctx.arc(x, y, pulseAmount, 0, 2 * Math.PI, false);
					ctx.fill();
				}
			}

			// Pulse
			ctx.strokeStyle = "rgb("+red+", "+green+", "+blue+")";
			ctx.lineWidth = 10;

			ctx.beginPath();
			ctx.arc(x, y, pulseAmount, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	}

	self.pulse = function() {
		if (self.pulsing) {
			if (pulseAmount < pulseMax) {
				pulseAmount += pulseSpeed;
			} else {
				pulseAmount = 0;
				self.pulsing = false;
			}
		}
	}

	function map(x, inMin, inMax, outMin, outMax) {
		var result = (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

		return result;//Math.min(Math.max(result, outMin), outMax);
	}

	return self;
});

$(document).ready(function() {
	resizeCanvas();

	var circles = []
	addCircle(CIRCLE(50, 50, 500));

	draw();

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(callback) {
	            window.setTimeout(callback, 1000 / 60);
	          };
    })();

    (function animloop(){
      requestAnimFrame(animloop);
      draw();
    })();

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