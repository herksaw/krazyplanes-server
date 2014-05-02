var http = require('http');
var mongoose = require('mongoose');

var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World');
}).listen(8080, '192.237.247.72');

mongoose.connect('mongodb://192.237.247.72/krazyplanes', function(err) {
	if (!err) {
		console.log("connected to mongodb");
	} else {
		throw err;
	}
});

var PlayerSchema = mongoose.Schema({
	name: String,
	score: Number,
	id: Number
});

var Player = mongoose.model('Player', PlayerSchema);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	socket.on('player_send', function(data) {
		jsonData = JSON.parse(data);
		var player = new Player({
			name: jsonData.name,
			score: jsonData.score,
			id: data.id
		});

		Player.findOne({ 'id': player.id }, function(err, foundPlayer) {
			if (!err) {
				if (foundPlayer.score < player.score) {
					foundPlayer.score = player.score;
					foundPlayer.save(function(err, foundPlayer) {
						if (err) {
							return console.error(err);
						}
					});
				}
			} else {
				player.save(function(err, player) {
					if (err) {
						return console.error(err);
					}
				});
			}
		});
	})
});

function isJSONString(string) {
	try {
		JSON.parse(string);
	} catch(e) {
		return false;
	}
	return true;
}