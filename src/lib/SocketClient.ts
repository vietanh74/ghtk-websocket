import { toString } from 'lodash-es';

import { READY_STATE, HEART_BEAT_MESSAGE } from '@/constants';
import { SocketOption } from '@/interfaces';

const HEART_BEAT_TIME = 10000;

class SocketClient {
  private client: WebSocket = null;
  private missedHeartbeats: number = 0;
  private heartBeatInterval: ReturnType<typeof setInterval> = null;
  private pollRetryConnection: ReturnType<typeof setInterval> = null;
  private presentSubs: string[] = [];
  private failedSubQueue: any[] = [];
  private opts: SocketOption = {
    url: '',
    wsKey: '',
    reconnection: true,
    reconnectionAttempts: 5,
    maxMissedHeartbeats: 3,
    reconnectionDelay: 1000,
  };

  constructor(opts: SocketOption) {
    this.opts = opts;
  }

  /**
   * Connect to websocket.
   *
   * @return client
   */
  public connect() {
    if (!this.client || this.client.readyState === READY_STATE.CLOSED) {
      this.client = new WebSocket(this.opts.url);
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

        if (this.opts.onMessageCallback) {
          this.opts.onMessageCallback(e);
        }
      };

      if (this.opts.reconnection) {
        this.client.addEventListener('close', this.reconnect);
      }
    }
    return this.client;
  }

  /**
   *  Reconnect websocket.
   *
   * @return void
   */
  public reconnect() {
    setTimeout(() => {
      this.pollRetryConnection = setInterval(() => {
        const client = this.connect();
        client.onopen = () => {
          this.onPing();
          clearInterval(this.pollRetryConnection);

          // Subscribe all event before lost connect
          const newSubList = [...this.presentSubs];
          this.presentSubs = [];
          newSubList.forEach((item) => {
            this.emitSub(item);
          });
        };
      }, this.opts.reconnectionDelay);
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
      if (this.missedHeartbeats >= this.opts.maxMissedHeartbeats) {
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
        this.emitSub(queueItem.value);
      }

      if (queueItem.name === 'unsub') {
        this.emitUnsub(queueItem.value);
      }
    });
    this.failedSubQueue = [];
  }

  /**
   *  Send subcribe to a event.
   *
   * @param type - event type
   * @return void
   */
  public emitSub(type: string) {
    if (this.client?.readyState !== READY_STATE.OPEN) {
      this.failedSubQueue.push({
        name: 'sub',
        value: type,
      });
      return;
    }

    if (this.presentSubs.includes(type)) {
      this.client.send(`${this.opts.wsKey}|sub|${type}`);
      return;
    }

    if (this.client?.readyState === READY_STATE.OPEN) {
      this.client.send(`${this.opts.wsKey}|sub|${type}`);

      // Add sub
      this.presentSubs.push(type);
    }
  };

  /**
   *  Send unsubcribe to a event.
   *
   * @param type - event type
   * @return void
   */
  public emitUnsub(type: string) {
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
        this.client.send(`${this.opts.wsKey}|unsub|${type}`);
      }
    }
  };

  public on(eventName: string, fn: EventListenerOrEventListenerObject) {
    this.client.addEventListener(eventName, fn);
  }

  public off(eventName: string, fn: EventListenerOrEventListenerObject) {
    this.client.removeEventListener(eventName, fn);
  }

  /**
   *  Close connection.
   *
   * @return void
   */
  public close() {
    this.presentSubs = [];
    this.failedSubQueue = [];
    clearInterval(this.heartBeatInterval);
    clearInterval(this.pollRetryConnection);

    if (this.opts.reconnection) {
      this.client.removeEventListener('close', this.reconnect);
    }

    if (this.client) {
      this.client.close();
    }
  }
}

export const socketClient = (option: SocketOption) => {
  return new SocketClient(option);
};
