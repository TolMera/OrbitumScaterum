import GameStates from "./gamestates";

export class BulletsController {
	owner: HTMLImageElement;
	delta: number = 0;
	avatar: HTMLImageElement;
	vector: number[];
	position: number[];
	shipState?: (typeof GameStates)["ShipState"];

	public timeouts: number[] = [];
	public animationFrame: number = 0;

	constructor(
		vector: number[],
		position: number[],
		owner: HTMLImageElement,
		shipState?: (typeof GameStates)["ShipState"],
	) {
		this.owner = owner;
		this.vector = vector;
		this.position = position;
		if (shipState) this.shipState = shipState;

		this.avatar = this.createBullet();
		this.avatar.addEventListener("remove", () => {
			this.destroy();
		});

		this.animationFrame = requestAnimationFrame(this.move.bind(this));
	}

	destroy() {
		try {
			cancelAnimationFrame(this.animationFrame);
			this.timeouts.forEach((timeout) => {
				clearTimeout(timeout);
			});

			// Not required, but it's a safety I guess?
			this.avatar.remove();
		} catch (e) {
			console.error(e);
		}
	}

	createBullet() {
		const avatar = document.createElement("img");
		avatar.style.height = "1vh";
		avatar.src = "./media/bullet.png";
		avatar.style.position = "absolute";
		avatar.style.margin = "-0.5vh 0px 0px 0px";
		avatar.style.top = `${this.position[0]}vh`;
		avatar.style.left = `${this.position[1]}vw`;
		avatar.style.transition = "top 1s linear";
		avatar.style.transition = "left 1s linear";
		avatar.style.zIndex = "10";

		document.body.appendChild(avatar);

		return avatar;
	}

	move(time: number) {
		if (this.delta === 0) {
			this.delta = time;
		}
		const delta = (time - this.delta) / 1000;
		this.delta = time;
		const acceleration = (this.shipState?.Weapons || 1) * delta * 10;

		try {
			this.moveVertical(acceleration * this.vector[0]);
			this.moveHorizontal(acceleration * this.vector[1]);

			this.animationFrame = requestAnimationFrame(this.move.bind(this));
		} catch (e) {
			// The instance has thrown an error, don't do anything, we will let this instance of the bullet fall out of memory
		}
	}

	public moveVertical(amount: number) {
		let position =
			Number(
				this.avatar.style.top.match(/[0-9]*\.*[0-9]*/)?.[0] as string,
			) + amount;
		this.avatar.style.top = position + "vh";

		if (position > 110 || position <= 0) {
			this.avatar.dispatchEvent(new Event("remove"));
		}
	}

	public moveHorizontal(amount: number) {
		let position =
			Number(
				this.avatar.style.left.match(/[0-9]*\.*[0-9]*/)?.[0] as string,
			) + amount;
		this.avatar.style.left = position + "vw";

		if (position > 110 || position <= 0) {
			this.avatar.dispatchEvent(new Event("remove"));
		}
	}
}
