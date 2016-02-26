var cheerio = require('cheerio')
var _ = require('lodash')
var request = require('request')
var async = require('async')
var Fitting = require('../')
var exec = require('child_process').exec

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

var fitting = new Fitting(points)

// https://lantouzi.com/bianxianjihua/index?page=1&size=14&tag=1&dir=1&order=0
// https://lantouzi.com/bianxianjihua/index?page=2&size=14&tag=1&dir=1&order=0

var pages = [1, 2, 3].slice()

var arr = []

async.map(pages, function(page, cb) {
	var url = 'https://lantouzi.com/bianxianjihua/index?page=' + page + '&size=34&tag=1&dir=1&order=0'
	// var url = 'https://lantouzi.com/bianxianjihua/index?page=1&size=34&tag=1&dir=1&order=0'
	request(url, {
		headers: {}
	}, function(err, res, body) {
		if (body) {
			// console.log(res.headers, body)
			var $ = cheerio.load(body)
			var projects = $('.project-info')
			_.each(projects, function(project) {
				var $project = $(project)
				var lixi = $project.find('.info-one .info-num em').text()
				var days = $project.find('.info-two .info-num em').text()
				var moneyLeft = $project.find('.info-three .info-num em').text().replace(/,/g, '')
				var link = $project.find('.info-four a').attr('href')
				arr.push({
					lixi: parseFloat(lixi),
					days: parseInt(days),
					moneyLeft: parseFloat(moneyLeft),
					link: link
				})
			})
		} else {
			console.log(err)
		}
		cb(null, null)
	})
}, function() {
	getScore(arr)
})

function getScore(arr) {
	arr = _.uniq(arr, function(item) {
		return item.link
	}).filter(function(item) {
		// 太少的不要
		return item.moneyLeft > 5000
	})

	_.each(arr, function(item) {
		var y = fitting.getYByX(item.days)
		var score = item.lixi - y
		item.y = y
		if (item.lixi < 11) {
			// 利息太低
			score -= 0.05
		}
		if (item.moneyLeft < 8000) {
			// 份额太少
			score -= 0.1
		}
		if (item.days > 250) {
			// 时间太长
			score -= 0.1
		}
		item.score = score
	})


	arr.sort(function(a, b) {
		return b.score - a.score
	})

	console.log(arr)

	notify(arr)
}

function notify(arr) {
	arr = arr.filter(function(item) {
		if (item.score > 0.8) {
			return true
		}
	})

	console.log('selected', arr)

	if (arr.length) {
		console.log('send mail')
		var content = 'ok, 内容如下：\n\n' + JSON.stringify(arr, 0, 4)
		var title = 'lantouzi 标的建议'
		var cmd = 'echo \'' + content + '\' | mail -s "' + title + '" ' + process.env.MAIL_ADDR
		console.log(cmd)
		exec(cmd)
	}
}


