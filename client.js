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

	player.render(ctx);

	var otherMotes = MoteStore.getAll();
	Object.keys(otherMotes).forEach(function(_moteId) {
		otherMotes[_moteId].render(ctx);
	});
};

var updateGame = function() {
	window.requestAnimationFrame(render);
};

var startGame = function() {
	window.addEventListener('keydown', function(e) {
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
	});

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
				name: name
			});

			document.getElementById('welcome').style.display = 'none';

			startGame();
		});
	});

	socket.on('move', function(otherPlayer) {
		MoteActions.update(otherPlayer.id, otherPlayer);
	});

	socket.on('destroyed', function(otherPlayerId) {
		//console.log("got destroy event for", otherPlayerId);
		MoteActions.destroy(otherPlayerId);
	});

	MoteStore.on('change', function() {
		//console.log("MoteStore change event");
		updateGame();
	});
});
