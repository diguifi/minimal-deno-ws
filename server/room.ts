import { PlayResult } from "./dtos/playResult.ts";
import { Game } from "./game.ts";
import { Player } from "./player.ts";

export class Room {
  public id: string
  public players: Player[] = []
  public game: Game
  public isQuickJoin: boolean

  constructor(roomId: string, isQuick = false) {
    this.id = roomId
    this.isQuickJoin = isQuick
    this.game = new Game()
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

  public startGame() {
    this.game.startGame()
  }

  public play(playerTurn: number, playerChoice: number): PlayResult | undefined {
    if (this.game.started) {
      const result = this.game.play(playerTurn, playerChoice)
      return result
    }

    console.log('game did not start')
    return undefined
  }
}