export interface KeyboardCurrentState {
	timestamp: number;
	code: any;
	type: any;
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
}

export class KeyboardController {
	currentState: Array<KeyboardCurrentState>;

	constructor() {
		// Initialize the previous state to an empty array
		this.currentState = [];

		const possibleEvents = ["keydown", "keyup"];

		for (const thisEvent of possibleEvents) {
			window.addEventListener(thisEvent, (event) => {
				if (!(event instanceof KeyboardEvent)) return;
				// Check if the key is being repeated
				if (event.repeat) {
					return;
				}

				// Create a simplified event object with the timestamp and code
				const simpleEvent = this.cleanKeyboardEvent(event);

				// Add the event to the current state
				this.currentState.push(simpleEvent);
			});
		}
	}

	cleanKeyboardEvent(event: KeyboardEvent) {
		const simpleEvent = {
			timestamp: Date.now(),
			code: event.code,
			type: event.type,
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
		};

		return simpleEvent;
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
}

export default new KeyboardController();
