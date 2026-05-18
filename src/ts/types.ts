export interface GameState {
  turn: number;
  wood: number;
  gold: number;
  lumberjacks: number;
}

export interface BuildingCost {
  gold: number;
  wood: number;
}

// Hier kannst du später leicht neue Gebäude hinzufügen
export const BUILDING_COSTS = {
  lumberjack: { gold: 15, wood: 0 },
  petriciteMill: { gold: 50, wood: 30 } // Beispiel für später
};

export const PASSIVE_GOLD_PER_TURN = 5;
export const WOOD_PER_LUMBERJACK = 5;