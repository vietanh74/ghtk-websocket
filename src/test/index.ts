
import { socketClient } from '../index';

const ab = socketClient({
  url: process.env.WS_URL,
  wsKey: process.env.WS_KEY,
});

ab.connect()

ab.emitSub('test');

ab.on('message', (e) => {
  if (!e) {
    return;
  }

  console.log('data', e);
});
