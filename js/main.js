const MIN_RADIUS = 20;
const MAX_RADIUS = 100;

var CIRCLE = (function(x, y, radius) {
	var self = {};

	const minFreq = 440;
	const maxFreq = 880;

	const minPulseSpeed = 2;
	const maxPulseSpeed = 5;

	self.x = x;
	self.y = y;
	self.radius = Math.max(Math.min(radius, MAX_RADIUS), MIN_RADIUS);
	self.freq = map(self.radius, MIN_RADIUS, MAX_RADIUS, minFreq, maxFreq);

	self.pulsing = false
	self.pulseAmount = 0
	self.pulseSpeed = map(self.freq, minFreq, maxFreq, maxPulseSpeed, minPulseSpeed);

	self.maxGlow = self.radius * 5;

	const pulseMax = Math.max($(window).height(), $(window).width());
	const darknessFactor = 1.5;

	self.red = Math.round(Math.random() * 255);
	self.green = Math.round(Math.random() * 255);
	self.blue = Math.round(Math.random() * 255);

	self.inside = function(pointX, pointY) {
		return Math.pow((pointX - self.x), 2) + Math.pow((pointY - self.y), 2) < Math.pow(self.radius, 2);
	}

	self.draw = function(ctx) {
		ctx.fillStyle = "rgb("+self.red+", "+self.green+", "+self.blue+")";

		ctx.beginPath();
		ctx.arc(self.x, self.y, self.radius, 0 , 2 * Math.PI, false);
		ctx.fill();

		if (self.pulsing) {
			if (self.pulseAmount <= self.maxGlow) {
				// Gradient Glow
				var gradient = ctx.createRadialGradient(self.x, self.y, 0, self.x, self.y, self.pulseAmount);
			    gradient.addColorStop(0, "rgba("+self.red+", "+self.green+", "+self.blue+", "+map(self.pulseAmount, 0, self.maxGlow, 0.75, 0)+")");
			    gradient.addColorStop(0.5, "rgba("+self.red+", "+self.green+", "+self.blue+", "+map(self.pulseAmount, 0, self.maxGlow, 0.5, 0)+")");
			    gradient.addColorStop(1, "rgba("+self.red+", "+self.green+", "+self.blue+", 0)");

			    ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(self.x, self.y, self.radius + self.pulseAmount, 0, 2 * Math.PI, false);
				ctx.fill();

				// Darkness on Circle
				if (self.pulseAmount >= self.radius) {
					ctx.strokeStyle = "rgb("+Math.round(self.red / darknessFactor)+", "+Math.round(self.green / darknessFactor)+", "+Math.round(self.blue / darknessFactor)+")";
					ctx.lineWidth = self.radius - map(self.pulseAmount, 0, self.maxGlow, 0, self.radius);

					ctx.beginPath();
					ctx.arc(self.x, self.y, self.radius + 1 - ctx.lineWidth / 2, 0, 2 * Math.PI, false);
					ctx.stroke();
				} else {
					ctx.fillStyle = "rgb("+Math.round(self.red / darknessFactor)+", "+Math.round(self.green / darknessFactor)+", "+Math.round(self.blue / darknessFactor)+")";

					ctx.beginPath();
					ctx.arc(self.x, self.y, self.pulseAmount, 0, 2 * Math.PI, false);
					ctx.fill();
				}
			}

			// Pulse
			ctx.strokeStyle = "rgb("+self.red+", "+self.green+", "+self.blue+")";
			ctx.lineWidth = 10;

			ctx.beginPath();
			ctx.arc(self.x, self.y, self.pulseAmount, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
	}

	self.pulse = function() {
		if (self.pulsing) {
			if (self.pulseAmount < pulseMax) {
				self.pulseAmount += self.pulseSpeed;
			} else {
				self.pulseAmount = 0;
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

	for (var i = 0; i <= 3; i++) {
		var attempt = 0;
		var acceptable = true;

		do {
			if (attempt >= 10) {
				break;
			}

			var circle = createRandomCircle();

			for (var i = 0; i < circles.length; i++) {
				if (Math.sqrt(Math.pow(circles[i].x - circle.x, 2) + Math.pow(circles[i].y - circle.y, 2)) <= circles[i].radius + circle.radius) {
					acceptable = false;
					break;
				}
			}

			attempt++;
		} while (!acceptable);

		addCircle(circle);
	}

	var frameCount = 0;
	var fps = 0;
	var lastTime = new Date();

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
		var nowTime = new Date();
		var diffTime = Math.ceil((nowTime.getTime() - lastTime.getTime()));

		if (diffTime >= 1000) {
			fps = frameCount;
			frameCount = 0.0;
			lastTime = nowTime;
		}

		$("canvas").draw(function(ctx) {
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(0, 0, $(document).width(), $(document).height());

			for (var i = 0; i < circles.length; i++) {
				circles[i].pulse();
				circles[i].draw(ctx);
			}

			ctx.fillStyle = '#FFF';
			ctx.font = 'bold 10px sans-serif';
			ctx.fillText('FPS: ' + fps, 4, 12);
	    });

	    frameCount++;
	}

	function createRandomCircle() {
		var radius = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;

		var x = Math.random() * ($(document).width() - radius * 2) + radius
		var y = Math.random() * ($(document).height() - radius * 2) + radius

		return CIRCLE(x, y, radius);
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