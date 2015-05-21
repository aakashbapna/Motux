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
	socket.emit('added', _players);

	socket.on('disconnect', function() {
		console.log('user disconnected', socket.conn.id);
		delete _players[socket.conn.id];
		socket.broadcast.emit('destroyed', {
			id: socket.conn.id,
			reason: 'disconnected'
		});
	});

	socket.on('move', function(data){
		socket.broadcast.emit('move', data);
		_players[socket.conn.id] = data;
	});

	socket.on('added', function(mote) {
		console.log("player ready", socket.conn.id);
		_players[mote.id] = mote;

		socket.broadcast.emit('added', mote);
	});

	socket.on('destroyed', function(obj) {
		delete _players[obj.id];
		socket.broadcast.emit('destroyed', {
			id: obj.id,
			reason: 'eaten',
			actor: obj.actor
		});
	});
});

var addMote = function() {
	var rndMote = {
		size: Math.floor(Math.random() * 25 + 5),
		id: "npc" + Math.floor(Math.random() * 10000),
		x: Math.floor(Math.random() * 2000),
		y: Math.floor(Math.random() * 2000),
		z: 0,
		isNPC: true
	};

	if(Object.keys(_players).length < 20) {
		_players[rndMote.id] = rndMote;

		console.log("npc added", rndMote);
		io.emit('added', rndMote);
	}
};

http.listen(port, function(err) {
	if(err) throw err;
	console.log('Server listening on port ' + port);

	addMote();
	setInterval(addMote, 20000);
});
