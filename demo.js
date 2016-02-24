var Fitting = require('./')

var points = `
3,9.5
6,10.5
9,11.5
12,12
`

points = points.trim().split('\n').map(function(line) {
	var arr = line.split(',')
	return {
		x: ~~arr[0] * 30,
		y: ~~arr[1] + 0.5
	}
})

console.log(points)

var fitting = new Fitting(points)

var ret = fitting.getYByX(200)
console.log(ret)
