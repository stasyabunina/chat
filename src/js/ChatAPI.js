import createRequest from "./createRequest";

export default class ChatAPI {
  constructor(url) {
    this.url = url;
  }

  create(data, callback) {
    return createRequest({
      url: "https://" + this.url,
      method: "new-user",
      data,
      callback,
    });
  }
}
