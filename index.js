var fs = require('fs');
var path = require('path');
var css = require('css');

var data = {
	'animation': {
		prefixes: ['none', 'webkit']
	},
	'transform': {
		prefixes: ['none', 'webkit', 'ms']
	}
};

var prefixes = [
	'none',
	'ms',
	'moz',
	'webkit',
	'o'
];

var removePrefix = function (str) {
	if (str[0] !== '-') {
		return str;
	}
	var index = str.indexOf('-', 1);
	if (index !== -1) {
		return str.substr(index + 1);
	} else {
		return str;
	}
};

var getPrefix = function (str) {
	if (str[0] !== '-') {
		return 'none';
	}
	var index = str.indexOf('-', 1);
	if (index !== -1) {
		return str.substr(1, index - 1);
	} else {
		return 'none';
	}
};

var path;
if (process.argv[2]) {
	path = process.argv[2];
} else {
	path = path.join(__dirname, '/style.css');
}

var content = fs.readFileSync(path).toString();
var ast = css.parse(content, {
	source: path
});

ast.stylesheet.rules.forEach(function (rule) {
	var toVerify = {};
	var lineNumber = rule.position.start.line;
	if (!rule.declarations) {
		return;
	}
	rule.declarations.forEach(function (declaration) {
		var propertyWithoutPrefix = removePrefix(declaration.property);
		if (data.hasOwnProperty(propertyWithoutPrefix)) {
			var prefix = getPrefix(declaration.property);
			if (data[propertyWithoutPrefix].prefixes.indexOf(prefix) !== -1) {
				if (!toVerify.hasOwnProperty(propertyWithoutPrefix)) {
					toVerify[propertyWithoutPrefix] = {};
					data[propertyWithoutPrefix].prefixes.forEach(function (pref) {
						toVerify[propertyWithoutPrefix][pref] = false;
					});
				}
				toVerify[propertyWithoutPrefix][prefix] = true;
			}
		}
	});

	Object.keys(toVerify).forEach(function (property) {
		Object.keys(toVerify[property]).forEach(function (prefix) {
			if (!toVerify[property][prefix]) {
				if (prefix === 'none') {
					console.log(path + ' (' + lineNumber + ') missing ' + property);
				} else {
					console.log(path + ' (' + lineNumber + ') missing -' + prefix + '-' + property);
				}
			}
		});
	});
});
