export type Point = { x: number; y: number };
export type Vector = Point;
export type ObjectRecord = {
	type: string;

	point: Point;
	vector: Vector;

	heading: Vector;
	spin: number;

	mass: number;
	update: Function;
	complete: Function;
};

export const G = 6.6743e-11;
export const M = 5.972e24;
export const OrbitSpeedFactor = 0.00005;

export const update = (item: ObjectRecord, time: number) => {
	const r = Math.sqrt(Math.pow(item.point.x,2) + Math.pow(item.point.y,2));
	let a = (G * M) / (r * r);

	// Update velocity using acceleration
	item.vector.x += ((-a * item.point.x) / r) * time;
	item.vector.y += ((-a * item.point.y) / r) * time;

	// Update position using velocity
	item.point.x += item.vector.x * time;
	item.point.y += item.vector.y * time;
};

export const calculateCircularOrbit = (point: Point) => {
	return {
		x: 0,
		y: Math.sqrt((G * M) / Math.abs(point.x)), // * (Math.random() > 0.5 ? -1 : 1),
	};
};

export const rotateVector = (point: Point, radians: number) => {
	const xPrime = point.x * Math.cos(radians) + point.y * Math.sin(radians);
	const yPrime = -point.x * Math.sin(radians) + point.y * Math.cos(radians);
	return { x: xPrime, y: yPrime };
};
