import Point from './Point';
import Vector from './Vector';

export default class Mote {
	constructor(options = {}) {
		this.name = options.name || '';
		this.size = options.size || 20;
		this.pos = new Point(options.x, options.y, options.z);
		this.vel = new Vector(options.velX, options.velY, options.velZ);
	}

	isTouching(otherMote) {
		return this.pos.z == otherMote.pos.z ?
			this.pos.distanceFrom(otherMote.pos) <= 0 : false;
	}

	render(ctx) {

	}
};
