// 根据基准利率得出公式，并按此给变现计划打分

// 3 9.5, 6 10.5, 9 11.5, 12 12

var _ = require('min-util')

module.exports = Fitting

var proto = Fitting.prototype

function Fitting(points) {
	var arr = polyfit(points)

	var getYByX = function(x) {
		var ret = arr.join('')
		var func = new Function('x', 'return ' + ret)
		return func
	}()

	this.getYByX = getYByX
}

function polyfit(userInput) {
	// copy from web
	var returnResult = [];
	inputMatrix = [];
	var n = userInput.length;
	for (var i = 0; i < n; i++) {
		var tempArr = [];
		for (var j = 0; j < n; j++) {
			tempArr.push(Math.pow(userInput[i].x, n - j - 1));
		}
		tempArr.push(userInput[i].y);
		inputMatrix.push(tempArr);
	}
	for (var i = 0; i < n; i++) {
		var base = inputMatrix[i][i];
		for (var j = 0; j < n + 1; j++) {
			if (base == 0) {
				//存在相同x不同y的点，无法使用多项式进行拟合
				return false;
			}
			inputMatrix[i][j] = inputMatrix[i][j] / base;
		}
		for (var j = 0; j < n; j++) {
			if (i != j) {
				var baseInner = inputMatrix[j][i];
				for (var k = 0; k < n + 1; k++) {
					inputMatrix[j][k] = inputMatrix[j][k] - baseInner * inputMatrix[i][k];
				}
			}
		}
	}
	for (var i = 0; i < n; i++) {
		if (inputMatrix[i][n] > 0) {
			returnResult.push('+');
		}
		
		if (inputMatrix[i][n] != 0) {
			var tmp_x = '';
			for (var j = 0; j < n - 1 - i; j++) {
				tmp_x = tmp_x + "*x";
			}
			returnResult.push((inputMatrix[i][n] + tmp_x));
		}
	}
	return returnResult;
}

