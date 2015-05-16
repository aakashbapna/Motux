var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'));

app.get('/', function(req, res) {
	res.end(fs.readFileSync('index.html'));
});

io.on('connection', function(socket){
	console.log('a user connected', socket.conn.id);

	socket.on('disconnect', function(){
		console.log('user disconnected', socket.conn.id);
		socket.broadcast.emit('destroyed', socket.conn.id);
	});

	socket.on('move', function(data){
		//socket.emit('move', data);
		socket.broadcast.emit('move', data);
	});
});

http.listen(3000, function(err) {
	if(err) throw err;
	console.log('Express server listening on port - ' + 3000);
});
