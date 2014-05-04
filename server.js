var http = require('http');
var mongoose = require('mongoose');

var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Krazy Planes Server'); // For testing purpose
}).listen(8080, '192.237.247.72'); //192.237.247.72

// Connect to our database
mongoose.connect('mongodb://127.0.0.1:27017/krazyplanes', function(err) {
	if (!err) {
		console.log("connected to mongodb");
	} else {
		throw err;
	}
});

// Restricted to object scope
/*
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {	
})
*/

var PlayerSchema = mongoose.Schema({
	name: String,
	score: Number,
	fbid: Number
});

var Player = mongoose.model('Player', PlayerSchema);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	console.log("connection") // Indicated connection is established with client
	socket.on('player_send', function(data) {
		console.log("player_send")
		jsonData = JSON.parse(data);
		var player = new Player({
			name: jsonData.name,
			score: jsonData.score,
			fbid: jsonData.fbid
		});
		
		// Search for the document which is matched with the field
		Player.findOne({ 'fbid': player.fbid }, function(err, foundPlayer) {
			if (foundPlayer !== null) {
				if (foundPlayer.score < player.score) {
					foundPlayer.score = player.score;
					console.log("Resaved")
					foundPlayer.save(function(err, foundPlayer) {
						if (err) {
							return console.error(err);
						}
					});
				}
			} else {
				console.log("Saved")
				player.save(function(err, player) {
					if (err) {
						return console.error(err);
					}
				});
			}
		});
	})
});

// Check if the string a valid json object
function isJSONString(string) {
	try {
		JSON.parse(string);
	} catch(e) {
		return false;
	}
	return true;
}