import { PlayResult } from "./dtos/playResult.ts";
import { Room } from "./room.ts";

export class Player {
  public id = 0
  public ws: WebSocket
  public room: Room | undefined

  constructor(ws: WebSocket) {
    this.ws = ws
  }

  public play(): PlayResult | undefined {
    if (this.room) {
      return this.room.play(this.id)
    }
  }
}