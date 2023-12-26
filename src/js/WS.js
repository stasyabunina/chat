export default class WS {
  constructor(onGetMessage) {
    this.ws = new WebSocket(`wss://chat-backend-nf84.onrender.com/ws`);
    this.onGetMessage = onGetMessage;
  }

  init() {
    this.ws.addEventListener("open", () => {
      console.log("ws open");
    });

    this.ws.addEventListener("message", this.onGetMessage);

    this.ws.addEventListener("close", () => {
      console.log("ws close");
    });

    this.ws.addEventListener("error", () => {
      console.log("ws error");
    });
  }

  send(data) {
    this.ws.send(data);
  }

  close() {
    this.ws.close();
  }
}
