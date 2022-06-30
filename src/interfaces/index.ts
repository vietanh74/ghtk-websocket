export interface SocketOption {
  url: string;
  wsKey: string;
  maxMissedHeartbeats?: number;
  autoConnect?: boolean;
  autoConnectAfter?: number;
  onMessageCallback?: Function;
};
