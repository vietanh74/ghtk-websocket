import { toString } from "lodash-es";
import JSONbig from 'json-bigint';

import { READY_STATE } from "./constants";
import { SocketConfig } from './interfaces';

const HEART_BEAT_MESSAGE = "55";
const HEART_BEAT_TIME = 10000;

let _client = null;
let _missedHeartbeats = 0;
let _heartBeatInterval = null;
let _pollRetryConnection = null;
let _presentSubs = [];
let failedSubQueue = [];
const socketConfig: SocketConfig = {
  url: '',
  wsKey: '',
};

function processQueue() {
  failedSubQueue.forEach((queueItem) => {
    if (queueItem.name === "sub") {
      _sendSubEvent(queueItem.value);
    }

    if (queueItem.name === "unsub") {
      _sendUnSubEvent(queueItem.value);
    }
  });
  failedSubQueue = [];
}

const init = (config: SocketConfig) => {
  socketConfig.url = config.url;
  socketConfig.wsKey = config.wsKey;

  _initSocket();
};

const _initSocket = () => {
  if (!_client || _client.readyState === READY_STATE.CLOSED) {
    _client = new WebSocket(socketConfig.url);
    _client.onopen = (e) => {
      // Process all queue
      processQueue();

      //
      _onPing();
      // window.$nuxt.$root.$emit("WEBSOCKET__open", e);
    };

    _client.onmessage = (e) => {
      // Ping message
      if (toString(e.data) === HEART_BEAT_MESSAGE) {
        _missedHeartbeats = 0;
        return;
      }

      // window.$nuxt.$root.$emit("WEBSOCKET__message", e);
    };

    _client.addEventListener("close", _retryConnection);
  }
  return _client;
};

const _on = (eventName, handler) => {
  _client.addEventListener(eventName, handler);
};

const _off = (eventName, handler) => {
  _client.removeEventListener(eventName, handler);
};

const _sendSubEvent = (type: string) => {
  if (_client?.readyState !== READY_STATE.OPEN) {
    failedSubQueue.push({
      name: "sub",
      value: type,
    });
    return;
  }

  if (_presentSubs.includes(type)) {
    _client.send(`${socketConfig.wsKey}|sub|${type}`);
    return;
  }

  if (_client?.readyState === READY_STATE.OPEN) {
    _client.send(`${socketConfig.wsKey}|sub|${type}`);

    // Add sub
    _presentSubs.push(type);
  }
};

const _sendUnSubEvent = (type) => {
  if (_client?.readyState !== READY_STATE.OPEN) {
    failedSubQueue.push({
      name: "unsub",
      value: type,
    });
    return;
  }

  if (_client?.readyState === READY_STATE.OPEN) {
    const subIndex = _presentSubs.indexOf(type);

    // Remove sub list and send unsub event
    if (subIndex > -1) {
      _presentSubs.splice(subIndex, 1);
      _client.send(`${socketConfig.wsKey}|unsub|${type}`);
    }
  }
};

const _onPing = () => {
  // set to default
  if (_heartBeatInterval) {
    clearInterval(_heartBeatInterval);
  }
  _heartBeatInterval = null;

  // handle
  _client.send(HEART_BEAT_MESSAGE);
  _missedHeartbeats = 0;
  _heartBeatInterval = setInterval(() => {
    _missedHeartbeats++;
    if (_missedHeartbeats >= 3) {
      console.log("Too many missed heartbeats.");
      clearInterval(_heartBeatInterval);
      _heartBeatInterval = null;
      _client.close();
      return;
    }

    _client.send(HEART_BEAT_MESSAGE);
  }, HEART_BEAT_TIME);
};

const _close = () => {
  _presentSubs = [];
  failedSubQueue = [];

  _client.removeEventListener("close", _retryConnection);

  if (_client) {
    _client.close();
  }
};

const _filterMessage = (messageEvent: any, eventNames: string | string[]) => {
  const data = messageEvent.data;
  let message = {
    event: "",
  };

  try {
    message = data ? JSONbig({ storeAsString: true }).parse(data) : {};
  } catch (error) {}

  if (!data) {
    return;
  }

  if (!eventNames) {
    return message;
  }

  if (eventNames.includes(message.event)) {
    return message;
  }

  return;
};

const _retryConnection = (timer = 3000) => {
  setTimeout(() => {
    _pollRetryConnection = setInterval(() => {
      const client = _initSocket();
      client.onopen = () => {
        console.log("Success retry connection");
        _onPing();
        clearInterval(_pollRetryConnection);

        // Subscribe all event before lost connect
        const newSubList = [..._presentSubs];
        _presentSubs = [];
        newSubList.forEach((item) => {
          _sendSubEvent(item);
        });
      };
    }, timer);
  }, 1000);
};

export const socketClient = {
  getInstance: _client,
  init: init,
  on: _on,
  off: _off,
  filterMessage: _filterMessage,
  sendSubEvent: _sendSubEvent,
  sendUnSubEvent: _sendUnSubEvent,
  onPing: _onPing,
  close: _close,
};
