import { PlayResult } from "./dtos/playResult.ts";
import { Hand } from "./entities/hand.ts";
import { Paper } from "./entities/paper.ts";
import { Rock } from "./entities/rock.ts";
import { Scissors } from "./entities/scissors.ts";

export class Game {
  public started = false
  public played: Hand[] = []
  public bothPlayed = false
  private hands: Hand[]

  constructor() {
    this.hands = [new Rock(), new Paper(), new Scissors()]
  }

  public startGame() {
    this.reset()
    this.started = true
    console.log('game started')
  }
    
  public play(playerTurn: number, playerChoice: number): PlayResult | undefined {
    if (!this.played.some(x => x.playedBy == playerTurn)) {
      const hand = this.hands.find(x => x.id == playerChoice)
      if (hand) {
        const playerHand = new Hand(hand.id, hand.beats)
        playerHand.playedBy = playerTurn
        this.played.push(playerHand)
      }
    }
      
    this.bothPlayed = this.played.length == 2
    let handPlayer1 = this.getHandPlayedByPlayer(0)
    let handPlayer2 = this.getHandPlayedByPlayer(1)
    return new PlayResult(handPlayer1, handPlayer2, this.calculateWinner())
  }

  public reset() {
    this.started = false
    this.played = []
  }

  private getHandPlayedByPlayer(playerId: number) {
    let handPlayer = this.played.find(x => x.playedBy == playerId)
    if (handPlayer)
      return handPlayer.id
    return -1
  }

  private calculateWinner(): number {
    if (!this.bothPlayed) { return -1 }
    
    const hand1 = this.played[0]
    const hand2 = this.played[1]
    this.played.splice(0,this.played.length)

    return hand1.checkWinner(hand2)
  }
}