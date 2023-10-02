import KeyboardController from "./keyboard.js";
import { KeyboardCurrentState } from "./keyboard.js";
import MouseController from "./mouse.js";
import { MouseCurrentState } from "./mouse.js";
import GamepadController from "./gamepad.js";
import { GamepadCurrentState } from "./gamepad.js";

export class NetworkController {
	keyboardState: Array<KeyboardCurrentState> = [];
	mouseState: Array<MouseCurrentState> = [];
	gamepadState: Array<GamepadCurrentState> = [];
	lastTime: number = 0;

	constructor() {
		requestAnimationFrame(this.listenToInputs.bind(this));
	}

	listenToInputs() {
		this.keyboardState.push(...KeyboardController.getState());
		this.mouseState.push(...MouseController.getState());
		this.gamepadState.push(...GamepadController.getState());

		requestAnimationFrame(this.listenToInputs.bind(this));
	}
}

export default new NetworkController();
