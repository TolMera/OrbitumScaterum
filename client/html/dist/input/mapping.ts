import { GamepadCurrentState } from "./gamepad.js";

export interface Mappings {
	forward: boolean;
	backward: boolean;
	left: boolean;
	right: boolean;

	strafeLeft: boolean;
	strafeRight: boolean;

	primary: boolean;
	secondary: boolean;
}

export class InputMapping {
	inputSource: any;

	public animationFrame: number = 0;
	public timeouts: number[] = [];

	mappings: Mappings = {
		forward: false,
		backward: false,
		left: false,
		right: false,

		strafeLeft: false,
		strafeRight: false,

		primary: false,
		secondary: false,
	};

	constructor(networkController: any) {
		this.inputSource = networkController;

		this.animationFrame = requestAnimationFrame(
			this.sendStateToServer.bind(this),
		);
	}

	destroy() {
		cancelAnimationFrame(this.animationFrame);
		this.timeouts.forEach((timeout) => {
			clearTimeout(timeout);
		});
	}

	sendStateToServer() {
		try {
			if (this.inputSource?.mappings) {
				this.mappings = this.inputSource.mappings;
			}

			// Send Keyboard state to server
			if (
				this.inputSource?.keyboardState &&
				this.inputSource?.keyboardState.length > 0
			) {
				const keyboardState = this.inputSource.keyboardState;
				this.inputSource.keyboardState = [];

				// !IMPORTANT = Send this state don't just log it.
				this.processKeyboardState(keyboardState);
			}

			if (
				this.inputSource?.mouseState &&
				this.inputSource?.mouseState.length > 0
			) {
				const mouseState = this.inputSource.mouseState;
				this.inputSource.mouseState = [];

				// !IMPORTANT = Send this state don't just log it.
				// this.processMouseState(mouseState);
			}

			if (
				this.inputSource?.gamepadState &&
				this.inputSource?.gamepadState.length > 0
			) {
				const gamepadState = this.inputSource.gamepadState;
				this.inputSource.gamepadState = [];

				this.processGamepadState(gamepadState);
			}

			this.animationFrame = requestAnimationFrame(
				this.sendStateToServer.bind(this),
			);
		} catch (e) {
			console.error(e);
		}
	}

	processGamepadState(gamepadState: GamepadCurrentState[]) {
		for (let record of gamepadState) {
			this.mappings.backward = record.axes[7] > 0;
			this.mappings.forward = record.axes[7] < 0;
			this.mappings.left = record.axes[6] < 0;
			this.mappings.right = record.axes[6] > 0;

			this.mappings.primary = !!record.buttons[7];
			this.mappings.secondary = !!record.buttons[9];
		}
	}

	processKeyboardState(keyboardState: any) {
		for (let record of keyboardState) {
			// Forward/back
			if (record.code === "KeyW") {
				if (record.type === "keydown") this.mappings.forward = true;
				else this.mappings.forward = false;
				continue;
			}
			if (record.code === "KeyS") {
				if (record.type === "keydown") this.mappings.backward = true;
				else this.mappings.backward = false;
				continue;
			}

			// Left/right
			if (record.code === "KeyA") {
				if (record.type === "keydown") this.mappings.left = true;
				else this.mappings.left = false;
				continue;
			}
			if (record.code === "KeyD") {
				if (record.type === "keydown") this.mappings.right = true;
				else this.mappings.right = false;
				continue;
			}

			// Strafe
			if (record.code === "KeyQ") {
				if (record.type === "keydown") this.mappings.strafeLeft = true;
				else this.mappings.strafeLeft = false;
				continue;
			}
			if (record.code === "KeyE") {
				if (record.type === "keydown") this.mappings.strafeRight = true;
				else this.mappings.strafeRight = false;
				continue;
			}

			if (record.code === "Space") {
				if (record.type === "keydown") this.mappings.primary = true;
				else this.mappings.primary = false;
				continue;
			}
			if (record.code === "ShiftLeft") {
				if (record.type === "keydown") this.mappings.secondary = true;
				else this.mappings.secondary = false;
				continue;
			}
		}
	}
}

export default InputMapping;
