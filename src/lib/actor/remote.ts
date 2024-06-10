import {
  MessageType,
  type Connection,
  type Handlers,
  type IncomingMessage,
  type RequestId,
} from "./model";

export function createRemote<H extends Handlers>(
  connection: Connection<any, IncomingMessage<H>>
) {
  let lastId = 0;
  // const
  return new Proxy(
    {},
    {
      get(_, prop) {
        const request = prop as keyof H;
        return (arg: Parameters<H[typeof request]>[0]) => {
          const id = lastId++ as RequestId;
          connection.send({
            id: id,
            request,
            type: MessageType.Request,
            payload: arg,
          });
        };
      },
    }
  ) as {
    [K in keyof H]: (arg: Parameters<H[K]>[0]) => Promise<ReturnType<H[K]>>;
  };
}
