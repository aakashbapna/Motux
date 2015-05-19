var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var _players = {};

app.use(express.static('static'));

app.get('/', function(req, res) {
	res.end(fs.readFileSync('index.html'));
});

io.on('connection', function(socket){
	console.log('a user connected', socket.conn.id);
	console.log("current players", _players);
	socket.emit('added', _players);

	socket.on('disconnect', function() {
		console.log('user disconnected', socket.conn.id);
		delete _players[socket.conn.id];
		socket.broadcast.emit('destroyed', socket.conn.id);
	});

	socket.on('move', function(data){
		socket.broadcast.emit('move', data);
		_players[socket.conn.id] = data;
	});

	socket.on('added', function(mote) {
		console.log("player ready", socket.conn.id);
		_players[mote.id] = mote;

		socket.broadcast.emit('added', _players);
	});

	socket.on('destroyed', function(id) {
		delete _players[id];
		socket.broadcast.emit('destroyed', id);
	});
});

http.listen(port, function(err) {
	if(err) throw err;
	console.log('Server listening on port ' + port);

	var rndMote = {
		size: Math.floor(Math.random() * 40),
		id: "npc" + Math.floor(Math.random() * 10000),
		x: Math.floor(Math.random() * 500),
		y: Math.floor(Math.random() * 500),
		z: 0
	};
	//MoteActions.create(rndMote);

	_players[rndMote.id] = (rndMote);
});
