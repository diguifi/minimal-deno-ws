export class PlayResult {
  public bothPlayed: boolean
  public winner: number

  constructor(bothPlayed: boolean, winner: number) {
      this.bothPlayed = bothPlayed
      this.winner = winner
  }
}