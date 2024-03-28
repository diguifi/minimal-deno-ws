import { Command } from "../shared/Enums.ts";
import { Player } from "./player.ts";
import { Room } from "./room.ts";

export class ClientHandler {
  public serverVersion: number
  public rooms: Room[] = []
  public maxRooms = 75

  constructor(serverConfigs: any) {
    this.serverVersion = serverConfigs.version
  }
  
  private pong(player: Player): void {
    try {
      this.send(player,`${Command.Pong}`)
    } catch (e) {
      console.log('source: pong')
      console.log(e)
    }
  }

  private parseEventDataString(eventDataString: string): string[] {
    const eventData = eventDataString.split(',')
    if (eventDataString.includes(',"')) {
      const indexFirstQuotes = eventDataString.indexOf(',"')+2
      const indexLastQuotes = eventDataString.split(',"')[1].indexOf('"')+indexFirstQuotes
      eventData[1] = eventDataString.substring(indexFirstQuotes, indexLastQuotes)
    }

    return eventData
  }

  private send(player: Player, message: string):boolean {
    try {
      if (player.ws.readyState !== WebSocket.CLOSED) {
        player.ws.send(message)
        return true
      } else {
        player.ws.close()
        return false
      }
    } catch (e) {
      console.log('source: send')
      console.log(e)
    }
    return false
  }

  public handleClient(ws: WebSocket): void {
    try {
      let player: Player | null = null;
      ws.onopen = () => player = this.handleOpenClient(ws);
      ws.onmessage = (m) => this.handleClientMessage(player, m);
      ws.onclose = () => this.handleClientClose(player);
      ws.onerror = (e) => this.handleClientError(e, player);
    } catch (e) {
      console.log('source: main loop')
      console.log(e)
    }
  }

  public handleClientMessage(player: Player | null, m: MessageEvent<any>)  {
    if (player) {
      try {
        const enc = new TextDecoder("utf-8");
        const arr = m.data;
        const eventDataString = enc.decode(arr)

        const eventData = this.parseEventDataString(eventDataString);
        switch (+eventData[0]) {
          case Command.Pong:
            this.pong(player)
            break
        }
      } catch(e) {
        console.log(e,player, 'main loop')
      }
    }
  }

  private handleOpenClient(ws: WebSocket) {
    const player = new Player(ws)
    return player
  }

  private handleClientClose(player: Player | null) {
    if (player) {
      player.ws.close()
    }
  }

  private handleClientError(e: Event | ErrorEvent, player: Player | null) {
    const errorMessage = e instanceof ErrorEvent ? e.message : e.type
    console.log(new Error(errorMessage), player, 'clientError')
  }
}