export interface Connection<Incoming, Outgoing> {
  onMessage: (handler: (message: Incoming) => void) => () => void;
  send: (message: Outgoing) => void;
}
