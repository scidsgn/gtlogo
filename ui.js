var studioLogoObject = {
	background: {
		color: "#fff"
	},
	content: {
		core: {
			radius: 170,
			color: "#000",
			logo: {
				radius: 130,
				image: null
			}
		},
		segmentSets: []
	},
	star: {
		style: "traditional",
		items: []
	}
}

function addStar() {
	var star = {
		position: 1,
		rotation: 0,
		points: 16,
		spacing: 0,
		colors: ["#808080"]
	}
	
	studioLogoObject.star.items.push(star)
	
	var section = document.createElement("section")
	section.starObject = star
	
	var buttons = document.createElement("div")
	buttons.classList.add("sectionButtons")
	
	var removeStar = document.createElement("button")
	removeStar.innerText = "Remove star"
	removeStar.addEventListener("click", function() {
		var star = this.parentNode.parentNode.starObject
		studioLogoObject.star.items.splice(studioLogoObject.star.items.indexOf(star), 1)
		
		this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)
		renderLogo(studioLogoObject)
	})
	buttons.appendChild(removeStar)
	
	section.appendChild(buttons)
	
	createRangeOption(star, "points", 16, 2, 32, "Points:", section)
	createRangeOption(star, "position", 1, 0, 1, "Scale:", section, 0.05)
	createRangeOption(star, "rotation", 0, 0, 359, "Rotation [°]:", section)
	createRangeOption(star, "spacing", 0, 0, 16, "Spacing [°]:", section)
	createColorOption(star.colors, 0, "#808080", "Color:", section)
	
	document.querySelector("aside[data-tab=star]").appendChild(section)
	
	renderLogo(studioLogoObject)
}

function addSegmentSet() {
	var segmentSet = {
		style: "traditional",
		spacing: 16,
		phase: 0,
		segments: []
	}
	
	studioLogoObject.content.segmentSets.push(segmentSet)
	
	var section = document.createElement("section")
	section.segmentObject = segmentSet
	
	var buttons = document.createElement("div")
	buttons.classList.add("sectionButtons")
	
	var addSeg = document.createElement("button")
	addSeg.innerText = "Add seg."
	addSeg.addEventListener("click", function() {
		var segment = {
			outerRadius: 154,
			innerRadius: 122,
			color: "#444444"
		}
		
		this.parentNode.parentNode.segmentObject.segments.push(segment)
		
		var section = document.createElement("section")
		section.segmentObject = segment
		section.segmentSetObject = this.parentNode.parentNode.segmentObject
		
		var removeSeg = document.createElement("button")
		removeSeg.innerText = "Remove segment"
		removeSeg.addEventListener("click", function() {
			var seg = this.parentNode.segmentObject
			var segSet = this.parentNode.segmentSetObject
			segSet.segments.splice(segSet.segments.indexOf(seg), 1)
			
			this.parentNode.parentNode.removeChild(this.parentNode)
			renderLogo(studioLogoObject)
		})
		section.appendChild(removeSeg)
		
		var adjustAll = document.createElement("button")
		adjustAll.innerText = "Adjust all"
		adjustAll.addEventListener("click", function() {
			var outerRadius = this.parentNode.querySelector("[data-control=outerRadius]").value
			var innerRadius = this.parentNode.querySelector("[data-control=innerRadius]").value
			
			this.parentNode.parentNode.querySelectorAll("[data-control=outerRadius]").forEach(c => {
				c.value = outerRadius
				c.dispatchEvent(new Event("input"))
			})
			
			this.parentNode.parentNode.querySelectorAll("[data-control=innerRadius]").forEach(c => {
				c.value = innerRadius
				c.dispatchEvent(new Event("input"))
			})
		})
		section.appendChild(adjustAll)
		
		createRangeOption(segment, "outerRadius", 154, 32, 256, "Outer radius [px]:", section)
		createRangeOption(segment, "innerRadius", 122, 32, 256, "Inner radius [px]:", section)
		createColorOption(segment, "color", "#444444", "Color:", section)
		
		this.parentNode.parentNode.appendChild(section)
		
		renderLogo(studioLogoObject)
	})
	buttons.appendChild(addSeg)
	
	var removeSet = document.createElement("button")
	removeSet.innerText = "Remove set"
	removeSet.addEventListener("click", function() {
		var segSet = this.parentNode.parentNode.segmentObject
		studioLogoObject.content.segmentSets.splice(studioLogoObject.content.segmentSets.indexOf(segSet), 1)
		
		this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)
		renderLogo(studioLogoObject)
	})
	buttons.appendChild(removeSet)
	
	createRangeOption(segmentSet, "spacing", 16, 0, 32, "Spacing [px]:", section)
	createRangeOption(segmentSet, "phase", 0, 0, 359, "Rotation [°]:", section)
	
	section.appendChild(buttons)
	
	document.querySelector("aside[data-tab=segments]").appendChild(section)
	
	renderLogo(studioLogoObject)
}

function createRangeOption(object, key, value, min, max, text, element, step) {
	var control = document.createElement("div")
	control.classList.add("control")
	control.classList.add("rangeControl")
	
	control.controlledObject = object
	control.controlledObjectKey = key
	
	var label = document.createElement("label")
	label.innerText = text
	control.appendChild(label)
	
	var range = document.createElement("input")
	range.setAttribute("data-control", key)
	range.type = "range"
	range.min = min
	range.max = max
	range.value = value
	if (step) range.step = step
	control.appendChild(range)
	
	range.addEventListener("input", function() {
		this.parentNode.children[2].value = this.value
		this.parentNode.controlledObject[this.parentNode.controlledObjectKey] = +this.value
		renderLogo(studioLogoObject)
	})
	
	var number = document.createElement("input")
	number.type = "number"
	number.min = min
	number.max = max
	number.value = value
	if (step) number.step = step
	control.appendChild(number)
	
	number.addEventListener("input", function() {
		this.parentNode.children[1].value = this.value
		this.parentNode.controlledObject[this.parentNode.controlledObjectKey] = +this.value
		renderLogo(studioLogoObject)
	})
	
	element.appendChild(control)
}

function createColorOption(object, key, value, text, element) {
	var control = document.createElement("div")
	control.classList.add("control")
	control.classList.add("colorControl")
	
	control.controlledObject = object
	control.controlledObjectKey = key
	
	var label = document.createElement("label")
	label.innerText = text
	control.appendChild(label)
	
	var color = document.createElement("input")
	color.setAttribute("data-control", key)
	color.type = "color"
	color.value = value
	control.appendChild(color)
	
	color.addEventListener("input", function() {
		this.parentNode.controlledObject[this.parentNode.controlledObjectKey] = this.value
		renderLogo(studioLogoObject)
	})
	
	element.appendChild(control)
}

function createFileOption(object, key, text, element) {
	var control = document.createElement("div")
	control.classList.add("control")
	control.classList.add("imageControl")
	
	control.controlledObject = object
	control.controlledObjectKey = key
	
	var label = document.createElement("label")
	label.innerText = text
	control.appendChild(label)
	
	var file = document.createElement("input")
	file.type = "file"
	control.appendChild(file)
	
	file.addEventListener("input", function() {
		if (this.files.length) {
			var image = new Image()
			image.setAttribute('crossOrigin', 'anonymous');
			
			image.onload = () => {
				this.parentNode.controlledObject[this.parentNode.controlledObjectKey] = image
				renderLogo(studioLogoObject)
			}
			
			image.src = URL.createObjectURL(this.files[0])
		}
	})
	
	element.appendChild(control)
}

// BG options
createColorOption(studioLogoObject.background, "color", "#FFFFFF", "Color:", document.querySelector("#gtBackgroundOptions"))

// Shape options
createColorOption(studioLogoObject.content.core, "color", "#000000", "Color:", document.querySelector("#gtShapeOptions"))
createRangeOption(studioLogoObject.content.core, "radius", 170, 100, 256, "Radius [px]:", document.querySelector("#gtShapeOptions"))

// Logo options
createFileOption(studioLogoObject.content.core.logo, "image", "Logo image:", document.querySelector("#gtLogoOptions"))
createRangeOption(studioLogoObject.content.core.logo, "radius", 130, 50, 256, "Size [px]:", document.querySelector("#gtLogoOptions"))

// UI tabs
document.querySelectorAll("nav div").forEach(t => {
	t.addEventListener("click", function() {
		var tab = this.getAttribute("data-tab")
		
		document.querySelector("aside.visible").classList.remove("visible")
		document.querySelector("aside[data-tab=" + tab + "]").classList.add("visible")
		
		document.querySelector("nav div.visible").classList.remove("visible")
		t.classList.add("visible")
	})
})

document.querySelector("#gtAddStar").addEventListener("click", function() {
	addStar()
})

document.querySelector("#gtAddSegment").addEventListener("click", function() {
	addSegmentSet()
})

document.querySelector(".export").addEventListener("click", function() {
	var url = document.querySelector("#preview").toDataURL("image/png");
	var a = document.createElement("a");

	a.setAttribute("href", url);
	a.setAttribute("download", "gtlogo.png");
	a.click();
})