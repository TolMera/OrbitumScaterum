export interface GamepadCurrentState {
	index: Gamepad["index"];
	axes: number[];
	buttons: number[];
	timestamp: number;
}

export class GamepadController {
	currentState: GamepadCurrentState[] = [];
	lastState: {
		[index: string]: {
			axes: Gamepad["axes"];
			buttons: Gamepad["buttons"];
		};
	} = {};

	constructor() {
		if (this.validateApi()) {
			this.logGamepadConnections();
			this.runGamepadConfiguration();

			requestAnimationFrame(this.monitorGamepads.bind(this));
		}
	}

	monitorGamepads() {
		for (const gamepad of navigator.getGamepads()) {
			if (gamepad && gamepad.connected) {
				if (
					this.lastState[gamepad.index]?.axes.toString() !==
						gamepad.axes.toString() ||
					this.lastState[gamepad.index]?.buttons
						.map((record) => record.value)
						.toString() !==
						gamepad.buttons.map((record) => record.value).toString()
				) {
					this.currentState.push({
						index: gamepad.index,
						axes: gamepad.axes as number[],
						buttons: gamepad.buttons.map((record) => record.value),
						timestamp: Date.now(),
					});

					this.lastState[gamepad.index] = {
						axes: gamepad.axes,
						buttons: gamepad.buttons,
					};
				}
			}
		}

		requestAnimationFrame(this.monitorGamepads.bind(this));
	}

	getState() {
		// Create a copy of the current state
		const state = this.currentState;
		// Clear the current state
		this.currentState = [];

		// Sort the state array by timestamp in ascending order
		state.sort((a, b) => a.timestamp - b.timestamp);

		// Return the sorted state array
		return state;
	}

	validateApi() {
		if ("getGamepads" in navigator) {
			console.log("Gamepad API is supported");
			for (const gamepad of navigator.getGamepads()) {
				if (gamepad && gamepad.connected) {
					console.log({
						hapticActuators: gamepad.hapticActuators,
						mapping: gamepad.mapping,
						id: gamepad.id,
					});
				}
			}
			return true;
		} else {
			console.warn("Gamepad API not supported");
			return false;
		}
	}

	logGamepadConnections() {
		window.addEventListener("gamepadconnected", (event) => {
			console.log("Gamepad connected", event.gamepad);
		});

		window.addEventListener("gamepaddisconnected", (event) => {
			console.log("Gamepad disconnected", event.gamepad);
		});
	}

	runGamepadConfiguration() {
		console.warn(
			"Still need to setup something that allows the user to configure their gamepad",
		);
	}
}

export default new GamepadController();
