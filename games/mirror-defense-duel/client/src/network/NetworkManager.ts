import * as Colyseus from "colyseus.js";

export class NetworkManager {
  private static instance: NetworkManager;
  private client: Colyseus.Client;
  room: Colyseus.Room | null = null;

  private constructor() {
    const host = window.location.hostname || "localhost";
    this.client = new Colyseus.Client(`ws://${host}:2567`);
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  async joinOrCreate(): Promise<Colyseus.Room> {
    this.room = await this.client.joinOrCreate("game");
    console.log(`Joined room: ${this.room.roomId}, sessionId: ${this.room.sessionId}`);
    return this.room;
  }

  get sessionId(): string {
    return this.room?.sessionId ?? "";
  }

  send(type: string, data?: unknown): void {
    this.room?.send(type, data);
  }

  onStateChange(callback: (state: any) => void): void {
    this.room?.onStateChange(callback);
  }

  onMessage(type: string, callback: (data: any) => void): void {
    this.room?.onMessage(type, callback);
  }

  onLeave(callback: (code: number) => void): void {
    this.room?.onLeave(callback);
  }

  leave(): void {
    this.room?.leave();
    this.room = null;
  }
}
