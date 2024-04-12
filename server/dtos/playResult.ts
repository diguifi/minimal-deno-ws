export class PlayResult {
  public handPlayer1: number
  public handPlayer2: number
  public winner: number

  constructor(handPlayer1: number, handPlayer2: number, winner: number) {
      this.handPlayer1 = handPlayer1
      this.handPlayer2 = handPlayer2
      this.winner = winner
  }
}