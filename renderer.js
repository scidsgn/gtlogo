function renderLogo(logo) {
	var ctx = document.querySelector("#preview").getContext("2d")
	
	ctx.resetTransform()
	
	ctx.clearRect(0, 0, 512, 512)
	
	ctx.translate(256, 256)
	
	ctx.globalCompositeOperation = "destination-over"
	
	// Logo
	if (logo.content.core.logo.image) {
		var logoImage = logo.content.core.logo.image
		var logoRadius = logo.content.core.logo.radius * 2
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
	
	// Segment sets
	for (var set of logo.content.segmentSets) {
		switch (set.style) {
			case "traditional":
				var spacing = set.spacing / 2
				var phase = set.phase * Math.PI / 180
				
				for (var i = 0; i < set.segments.length; i++) {
					var segment = set.segments[i]
					
					var angle1 = (i / set.segments.length) * 2 * Math.PI + phase
					var angle2 = ((i + 1) / set.segments.length) * 2 * Math.PI + phase
					
					var orpoint1 = circleSegPoint(angle1, segment.outerRadius, -spacing)
					var orpoint2 = circleSegPoint(angle2, segment.outerRadius, spacing)
					var irpoint1 = circleSegPoint(angle1, segment.innerRadius, -spacing)
					var irpoint2 = circleSegPoint(angle2, segment.innerRadius, spacing)
					
					ctx.fillStyle = segment.color
					ctx.beginPath()

					ctx.moveTo(orpoint1[0], orpoint1[1], false)
					arcBetweenPoints(ctx, orpoint1, orpoint2)
					ctx.lineTo(irpoint2[0], irpoint2[1])
					arcBetweenPoints(ctx, irpoint2, irpoint1, true)
					ctx.lineTo(orpoint1[0], orpoint1[1])
					
					ctx.fill()
					ctx.closePath()
				}
				break
		}
	}
	
	// Core
	ctx.fillStyle = logo.content.core.color
	ctx.beginPath()
	ctx.arc(0, 0, logo.content.core.radius, 0, 2 * Math.PI)
	ctx.fill()
	ctx.closePath()
	
	// Star
	if (logo.star) {
		switch (logo.star.style) {
			case "traditional":
				for (var j = logo.star.items.length - 1; j >= 0; j--) {
					var item = logo.star.items[j]
					for (var i = 0; i < item.points; i++) {
						var itemPos = i / item.points
						
						var centerAngle = 2 * Math.PI * itemPos
						var spacingAngle = (item.spacing / 2) * (Math.PI / 180)
						var dAngle = Math.PI / item.points - spacingAngle
						
						var scale = (logo.content.core.radius + item.position * (256 - logo.content.core.radius)) / 256
						var largeRadius = scale * 256
						var smallRadius = scale * logo.content.core.radius
						
						ctx.rotate(item.rotation * Math.PI / 180)
						
						ctx.fillStyle = item.colors[Math.floor(itemPos * item.colors.length)]
						ctx.beginPath()
						
						ctx.moveTo(
							smallRadius * Math.cos(centerAngle - dAngle),
							smallRadius * Math.sin(centerAngle - dAngle)
						)							
						ctx.lineTo(
							largeRadius * Math.cos(centerAngle),
							largeRadius * Math.sin(centerAngle)
						)
						ctx.lineTo(
							smallRadius * Math.cos(centerAngle + dAngle),
							smallRadius * Math.sin(centerAngle + dAngle)
						)
						ctx.lineTo(0, 0)
						
						ctx.fill()
						ctx.closePath()
						
						ctx.rotate(-item.rotation * Math.PI / 180)
					}
				}
				break
		}
	}
	
	// Background
	if (logo.background) {
		if (logo.background.image) {
			// bg image here
		} else if (logo.background.color) {
			ctx.fillStyle = logo.background.color
			ctx.fillRect(-256, -256, 512, 512)
		}
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
