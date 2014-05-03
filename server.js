var http = require('http');
var mongoose = require('mongoose');

var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World');
}).listen(8080, '127.0.0.1');

mongoose.connect('mongodb://127.0.0.1:27017/krazyplanes', function(err) {
	if (!err) {
		console.log("connected to mongodb");
	} else {
		throw err;
	}
});

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
c
io.sockets.on('connection', function(socket) {
	onsole.log("connection")
	socket.on('player_send', function(data) {
		console.log("player_send")
		jsonData = JSON.parse(data);
		var player = new Player({
			name: jsonData.name,
			score: jsonData.score,
			fbid: jsonData.fbid
		});
		
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

function isJSONString(string) {
	try {
		JSON.parse(string);
	} catch(e) {
		return false;
	}
	return true;
}