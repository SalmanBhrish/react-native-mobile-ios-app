import { createServer } from 'node:http';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
const server = createServer(createApp());

server.listen(port, () => {
  console.log(`Age API listening at http://localhost:${port}/api/age`);
});
