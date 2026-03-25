import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class TowerState extends Schema {
  @type("string") id: string = "";
  @type("uint8") gridX: number = 0;
  @type("uint8") gridY: number = 0;
  @type("string") towerType: string = "";
  @type("string") defenderId: string = "";
  @type("float32") hp: number = 0;
}

export class WallState extends Schema {
  @type("uint8") gridX: number = 0;
  @type("uint8") gridY: number = 0;
  @type("string") defenderId: string = "";
}

export class UnitState extends Schema {
  @type("string") id: string = "";
  @type("float32") x: number = 0;
  @type("float32") y: number = 0;
  @type("string") unitType: string = "";
  @type("float32") hp: number = 0;
  @type("float32") maxHp: number = 0;
  @type("boolean") alive: boolean = true;
  @type("string") attackerId: string = "";
  @type("string") targetDefenderId: string = "";
}

export class PlayerData extends Schema {
  @type("string") sessionId: string = "";
  @type("string") displayName: string = "";
  @type("boolean") ready: boolean = false;
  @type("float32") baseHp: number = 100;
  @type("uint8") colorIndex: number = 0;
}

export class GameState extends Schema {
  @type("string") phase: string = "waiting";
  @type("float32") timer: number = 0;
  @type({ map: PlayerData }) players = new MapSchema<PlayerData>();
  @type([TowerState]) towers = new ArraySchema<TowerState>();
  @type([WallState]) walls = new ArraySchema<WallState>();
  @type([UnitState]) units = new ArraySchema<UnitState>();
  @type("string") winnerId: string = "";
  @type("string") seed: string = "";
  @type("string") player1Id: string = "";
  @type("string") player2Id: string = "";
  @type("uint16") tick: number = 0;
}
