export interface SocketOption {
  url: string;
  wsKey: string;
  maxMissedHeartbeats?: number;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionAttempts?: number;
  onMessageCallback?: Function;
};
