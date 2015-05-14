import Mote from './client/components/Mote';
import Flux from 'flux';

var dispatcher = Flux.dispatcher;
var socket = io();
var canvas, ctx, player;


var update = function() {};

var clear = function() {};

var render = function() {
	clear();
};

var gameLoop = function() {
	update();
	render();
	window.requestAnimationFrame(gameLoop);
};

var startGame = function() {
	window.requestAnimationFrame(gameLoop);
};

window.addEventListener('keydown', function(e) {
	socket.emit('keypress', e.keyCode);
});

window.addEventListener('load', function(e) {
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext();
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;

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

			//startGame();
		});
	});
});
