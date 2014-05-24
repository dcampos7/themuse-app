// required modules
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');


// generate home page
function home(request, response, connection) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write(fs.readFileSync('./templates/index.html'));
	response.end();
}

function locations(request, response, connection) {
	connection.query('SELECT google_city, muse_city, lat, lng FROM locations', function (err, rows) {

		if (err) throw err;

		json = '[';
		rows.forEach(function(row) {
			json += '{' + '"google_city": "' + row.google_city + '", "muse_city": "' + row.muse_city + '", "lat": ' + row.lat + ', "lng": ' + row.lng + '},'
		});
		json = json.substring(0, json.length-1) + ']';

		response.write(json);
		response.end();

		connection.end();
	});
}

function jobs(request, response, connection) {
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;

	var options = {
		host: 'www.themuse.com',
		path: '/api/v1/jobs?page='+query.page+'&job_location='+query.city.replace(/,/g,"%2C").replace(/ /g,"+")
	}

	// this actually sends the request and returns the data
	var req = https.request(options, function (res) {
		var data = '';
	    res.on('data', function (chunk) {
	        data += chunk;
	    });
	    res.on('end', function () {
	    	json = JSON.parse(data);

	    	output = '{"page_count": '+ String(json.page_count-1) +', "jobs": [';
			json.results.forEach(function(job) {
				locations = categories = '[';
				job.locations.forEach(function(d) {
					locations += '"' + String(d) + '",';
				});
				job.categories.forEach(function(d) {
					categories += '"' + String(d) + '",';
				});
				locations = locations.substring(0, locations.length-1) + ']';
				categories = categories.substring(0, categories.length-1) + ']';
				output += '{"title": "' + job.title + '", "company_name": "' + job.company_name + '", "company_snapshot": "' + job.company_small_f1_image + '", "categories": ' + categories + ', "apply_link": "' + job.apply_link + '", "locations": ' + locations + ', "posted": "' + job.creation_date + '"},'
			});
			output = output.substring(0, output.length-1) + ']}';
			
			response.write(output);
			response.end();
	    });
	});

	// check and report errors
	req.on('error', function (e) {
	    console.log(e.message);
	});
	req.end();
}


// load page (encode cities)
function updateCities(request, response, connection) {
	var google_cities = ['Allentown, PA', 'Atlanta, GA', 'Auckland, NZ', 'Austin, TX', 'Baltimore, MD', 'Basking Ridge, NJ', 'Bedminster, NJ', 'Biloxi, MS', 'Birmingham, AL', 'Birmingham, MI', 'Bismarck, ND', 'Boston, MA', 'Boulder, CO', 'Bozeman, MT', 'Bridgeport, CT', 'Charleston, SC', 'Charlotte, NC', 'Chevy Chase, MD', 'Chicago, IL', 'Cleveland, OH', 'Coffeyville, KS', 'Dallas/Ft. Worth, TX', 'Denver, CO', 'Detroit, MI', 'Dodge City, KS', 'Dublin, IE', 'Eau Claire, WI', 'Fort Wayne, IN', 'Fort Worth, TX', 'Grand Rapids, MI', 'Honolulu, HI', 'Houston, TX', 'Hunt Valley, MD', 'Indianapolis, IN', 'Kampala, UG', 'Kansas City, MO', 'Lancaster, PA', 'Landover, MD', 'Las Vegas, NV', 'Lausanne, CH', 'Lilongwe, MW', 'Lima, Peru', 'Lincoln, NE', 'Little Rock, AR', 'London, UK', 'Los Angeles, CA', 'Madrid, ES', 'Melbourne, AU', 'Miami, FL', 'Milwaukee, WI', 'Minneapolis, MN', 'Mountain Side, NJ', 'Munich, DE', 'Nashua, NH', 'Nashville, TN', 'New Berlin, WI', 'New Haven, CT', 'New Orleans, LA', 'New York City, NY', 'Orange County, CA', 'Orlando, FL', 'Ottawa, Canada', 'Palm Beach, FL', 'Paris, FR', 'Parkersburg, WV', 'Pensacola, FL', 'Philadelphia, PA', 'Phoenix, AZ', 'Piscataway, NJ', 'Pittsburgh, PA', 'Portland, OR', 'Providence, RI', 'Raleigh, NC', 'Richmond, VA', 'Rochester, NY', 'Sacramento, CA', 'Saint Louis, MO', 'San Antonio, TX', 'San Diego, CA', 'San Francisco, CA', 'Sao Paolo, BR', 'Seattle, WA', 'Secaucus, NJ', 'Silicon Valley, CA', 'Sydney, AU', 'Tokyo, Japan', 'Toronto, CAN', 'Traverse City, MI', 'Tucson, AZ', 'Vancouver, CAN', 'Washington DC', 'Wellington, NZ', 'Wilmington, DE'];
	var muse_cities = ['Allentown, PA', 'Atlanta, GA', 'Auckland, NZ', 'Austin, TX', 'Baltimore, MD', 'Basking Ridge, NJ', 'Bedminster, NJ', 'Biloxi, MS', 'Birmingham, AL', 'Birmingham, MI', 'Bismarck, ND', 'Boston, MA', 'Boulder, CO', 'Bozeman, MT', 'Bridgeport, CT', 'Charleston, SC', 'Charlotte, NC', 'Chevy Chase, MD', 'Chicago, IL', 'Cleveland, OH', 'Coffeyville, KS', 'Dallas/Ft. Worth, TX', 'Denver, CO', 'Detroit, MI', 'Dodge City, KS', 'Dublin, IE', 'Eau Claire, WI', 'Fort Wayne, IN', 'Fort Worth, TX', 'Grand Rapids, MI', 'Honolulu, HI', 'Houston, TX', 'Hunt Valley, MD', 'Indianapolis, IN', 'Kampala, UG', 'Kansas City, MO', 'Lancaster, PA', 'Landover, MD', 'Las Vegas, NV', 'Lausanne, CH', 'Lilongwe, MW', 'Lima, Peru', 'Lincoln, NE', 'Little Rock, AR', 'London, UK', 'Los Angeles, CA', 'Madrid, ES', 'Melbourne, AU', 'Miami, FL', 'Milwaukee, WI', 'Minneapolis, MN', 'Mountain Side, NJ', 'Munich, DE', 'Nashua, NH', 'Nashville, TN', 'New Berlin, WI', 'New Haven, CT', 'New Orleans, LA', 'New York City Metro Area', 'Orange County, CA', 'Orlando, FL', 'Ottawa, Canada', 'Palm Beach, FL', 'Paris, FR', 'Parkersburg, WV', 'Pensacola, FL', 'Philadelphia, PA', 'Phoenix, AZ', 'Piscataway, NJ', 'Pittsburgh, PA', 'Portland, OR', 'Providence, RI', 'Raleigh, NC', 'Richmond, VA', 'Rochester, NY', 'Sacramento Metro Area', 'Saint Louis, MO', 'San Antonio Metro Area', 'San Diego, CA', 'San Francisco, CA', 'Sao Paolo, BR', 'Seattle, WA', 'Secaucus, NJ', 'Silicon Valley, CA', 'Sydney, AU', 'Tokyo, Japan', 'Toronto, CAN', 'Traverse City, MI', 'Tucson, AZ', 'Vancouver, CAN', 'Washington DC Metro Area', 'Wellington, NZ', 'Wilmington, DE'];
	var len = google_cities.length;

	function encodeCities(i) {
		connection.query('SELECT google_city, muse_city, lat, lng FROM locations WHERE google_city="'+google_cities[i]+'"', function (err, rows) {

		    if (err) throw err;

		    if (rows.length == 0) {
		    	var options = {
					host: 'maps.googleapis.com',
					path: '/maps/api/geocode/json?address='+google_cities[i].replace(/ /g,"+")+'&sensor=true'
				}

				// this actually sends the request and returns the data
				var req = http.request(options, function (res) {
				    var data = '';
				    res.on('data', function (chunk) {
				        data += chunk;
				    });
				    res.on('end', function () {

				        var json = JSON.parse(data);	 
				        var lat = json.results[0].geometry.location.lat;
		        		var lng = json.results[0].geometry.location.lng;

				    	connection.query('INSERT INTO locations (google_city, muse_city, lat, lng) VALUES ("'+google_cities[i]+'","'+muse_cities[i]+'","'+lat+'","'+lng+'")', function (err, rows) {
				    		if (err) throw err;
				    	});

				    	if (i < len-1)
			    			encodeCities(i+1);
			    		else {
			    			response.write("Loading of cities complete. Database up to date.");
							response.end();
			    		}
				    });
				});

				// check and report errors
				req.on('error', function (e) {
				    console.log(e.message);
				});
				req.end();
		    } 
		    else {
		    	if (i < len-1)
			    	encodeCities(i+1);
			    else {
			    	response.write("Loading of cities complete. Database up to date.");
			    	response.end();
			    }
		    }

		    connection.end();
		});
	}

	encodeCities(0);
}


// load the extras
function bits(request, response, pathname) {
	response.write(fs.readFileSync('.'+pathname));
	response.end();
}



// export home, send, success, history and load functions
exports.home = home;
exports.locations = locations;
exports.jobs = jobs;
exports.updateCities = updateCities;
exports.bits = bits;
