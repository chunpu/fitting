var cheerio = require('cheerio')
var _ = require('lodash')
var request = require('request')
var async = require('async')

// https://lantouzi.com/bianxianjihua/index?page=1&size=14&tag=1&dir=1&order=0
// https://lantouzi.com/bianxianjihua/index?page=2&size=14&tag=1&dir=1&order=0

var pages = [1, 2, 3].slice()

var arr = []

async.map(pages, function(page, cb) {
	// var url = 'https://lantouzi.com/bianxianjihua/index?page=' + page + '&size=34&tag=1&dir=1&order=0'
	var url = 'https://lantouzi.com/bianxianjihua/index?page=1&size=34&tag=1&dir=1&order=0'
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
				var moneyLeft = $project.find('.info-three .info-num em').text()
				var link = $project.find('.info-four a').attr('href')
				arr.push({
					lixi: parseFloat(lixi) / 100,
					days: parseInt(days),
					moneyLeft: parseFloat(moneyLeft),
					link: link
				})
			})
		}
		cb(null, null)
	})
}, function() {
	console.log(1111, arr)
})
