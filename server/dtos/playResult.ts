export class PlayResult {
  public turn: number
  public winner: number

  constructor(turn: number, winner: number) {
      this.turn = turn
      this.winner = winner
  }
}