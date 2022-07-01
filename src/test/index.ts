
import { socketClient } from '../index';

const client = socketClient({
  url: process.env.WS_URL,
  wsKey: process.env.WS_KEY,
});

console.log('client', client);

client.connect();

client.emitSub('test');

client.on('message', (e) => {
  if (!e) {
    return;
  }

  console.log('data', e);
});
