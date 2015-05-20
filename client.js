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
				if((_mote.isNPC && _mote.size < player.size) || _mote.isMote) {
					var status = player.interact(_mote);
					if (status === 'eaten') {
						alert("You got eaten by " + _mote.name + "!");
						MoteActions.destroy(player.id);
						window.removeEventListener('keydown', keyHandler);
						socket.emit('destroyed', {
							id: player.id,
							actor: _mote
						});
						player = null;
					} else if (status === 'ate') {
						console.log("you ate", _mote.name || _mote.id);
						MoteActions.destroy(_moteId);
						socket.emit('destroyed', {
							id: _moteId,
							actor: player
						});
					}
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

var touchHandler = function(e) {
	e.preventDefault();
	var point;
	if(e.touches) { point=e.touches[0]; }
	if(e.clientX) { point=e; }

	if(point.clientX < player.pos.x) {
		player.moveLeft();
	}
	if(point.clientX > player.pos.x) {
		player.moveRight();
	}
	if(point.clientY < player.pos.y) {
		player.moveUp();
	}
	if(point.clientY > player.pos.y) {
		player.moveDown();
	}

	updateGame();
	socket.emit('move', player);
};

var movingTimer;

var startMoving = function(e) {
	touchHandler(e);
	movingTimer = setInterval(touchHandler.bind(null, e), 100);
};

var stopMoving = function(e) {
	clearInterval(movingTimer);
};

var touchMoved = function(e) {
	console.log(e.touches[0].clientX, e.touches[0].clientY);
	stopMoving();
	startMoving(e);
};

var startGame = function() {
	window.addEventListener('keydown', keyHandler);
	window.addEventListener('touchstart', startMoving);
	window.addEventListener('touchend', stopMoving);
	window.addEventListener('touchmove', touchMoved);
	//window.addEventListener('mousedown', touchHandler);

	updateGame();
};

window.addEventListener('load', function() {
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

			if(name.length < 3 || name.length > 15) {
				alert('Name should be between 3 and 15 characters long');
				return false;
			}
			if(!/^[a-zA-Z0-9\-_]*$/.test(name)) {
				alert('Name can only be alphanum with - or _');
				return false;
			}

			var generateNewPlayer = function() {
				player = new Mote({
					id: socket.id,
					name: name,
					x: Math.random() * (window.innerWidth - 200) + 200,
					y: Math.random() * (window.innerHeight - 200) + 200,
					z: 0,
					isMote: true
				});

				var otherMotes = MoteStore.getAll();
				Object.keys(otherMotes).forEach(function(_moteId) {
					var _mote = otherMotes[_moteId];
					if(_mote && player.interact(_mote)) {
						generateNewPlayer();
					}
				});
			};

			generateNewPlayer();

			console.log('you are at', player.pos);

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
		if(otherPlayerDetails.isNPC) {
			//console.log("player joined", otherPlayerDetails);
			MoteActions.create(otherPlayerDetails);
		} else {
			//console.log("got players", otherPlayerDetails);
			if(otherPlayerDetails.isMote) {
				MoteActions.create(otherPlayerDetails);
			} else {
				Object.keys(otherPlayerDetails).forEach(function (id) {
					if (!player || id != player.id) {
						MoteActions.create(otherPlayerDetails[id]);
					}
				});
			}
		}

		updateGame();
	});

	socket.on('destroyed', function(obj) {
		if(player && obj.id == player.id) {
			alert("You got eaten by " + obj.actor.name + "!");
			player = null;
			updateGame();
		}
		//console.log("got destroy event for", otherPlayerId);
		MoteActions.destroy(obj.id);
	});

	MoteStore.on('change', function() {
		//console.log("MoteStore change event");
		updateGame();
	});
});
