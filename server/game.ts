import { PlayResult } from "./dtos/playResult.ts";

export class Game {
  public started = false
  public turn = 0

  constructor() { }

  public startGame() {
    this.reset()
    this.started = true
    console.log('game started')
  }
    
  public play(playerTurn: number): PlayResult | undefined {
    console.log(`${playerTurn} made a move`)
    this.skipTurn()
    return new PlayResult(this.turn,-1)
  }

  public reset() {
    this.started = false
    this.turn = 0
  }

  public skipTurn() {
    if (this.turn == 0)
      this.turn = 1
    else
      this.turn = 0
  }
}