
import { socketClient, filterMessage } from '../index';

const ab = socketClient({
  url: process.env.WS_URL,
  wsKey: process.env.WS_KEY,
});

ab.init()

ab.sendSubEvent('shop_S11593_post_102129162012992_391489155749496');

ab.on('message', (e) => {
  const data = filterMessage(e);

  if (!data) {
    return;
  }

  console.log('data', data);
});
