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

  private createRoom(player: Player, roomId: string) {
    try {
      console.log(`creating room ${roomId}....`)
      const alreadyExists = this.rooms.some(x => x.id == roomId)
      if (!alreadyExists) {
        const room = new Room(roomId)
        room.addPlayer(player)
        this.rooms.push(room)
        this.send(player,`${Command.CreateRoom},1`)
      } else {
        console.log(`id ${roomId} already exists`)
        this.send(player,`${Command.CreateRoom},0`)
      }
    } catch (e) {
      console.log('source: createRoom')
      console.log(e)
      this.send(player,`${Command.CreateRoom},0`)
    }
  }

  private joinRoom(player: Player, roomId: string) {
    try {
      console.log(`joining room ${roomId}....`)
      const room = this.rooms.find(x => x.id == roomId && x.players.length == 1)
      if (room) {
        player.id = 1
        room.addPlayer(player)
        this.send(player,`${Command.JoinRoom},1`)
      } else {
        console.log(`room ${roomId} not found`)
        this.send(player,`${Command.JoinRoom},0`)
      }
    } catch (e) {
      console.log('source: joinRoom')
      console.log(e)
      this.send(player,`${Command.JoinRoom},0`)
    }
  }

  private startGame(player: Player) {
    try {
      console.log(`starting game at room ${player.room?.id}....`)
      const room = player.room
      if (room) {
        room.startGame()
        for (const player of room?.players) {
          this.send(player,`${Command.StartGame}`)
        }
      } else {
        console.log(`room ${player.room?.id} not found`)
      }
    } catch (e) {
      console.log('source: startGame')
      console.log(e)
    }
  }

  private play(player: Player, playerChoice: number) {
    try {
      const hand = playerChoice == 1 ? 'rock' : playerChoice == 2 ? 'paper' : 'scissors'
      console.log(`player ${player.id} playing ${hand} at room ${player.room?.id}....`)
      let room = player.room
      if (room) {
        const result = player.play(playerChoice)
        if (result) {
          for (const player of room?.players) {
            this.send(player,`${Command.Play},` +
            `${result.handPlayer1},` +
            `${result.handPlayer2},` +
            `${result.winner}`)
          }

          if (result.winner != -1) {
            if (result.winner == 3)
              console.log('draw!')
            else
              console.log(`player ${result.winner} wins this round`)
          }
        }
      } else {
        console.log(`room ${player.room?.id} not found`)
      }
    } catch (e) {
      console.log('source: play')
      console.log(e)
    }
  }

  private quickJoin(player: Player) {
    try {
      const quickRoom = this.rooms.find(x => x.isQuickJoin && x.players.length < 2)
      if (!quickRoom) {
        console.log('created quick room')
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const room = new Room(uniqueId, true)
        room.addPlayer(player)
        this.rooms.push(room)
        this.send(player,`${Command.QuickJoin},0`)
      } else {
        console.log('joined quick room')
        player.id = 1
        quickRoom.addPlayer(player)
        this.send(player,`${Command.QuickJoin},1`)
      }
    } catch (e) {
      console.log('source: quickJoin')
      console.log(e)
      this.send(player,`${Command.QuickJoin},2`)
    }
  }

  private pong(player: Player): void {
    try {
      this.send(player,`${Command.Pong}`)
    } catch (e) {
      console.log('source: pong')
      console.log(e)
    }
  }

  private logPlayerOut(player: Player): boolean {
    try{
      console.log('desconectando player')
      let room = player.room
      room?.disconnectPlayers()
      this.rooms = this.rooms.filter(x => x.id != player.room?.id)
      room = undefined
      return true
    } catch (e) {
      console.log(e, player, 'logPlayerOut')
      if (e.name.includes('ConnectionReset')) {
        this.removeAllClosedSockets()
      }
    }
    return false
  }

  private removeAllClosedSockets(): boolean {
    let success = false
    let currentPlayer: Player | null = null
    for (const room of this.rooms) {
      for (const player of room.players) {
        try {
          currentPlayer = player
          if (player.ws.readyState === WebSocket.CLOSED) {
            this.logPlayerOut(player)
            success = true
          }
        } catch (e) {
          console.log('source: removeAllClosedSockets', currentPlayer?.id)
          console.log(e)
        }
      }
    }

    return success
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
        this.logPlayerOut(player)
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

  private handleOpenClient(ws: WebSocket) {
    const player = new Player(ws)
    return player
  }

  public handleClientMessage(player: Player | null, m: MessageEvent<any>)  {
    if (player) {
      try {
        const enc = new TextDecoder("utf-8");
        const arr = m.data;
        const eventDataString = enc.decode(arr)

        const eventData = this.parseEventDataString(eventDataString);
        switch (+eventData[0]) {
          case Command.CreateRoom:
            this.createRoom(player, eventData[1])
            break
          case Command.JoinRoom:
            this.joinRoom(player, eventData[1])
            break
          case Command.QuickJoin:
            this.quickJoin(player)
            break
          case Command.StartGame:
            this.startGame(player)
            break
          case Command.Play:
            this.play(player, +eventData[1])
            break
          case Command.Pong:
            this.pong(player)
            break
        }
      } catch(e) {
        console.log(e,player, 'main loop')
        if (e.name.includes('ConnectionReset')) {
          this.removeAllClosedSockets()
        }
      }
    }
  }

  private handleClientClose(player: Player | null) {
    if (player) {
      this.logPlayerOut(player)
    }
  }

  private handleClientError(e: Event | ErrorEvent, player: Player | null) {
    const errorMessage = e instanceof ErrorEvent ? e.message : e.type
    console.log(new Error(errorMessage), player, 'clientError')
  }
}