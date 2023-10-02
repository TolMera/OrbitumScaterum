export interface MouseCurrentState {
	timestamp: number;
	buttons: number;
	type: any;
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
	page: number[];
}

export class MouseController {
	currentState: Array<MouseCurrentState>;

	constructor() {
		// Initialize the previous state to an empty array
		this.currentState = [];

		const possibleEvents = [
			"click",
			"dblclick",
			"mousedown",
			"mouseup",
			"mouseenter",
			"mouseleave",
			"mouseover",
			"mouseout",
			"mousemove",
			"wheel",
		];
		const ignoreEvents = ["mousemove", "wheel"];

		// Listen to keyboard events on the window object
		for (let thisEvent of possibleEvents) {
			if (ignoreEvents.includes(thisEvent)) continue;
			window.addEventListener(thisEvent, (event) => {
				// We don't need pointer events at the moment, because we're not dealing with touch pads etc.  That could/should have it's own controller.
				if (event instanceof PointerEvent) return;
				this.currentState.push(
					this.cleanEvent(event as unknown as MouseEvent),
				);
			});
		}
	}

	cleanEvent(event: MouseEvent) {
		return {
			timestamp: Date.now(),
			buttons: event.buttons,
			type: event.type,
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
			page: [event.pageX, event.pageY],
		};
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

export default new MouseController();
