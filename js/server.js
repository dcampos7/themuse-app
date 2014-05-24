// required modules
var http = require('http');
var url = require('url');
var mysql = require('mysql');

// server start function
function start(route, handle) {
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname;

		var connection = mysql.createConnection({
			host     : '68.178.143.4',
			user     : 'themuseapp',
			password : 'Incognito7!',
			database : 'themuseapp'
		});

		route(handle, pathname, request, response, connection);

	}).listen(8125);

	// notify user where server is located
	console.log('Server running at http://127.0.0.1:8125/');
}

// export server start function
exports.start = start;