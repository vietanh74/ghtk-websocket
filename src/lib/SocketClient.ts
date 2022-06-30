import { toString } from 'lodash-es';

import { READY_STATE, HEART_BEAT_MESSAGE } from '../constants';
import { SocketOption } from '../interfaces';

const HEART_BEAT_TIME = 10000;

export class SocketClient {
  private client: WebSocket = null;
  private missedHeartbeats: number = 0;
  private heartBeatInterval: ReturnType<typeof setInterval> = null;
  private pollRetryConnection: ReturnType<typeof setInterval> = null;
  private presentSubs: any[] = [];
  private failedSubQueue: any[] = [];
  private options: SocketOption = {
    url: '',
    wsKey: '',
    autoConnect: false,
    maxMissedHeartbeats: 3,
    autoConnectAfter: 1000,
  };

  constructor(options: SocketOption) {
    this.options = options;
  }

  init() {
    if (!this.client || this.client.readyState === READY_STATE.CLOSED) {
      this.client = new WebSocket(this.options.url);
      this.client.onopen = (e) => {
        this.processQueue();

        this.onPing();
      };

      this.client.onmessage = (e) => {
        // Ping message
        if (toString(e.data) === HEART_BEAT_MESSAGE) {
          this.missedHeartbeats = 0;
          return;
        }

        if (this.options.onMessageCallback) {
          this.options.onMessageCallback(e);
        }
      };

      if (this.options.autoConnect) {
        this.client.addEventListener('close', this.retryConnection);
      }
    }
    return this.client;
  }

  private retryConnection() {
    setTimeout(() => {
      this.pollRetryConnection = setInterval(() => {
        const client = this.init();
        client.onopen = () => {
          console.log('Success retry connection');
          this.onPing();
          clearInterval(this.pollRetryConnection);

          // Subscribe all event before lost connect
          const newSubList = [...this.presentSubs];
          this.presentSubs = [];
          newSubList.forEach((item) => {
            this.sendSubEvent(item);
          });
        };
      }, this.options.autoConnectAfter);
    }, 1000);
  }

  private onPing() {
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval);
    }

    this.heartBeatInterval = null;

    this.client.send(HEART_BEAT_MESSAGE);
    this.missedHeartbeats = 0;
    this.heartBeatInterval = setInterval(() => {
      this.missedHeartbeats++;
      if (this.missedHeartbeats >= this.options.maxMissedHeartbeats) {
        console.log('Too many missed heartbeats.');
        clearInterval(this.heartBeatInterval);
        this.heartBeatInterval = null;
        this.client.close();
        return;
      }

      this.client.send(HEART_BEAT_MESSAGE);
    }, HEART_BEAT_TIME);
  }

  private processQueue() {
    this.failedSubQueue.forEach((queueItem) => {
      if (queueItem.name === 'sub') {
        this.sendSubEvent(queueItem.value);
      }

      if (queueItem.name === 'unsub') {
        this.sendUnSubEvent(queueItem.value);
      }
    });
    this.failedSubQueue = [];
  }

  sendSubEvent = (type: string) => {
    if (this.client?.readyState !== READY_STATE.OPEN) {
      this.failedSubQueue.push({
        name: 'sub',
        value: type,
      });
      return;
    }

    if (this.presentSubs.includes(type)) {
      this.client.send(`${this.options.wsKey}|sub|${type}`);
      return;
    }

    if (this.client?.readyState === READY_STATE.OPEN) {
      this.client.send(`${this.options.wsKey}|sub|${type}`);

      // Add sub
      this.presentSubs.push(type);
    }
  };

  sendUnSubEvent = (type: string) => {
    if (this.client?.readyState !== READY_STATE.OPEN) {
      this.failedSubQueue.push({
        name: 'unsub',
        value: type,
      });
      return;
    }

    if (this.client?.readyState === READY_STATE.OPEN) {
      const subIndex = this.presentSubs.indexOf(type);

      // Remove sub list and send unsub event
      if (subIndex > -1) {
        this.presentSubs.splice(subIndex, 1);
        this.client.send(`${this.options.wsKey}|unsub|${type}`);
      }
    }
  };

  on(eventName: string, callback) {
    this.client.addEventListener(eventName, callback);
  }

  off(eventName: string, callback) {
    this.client.removeEventListener(eventName, callback);
  }

  close() {
    this.presentSubs = [];
    this.failedSubQueue = [];
    clearInterval(this.heartBeatInterval);
    clearInterval(this.pollRetryConnection);

    if (this.options.autoConnect) {
      this.client.removeEventListener('close', this.retryConnection);
    }

    if (this.client) {
      this.client.close();
    }
  }
}
