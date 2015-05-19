export default class Point {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	distanceFrom(otherPoint) {
		var dist = Math.sqrt(
			Math.pow(otherPoint.x - this.x, 2) +
			Math.pow(otherPoint.y - this.y, 2) +
			Math.pow(otherPoint.z - this.z, 2)
		);

		return dist;
	}
};
