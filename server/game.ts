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
    return new PlayResult(this.bothPlayed, this.calculateWinner())
  }

  public reset() {
    this.started = false
    this.played = []
  }

  private calculateWinner(): number {
    if (!this.bothPlayed) { return -1 }
    
    const hand1 = this.played[0]
    const hand2 = this.played[1]
    this.played.splice(0,this.played.length)

    return hand1.checkWinner(hand2)
  }
}