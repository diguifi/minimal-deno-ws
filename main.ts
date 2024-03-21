import { Server } from './server.ts';

const serverConfigs = {
    defaultPort: 3000,
    version: 1,
}
const server = new Server(serverConfigs);

server.init();