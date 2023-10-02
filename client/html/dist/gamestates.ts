type ShipState = {
	Hull: number;
	MaxHull: number;

	Cargo: number;
	MaxCargo: number;

	Fuel: number;
	MaxFuel: number;

	Engines: number;
	MaxEngines: number;

	Weapons: number;
	MaxWeapons: number;

	Shields: number;
	MaxShileds: number;
};

export class GameStates {
	// Maintenance: MaintenanceOption[] = [];
	ShipState: ShipState = {
		Hull: 100,
		MaxHull: 100,

		Cargo: 0,
		MaxCargo: 100,

		Fuel: 100,
		MaxFuel: 100,

		Engines: 1,
		MaxEngines: 10,

		Weapons: 1,
		MaxWeapons: 10,

		Shields: 1,
		MaxShileds: 10,
	};
}

export default new GameStates();
