// required modules
var server = require("./js/server");
var router = require("./js/router");
var handlers = require("./js/handlers");

// direct url to the right spot
var handle = {
	"/": handlers.home,
	"/locations": handlers.locations,
	"/jobs": handlers.jobs,
	"/update": handlers.updateCities,
	"bits": handlers.bits
}

// start server
server.start(router.route, handle);