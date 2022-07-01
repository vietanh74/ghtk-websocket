# `$LIB_NAME`

> SDK js dùng cho websocket.

[[_TOC_]]

## Installation
## Usage
```js
import { socketClient } from '$LIB_NAME'

const client = socketClient({
  url: 'WS_URL',
  wsKey: 'WS_KEY',
});

client.connect();

client.emitSub('test');

client.on('message', (e) => {
  console.log('data', e);
});

client.close();

```

## Options

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| url | `String` | `true` | `''` | Websocket url. |
| wsKey | `String` | `true` | `''` | Websocket key. |
| maxMissedHeartbeats | `Number` | `false` | `3` | Max ping after disconnect. |
| reconnection | `Boolean` | `false` | `true` | Allow reconnection? |
| reconnectionDelay | `Number` | `false` | `1000` | Delay connect in milisecond(s). |
| reconnectionAttempts | `Number` | `false` | `5` | Max attempts reconnect. |
| onMessageCallback | `Function` | `false` | `() => {}` | Fn when receive message regiter beginning. |

