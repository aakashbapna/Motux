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
				console.log('you got eaten');
				return 'eaten';
			} else if(this.size > otherMote.size) {
				MoteActions.destroy(otherMote.id);
				this.size++;
				return 'ate';
			}
		}
	}

	render(ctx) {
		ctx.strokeStyle = '#003300';
		ctx.font="12px Arial";
		ctx.fillText(this.name, this.pos.x, this.pos.y);
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2*Math.PI);
		ctx.closePath();
		ctx.stroke();
	}

	isMote() {
		return true;
	}

	moveLeft() {
		this.pos.x -= this.speed;
	}
	moveUp() {
		this.pos.y -= this.speed;
	}
	moveDown() {
		this.pos.y += this.speed;
	}
	moveRight() {
		this.pos.x += this.speed;
	}
};
