import { PlayResult } from "./dtos/playResult.ts";
import { Game } from "./game.ts";
import { Player } from "./player.ts";

export class Room {
  public id: string
  public players: Player[] = []
  public game: Game
  public isQuickJoin: boolean
  public turn = 0

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
    this.turn = this.game.turn
  }

  public play(playerTurn: number): PlayResult | undefined {
    if (this.game.started) {
      if (playerTurn == this.turn) {
        const result = this.game.play(playerTurn)
        if (result)
          this.turn = result.turn
        return result
      }
  
      console.log(`'its not player ${playerTurn} turn`)
      return new PlayResult(this.turn,-1)
    }

    console.log('game did not start')
    return undefined
  }
}