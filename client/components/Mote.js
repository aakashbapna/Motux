import Point from './Point';
import Vector from './Vector';
import MoteActions from '../actions/MoteActions';

export default class Mote {
	constructor(options = {}) {
		this.name = options.name || '';
		this.id = options.id;
		this.size = options.size || 20;
		this.pos = options.pos || new Point(options.x, options.y, options.z);
		this.speed = 10;
		this.isMote = options.isMote;
		this.isNPC = options.isNPC;
		//this.vel = new Vector(options.velX, options.velY, options.velZ);
	}

	isTouching(otherMote) {
		return this.pos.z == otherMote.pos.z ?
			this.pos.distanceFrom(otherMote.pos) <= (this.size + otherMote.size) : false;
	}

	interact(otherMote) {
		if(this.isTouching(otherMote)) {
			if(this.size < otherMote.size) {
				//MoteActions.destroy(this.id);
				//console.log('you got eaten');
				return 'eaten';
			} else if(this.size > otherMote.size) {
				MoteActions.destroy(otherMote.id);
				this.size++;
				return 'ate';
			}
		}

		return false;
	}

	render(ctx) {
		ctx.strokeStyle = 'rgba(0,0,0,0.2)';
		ctx.font="12px Arial";
		ctx.fillStyle = '#000';
		ctx.fillText(this.name, this.pos.x, this.pos.y + 4);
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2*Math.PI);
		ctx.fillStyle = 'rgba(0,0,0,0.2)';
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
	}

	moveLeft() {
		if(this.pos.x > this.size) {
			this.pos.x -= this.speed;
		}
	}
	moveUp() {
		if(this.pos.y > this.size) {
			this.pos.y -= this.speed;
		}
	}
	moveDown() {
		if(this.pos.y < window.innerHeight - this.size) {
			this.pos.y += this.speed;
		}
	}
	moveRight() {
		if(this.pos.x < window.innerWidth - this.size) {
			this.pos.x += this.speed;
		}
	}
};
