import GameStates from "./gamestates.js";
import InputMapping from "./input/mapping.js";
import { BulletsController } from "./bullets.js";
import { ObjectRecord } from "./gravity.js";

export class ShipController {
	avatar: HTMLImageElement;
	inputMapping: InputMapping;
	delta: number = 0;
	fireTimer: number = 0;
	shipState?: ObjectRecord & (typeof GameStates)["ShipState"];
	public animationFrame: number = 0;
	public timeouts: number[] = [];
	vector: number[];
	attributes?: { [key: string]: any };

	constructor(
		inputMapping: InputMapping,
		shipState?: ObjectRecord & (typeof GameStates)["ShipState"],
	) {
		this.inputMapping = inputMapping;

		if (shipState) {
			this.shipState = shipState;
		}

		this.animationFrame = requestAnimationFrame(
			this.processInputs.bind(this),
		);

		return this;
	}

	destroy() {
		this.inputMapping.destroy();

		cancelAnimationFrame(this.animationFrame);
		this.timeouts.forEach((timeout) => {
			clearTimeout(timeout);
		});

		this.avatar.remove();
	}

	processInputs(time: number) {
		if (this.delta === 0) {
			this.delta = time;
		}
		const delta = (time - this.delta) / 1000;
		this.fireTimer -= delta;
		this.delta = time;

		const acceleration = 1 * time;
		const inputs = this.inputMapping.mappings;

		if (inputs.forward) {
			this.forward(acceleration);
		}
		if (inputs.backward) {
			this.forward(-acceleration);
		}

		if (inputs.strafeLeft) {
			this.strafe(acceleration);
		}
		if (inputs.strafeRight) {
			this.strafe(-acceleration);
		}

		if (inputs.left) {
			this.rotate(-acceleration);
		}
		if (inputs.right) {
			this.rotate(acceleration);
		}

		// if (inputs.primary) {
		// 	this.createBullet(this.vector, [
		// 		Number(
		// 			this.avatar.style.top.match(
		// 				/[0-9]*\.*[0-9]*/,
		// 			)?.[0] as string,
		// 		),
		// 		Number(
		// 			this.avatar.style.left.match(
		// 				/[0-9]*\.*[0-9]*/,
		// 			)?.[0] as string,
		// 		) + 4,
		// 	]);
		// }

		// this.checkCargoCollisions();
		// this.checkBulletCollisions();
		// this.rechargeShields();

		// Should play an explosion sound, or do an explosion animation
		// if (this.shipState?.Hull === 0) {
		// 	this.destroy();
		// }

		this.animationFrame = requestAnimationFrame(
			this.processInputs.bind(this),
		);
	}

	private createBullet(vector: number[], position: number[]) {
		if (this.fireTimer <= 0) {
			position[1] += 5 * this.vector[1];

			new BulletsController(
				vector,
				position,
				this.avatar,
				this.shipState,
			);
			this.fireTimer = 5 / GameStates.ShipState.Weapons;
		}
	}

	private rotate(acceleration: number) {
		this.shipState.spin -= acceleration / 100000000;
	}

	private forward(acceleration: number) {
		// Normalize the vector
		this.shipState.vector.x += this.shipState.heading.x * acceleration;
		this.shipState.vector.y += this.shipState.heading.y * acceleration;
	}

	private strafe(acceleration: number) {
		this.shipState.vector.x += this.shipState.heading.y * acceleration;
		this.shipState.vector.y += -this.shipState.heading.x * acceleration;
	}
}
