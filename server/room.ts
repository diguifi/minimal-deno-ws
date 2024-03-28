import { Player } from "./player.ts";

export class Room {
  public id: string
  public players: Player[] = []
  public isQuickJoin: boolean
  public turn = 0

  constructor(roomId: string, isQuick = false) {
    this.id = roomId
    this.isQuickJoin = isQuick
  }

  public addPlayer(player: Player) {
    this.players.push(player)
    player.room = this
  }

  public disconnectPlayers() {
    for (const player of this.players) {
      player.ws.close()
    }
  }
}