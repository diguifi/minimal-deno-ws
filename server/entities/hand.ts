export class Hand {
    public id: number
    public playedBy = -1
    public beats: number

    constructor(id: number, beats: number) {
        this.id = id
        this.beats = beats
    }

    public checkWinner(testHand: Hand): number {
        const beated = this.beats == testHand.id
        const draw = this.id == testHand.id

        if (draw) {
            return 3
        }
        if (beated) {
            return this.playedBy
        }

        return testHand.playedBy
    }
}