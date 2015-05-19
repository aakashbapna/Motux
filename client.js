import Mote from './client/components/Mote';
import MoteStore from './client/stores/MoteStore';
import MoteActions from './client/actions/MoteActions';

var socket = io();
var canvas, ctx, player;

var clear = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height );
};

var render = function() {
	clear();

	player && player.render(ctx);
	var otherMotes = MoteStore.getAll();
	//console.log("other players", otherMotes);
	Object.keys(otherMotes).forEach(function(_moteId) {
		var _mote = otherMotes[_moteId];
		if(_mote) {
			_mote.render(ctx);

			if(player) {
				var status = player.interact(_mote);
				if(status === 'eaten') {
					MoteActions.destroy(player.id);
					window.removeEventListener('keydown', keyHandler);
					socket.emit('destroyed', player.id);
					player = null;
				} else if(status === 'ate') {
					console.log("you ate someone");
					MoteActions.destroy(_moteId);
					socket.emit('destroyed', _moteId);
				}
			}
		}
	});
};

var updateGame = function() {
	window.requestAnimationFrame(render);
};

var keyHandler = function(e) {
	switch(e.keyCode) {
		case 37:
			player.moveLeft();
			break;
		case 38:
			player.moveUp();
			break;
		case 39:
			player.moveRight();
			break;
		case 40:
			player.moveDown();
			break;
		default:
			break;
	}


	if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
		updateGame();
		socket.emit('move', player);
	}
};

var startGame = function() {
	window.addEventListener('keydown', keyHandler);

	updateGame();
};

window.addEventListener('load', function(e) {
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	canvas.height = window.innerHeight - 5;
	canvas.width = window.innerWidth - 5;

	socket.on('connect', function() {
		document.forms.welcomeForm.inputName.value = socket.id.substr(0,3);
		document.getElementById('welcome').style.display = 'flex';

		document.forms.welcomeForm.addEventListener('submit', function(e) {
			e.preventDefault();
			var name = document.forms.welcomeForm.inputName.value;

			player = new Mote({
				id: socket.id,
				name: name,
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				z: 0
			});

			socket.emit('added', player);

			document.getElementById('welcome').style.display = 'none';

			startGame();
		});
	});

	socket.on('move', function(otherPlayer) {
		//console.log('player moved', otherPlayer.id);
		MoteActions.update(otherPlayer.id, otherPlayer);
	});

	socket.on('added', function(otherPlayerDetails) {
		//console.log("got players", otherPlayerDetails);

		Object.keys(otherPlayerDetails).forEach(function(id) {
			if(!player || id != player.id) {
				if (otherPlayerDetails[id].isMote) {
					MoteActions.add(otherPlayerDetails[id]);
				} else {
					MoteActions.create(otherPlayerDetails[id]);
				}
			}
		});

		updateGame();
	});

	socket.on('destroyed', function(otherPlayerId) {
		if(otherPlayerId == player.id) {
			console.log("you got eaten!");
			player = null;
			updateGame();
		}
		//console.log("got destroy event for", otherPlayerId);
		MoteActions.destroy(otherPlayerId);
	});

	MoteStore.on('change', function() {
		//console.log("MoteStore change event");
		updateGame();
	});
});
