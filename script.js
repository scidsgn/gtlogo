var logoImage = null
var hudPressed = null

function updateHUD() {
	var crect = document.querySelector("#preview").getClientRects()[0]
	
	var cx = crect.width / 2
	var cy = crect.height / 2
	
	document.querySelectorAll(".hud").forEach((h) => {
		if (h.classList.contains("size")) {
			h.style.left = (cx + +h.getAttribute("data-value")/2) + "px"
			h.style.top = (cy + +h.getAttribute("data-value")/2) + "px"
		} else if (h.classList.contains("radius")) {
			h.style.left = (cx + +h.getAttribute("data-value")) + "px"
			h.style.top = cy +"px"
		} else if (h.classList.contains("angle")) {
			var radians = +h.getAttribute("data-value") * Math.PI / 180
			h.style.left = (cx + 200 * Math.cos(radians)) + "px"
			h.style.top = (cy + 200 * Math.sin(radians)) + "px"
			h.style.transform = "translate(-50%, -50%) rotate(" + h.getAttribute("data-value") + "deg)"
		}
	})
	
	renderLogo(document.querySelector("#preview"))
}

function enableAutoUpdate(input) {
	input.addEventListener("input", () => renderLogo(document.querySelector("#preview")))
}

function enableColorUpdate(input) {
	input.parentNode.style.background = input.value
	input.addEventListener("input", function() {
		this.parentNode.style.background = this.value
	})
}

function addSegment(c) {
	var section = document.createElement("section")
	
	var header = document.createElement("header")
	section.appendChild(header)
	
	var div = document.createElement("div")
	
	var label = document.createElement("label")
	label.innerText = "Color:"
	div.appendChild(label)
	
	var colorInput = document.createElement("div")
	colorInput.className = "colorInput"
	
	var input = document.createElement("input")
	input.type = "color"
	input.value = c ? c : "#605c59"
	
	enableAutoUpdate(input)
	
	colorInput.appendChild(input)
	enableColorUpdate(input)
	
	div.appendChild(colorInput)
	
	section.appendChild(div)
	
	var button = document.createElement("button")
	button.innerText = "Remove segment"
	button.addEventListener("click", function() {
		this.parentNode.parentNode.removeChild(this.parentNode)
		updateSegmentHeaders()
		renderLogo(document.querySelector("#preview"))
	})
	section.appendChild(button)	
	
	document.querySelector("#segments").insertBefore(section, document.querySelector("#addSegment"))
	
	updateSegmentHeaders()
}

function updateSegmentHeaders() {
	document.querySelectorAll("#segments section:not(.nocount) header").forEach((h, i) => {
		h.innerText = "Segment " + (i + 1)
	})
}

function renderLogo(canvas) {
	var ctx = canvas.getContext("2d")
	
	ctx.resetTransform()
	
	ctx.fillStyle = document.querySelector("#imgBgColor").value
	ctx.fillRect(0, 0, 512, 512)
	
	ctx.translate(256, 256)
	
	var outerRadius = 256
	var innerRadius = +document.querySelector("#logoInnerRadiusH").getAttribute("data-value")

	var starSpikes = 16
	var stars = [
		{
			"color": document.querySelector("#starColor1").value,
			"radius": 256
		},
		{
			"color": document.querySelector("#starColor2").value,
			"radius": 205
		}
	]
	
	var segmentOuterRadius = +document.querySelector("#segmentOuterRadiusH").getAttribute("data-value")
	var segmentInnerRadius = +document.querySelector("#segmentInnerRadiusH").getAttribute("data-value")
	var segmentSpacing = document.querySelector("#segmentSpacing").value
	var segmentPhase = +document.querySelector("#segmentPhaseH").getAttribute("data-value") * Math.PI / 180 - Math.PI
	
	var segments = []
	document.querySelectorAll("#segments section:not(.nocount) input").forEach((h) => {
		segments.push({"color": h.value})
	})
	
	var logoRadius = +document.querySelector("#logoSizeH").getAttribute("data-value")
	
	// star
	for (star of stars) {
		ctx.fillStyle = star.color
		ctx.beginPath()
		
		for (var i = 0; i < starSpikes * 2; i++) {
			var r = (i % 2) ? (innerRadius * (star.radius / outerRadius)) : star.radius
			var angle = Math.PI * i / starSpikes
			var x = r * Math.cos(angle)
			var y = r * Math.sin(angle)
			
			if (i)
				ctx.lineTo(x, y)
			else
				ctx.moveTo(x, y)
		}
		
		ctx.fill()
		ctx.closePath()
	}
	
	// circle
	ctx.fillStyle = document.querySelector("#bgColor").value
	ctx.beginPath()
	ctx.arc(0, 0, innerRadius, 0, 2*Math.PI)
	ctx.fill()
	ctx.closePath()
	ctx.fillRect(0, 0, 10, 10)
	
	// segments
	for (var i = 0; i < segments.length; i++) {
		var seg = segments[i]
		var angle1 = (i / segments.length) * 2 * Math.PI + segmentPhase
		var angle2 = ((i + 1) / segments.length) * 2 * Math.PI + segmentPhase
		
		var orpoint1 = circleSegPoint(angle1, segmentOuterRadius, -segmentSpacing)
		var orpoint2 = circleSegPoint(angle2, segmentOuterRadius, segmentSpacing)
		var irpoint1 = circleSegPoint(angle1, segmentInnerRadius, -segmentSpacing)
		var irpoint2 = circleSegPoint(angle2, segmentInnerRadius, segmentSpacing)
		
		ctx.fillStyle = seg.color
		ctx.beginPath()

		ctx.moveTo(orpoint1[0], orpoint1[1], false)
		arcBetweenPoints(ctx, orpoint1, orpoint2)
		ctx.lineTo(irpoint2[0], irpoint2[1])
		arcBetweenPoints(ctx, irpoint2, irpoint1, true)
		ctx.lineTo(orpoint1[0], orpoint1[1])
		
		ctx.fill()
		ctx.closePath()
	}
	
	// logo
	if (logoImage) {
		var w, h
		var ratio = logoImage.width / logoImage.height
			
		if (ratio > 1) {
			w = logoRadius
			h = logoRadius / ratio
		} else {
			w = logoRadius * ratio
			h = logoRadius
		}
		ctx.drawImage(logoImage, -w/2, -h/2, w, h)
	}
}

function arcBetweenPoints(ctx, p1, p2, b) {
	var radius = Math.hypot(p1[0], p1[1])
	
	var angle1 = Math.atan2(p1[1], p1[0])
	var angle2 = Math.atan2(p2[1], p2[0])
	
	ctx.arc(0, 0, radius, angle1, angle2, b)
}

function circleSegPoint(angle, radius, space) {
	// line origin	
	var spaceAngle = angle + Math.PI / 2
	var lox = space * Math.cos(spaceAngle)
	var loy = space * Math.sin(spaceAngle)
	
	// line points	
	var lx1 = lox + (radius * 2) * Math.cos(angle)
	var ly1 = loy + (radius * 2) * Math.sin(angle)
	var lx2 = lox - (radius * 2) * Math.cos(angle)
	var ly2 = loy - (radius * 2) * Math.sin(angle)
	
	// line info
	var dx = lx2 - lx1
	var dy = ly2 - ly1
	var dr = Math.hypot(dx, dy)
	var det = lx1 * ly2 - lx2 * ly1
	
	var sgn = (x) => (x < 0) ? -1 : 1
	
	var x1 = (det * dy + sgn(dy) * dx * Math.sqrt(radius**2 * dr**2 - det**2)) / dr**2
	var y1 = (-det * dx + Math.abs(dy) * Math.sqrt(radius**2 * dr**2 - det**2)) / dr**2
	
	var x2 = (det * dy - sgn(dy) * dx * Math.sqrt(radius**2 * dr**2 - det**2)) / dr**2
	var y2 = (-det * dx - Math.abs(dy) * Math.sqrt(radius**2 * dr**2 - det**2)) / dr**2
	
	var cx = radius * Math.cos(angle)
	var cy = radius * Math.sin(angle)
	
	var dot1 = cx*x1 + cy*y1
	var dot2 = cx*x2 + cy*y2
	
	if (dot1 < dot2)
		return [x1, y1]
	return [x2, y2]
}

addSegment("#01e520")
addSegment()
addSegment()
addSegment()
renderLogo(document.querySelector("#preview"))
updateHUD()

// Do the HUD controls
document.querySelectorAll(".hud").forEach((h) => {
	h.addEventListener("mousedown", (e) => {
		if (e.buttons == 1) {
			hudPressed = h
		}
	})
	h.addEventListener("mouseup", (e) => {
		hudPressed = null
	})
})
document.querySelector("#preview").addEventListener("mousemove", (e) => {
	if (hudPressed) {
		var dx = e.movementX
		var dy = e.movementY
		
		h = hudPressed
			
		if (h.classList.contains("size")) {
			var value = Math.max(0, +h.getAttribute("data-value") + (dx + dy))
			h.setAttribute("data-value", value)
		} else if (h.classList.contains("radius")) {
			var value = Math.max(0, +h.getAttribute("data-value") + dx)
			h.setAttribute("data-value", value)
		} else if (h.classList.contains("angle")) {
			var crect = document.querySelector("#preview").getClientRects()[0]
			var x1 = crect.left + crect.width / 2
			var y1 = crect.top + crect.height / 2
			var x2 = e.clientX
			var y2 = e.clientY
			
			h.setAttribute("data-value", Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI)
		}
		
		updateHUD()
	}
})
document.querySelector("#preview").addEventListener("mouseup", (e) => {
	hudPressed = null
})

// logo or sth
document.querySelector("#logoImage").addEventListener("change", function() {
	if (this.value) {
		logoImage = new Image()
		logoImage.setAttribute('crossOrigin', 'anonymous');
		
		logoImage.onload = function() {
			renderLogo(document.querySelector("#preview"))
		}
		
		logoImage.src = URL.createObjectURL(this.files[0])
	}
})

// Accordions! (only portrait)
document.querySelectorAll("div.accordion h1").forEach(function(h1) {
	h1.addEventListener("click", function() {
		this.parentNode.classList.toggle("expanded");
	})
})

// Render on update
document.querySelectorAll(".autorender").forEach(function(inp) {
	enableAutoUpdate(inp)
})
document.querySelectorAll(".colorInput input").forEach(function(inp) {
	enableColorUpdate(inp)
})

// Add segment
document.querySelector("#addSegment").addEventListener("click", () => {
	addSegment()
	renderLogo(document.querySelector("#preview"))
})

// Tabs
document.querySelectorAll("footer header div").forEach((t) => {
	t.addEventListener("click", function() {
		document.querySelector("footer content.visible").classList.remove("visible")
		document.querySelector("footer content[data-tab="+this.getAttribute("data-tab")+"]").classList.add("visible")
		
		document.querySelector(".hudSection.visible").classList.remove("visible")
		document.querySelector("#"+this.getAttribute("data-tab")+"HUD").classList.add("visible")
		
		document.querySelector("footer header div.visible").classList.remove("visible")
		this.classList.add("visible")
	})
})

document.querySelector("#defaultGTLogo").addEventListener("load", function() {
	logoImage = this;
	renderLogo(document.querySelector("#preview"))
})

document.querySelector(".export").addEventListener("click", function() {
	var url = document.querySelector("#preview").toDataURL("image/png");
	var a = document.createElement("a");

	a.setAttribute("href", url);
	a.setAttribute("download", "gtlogo.png");
	a.click();
})
