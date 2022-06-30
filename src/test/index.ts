
import { SocketClient, filterMessage } from '../index';

const socketClient = new SocketClient({
  url: process.env.WS_URL,
  wsKey: process.env.WS_KEY,
});

socketClient.init()

socketClient.sendSubEvent('shop_S11593_post_102129162012992_391489155749496');

socketClient.on('message', (e) => {
  const data = filterMessage(e);

  if (!data) {
    return;
  }

  console.log('data', data);
});
