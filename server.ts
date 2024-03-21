import { flags } from "./deps.ts"
import { ClientHandler } from "./server/clientHandler.ts"

export class Server {
  private port: string
  private clientHandler: ClientHandler

  constructor(serverConfigs: any) {
    const argPort: number = flags.parse(Deno.args).port
    const herokuPort = Deno.env.get("PORT")
    this.port = herokuPort ? Number(herokuPort) : argPort ? Number(argPort) : serverConfigs.defaultPort
    this.clientHandler = new ClientHandler(serverConfigs)
  }

  public reqHandler(req: Request) {
    if (req.headers.get("upgrade") != "websocket") {
      return this.handleNonWsRequests(req)
    }

    const { socket: ws, response } = Deno.upgradeWebSocket(req)
    this.clientHandler.handleClient(ws)

    return response
  }

  public init(): void {
    const portInt = Number(this.port)
    Deno.serve({ port: portInt }, this.reqHandler.bind(this))
  }

  public handleNonWsRequests(req: Request): Response {
    const url = new URL(req.url)
    let cleanedUrl = url.pathname
    let response: Response = new Response()
    if(req.url.includes('?')) {
      cleanedUrl = req.url.split('?')[0]
    }

    return response
  }
}
