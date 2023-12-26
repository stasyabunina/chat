import ChatAPI from "./ChatAPI";
import WS from "./WS";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.url = "chat-backend-nf84.onrender.com";
    this.api = new ChatAPI(this.url);
  }

  init() {
    this.createModal();

    this.onNewUserAdded = this.onNewUserAdded.bind(this);
    this.onGetMessage = this.onGetMessage.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.onLogOut = this.onLogOut.bind(this);
  }

  createModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContainer = document.createElement("div");
    modalContainer.classList.add("modal__container");

    const title = document.createElement("h2");
    title.classList.add("modal__title");
    title.textContent = "Выберите псевдоним";

    const form = document.createElement("form");
    form.classList.add("modal__form");

    const input = document.createElement("input");
    input.classList.add("modal__input");

    const submitBtn = document.createElement("button");
    submitBtn.classList.add("modal__submit");
    submitBtn.textContent = "Продолжить";

    document.body.append(modal);
    modal.append(modalContainer);
    modalContainer.append(title);
    modalContainer.append(form);
    form.append(input);
    form.append(submitBtn);

    input.focus();

    this.modalElement = modal;
    this.modalInput = input;

    form.addEventListener("submit", (e) => this.onSubmitForm(e, input));
  }

  onNewUserAdded(data) {
    if (data.status === "error") {
      this.showError(data);
    } else {
      this.modalElement.remove();
      this.modalElement = null;
      this.modalInput = null;
      this.container.closest(".chat").classList.remove("hidden");
      this.createChat();
      this.currentUser = data.user;

      this.ws = new WS(this.onGetMessage);
      this.ws.init();
    }
  }

  onGetMessage(e) {
    const data = JSON.parse(e.data);

    if (Object.keys(data).indexOf("text") > -1) {
      this.renderMessage(data);
    } else {
      this.clearUsers();

      data.forEach((user) => {
        this.renderUser(user.name);
      });
    }

    console.log("ws message");
  }

  renderMessage(data) {
    const date = new Date(data.date);

    const li = document.createElement("li");
    li.classList.add("messages__item");

    const info = document.createElement("span");
    info.classList.add("messages__info");

    const message = document.createElement("p");
    message.classList.add("messages__text");
    message.textContent = data.text;

    this.messagesElement.append(li);
    li.append(info);

    if (data.userName === this.currentUser.name) {
      info.textContent = `You, ${date.getHours()}:${date.getMinutes()} ${date.getDate()}.${
        date.getMonth() + 1
      }.${date.getFullYear()}`;
      info.closest(".messages__item").classList.add("messages__item_right");
      info.classList.add("messages__info_right");
    } else {
      info.textContent = `${
        data.userName
      }, ${date.getHours()}:${date.getMinutes()} ${date.getDate()}.${
        date.getMonth() + 1
      }.${date.getFullYear()}`;
      info.closest(".messages__item").classList.add("messages__item_left");
    }

    li.append(message);
  }

  clearUsers() {
    this.container
      .querySelectorAll(".users__item")
      .forEach((item) => item.remove());
  }

  renderUser(name) {
    const li = document.createElement("li");
    li.classList.add("users__item");

    const username = document.createElement("span");
    username.classList.add("users__username");
    username.textContent = name;

    this.usersElement.append(li);
    li.append(username);
  }

  onSubmitForm(event) {
    event.preventDefault();
    if (
      this.modalInput.value.trim() === "" ||
      this.modalInput.value.trim().length > 15
    ) {
      this.showError();
      this.modalInput.focus();
    } else {
      const newUser = this.modalInput.value.trim();

      this.api.create({ name: newUser }, this.onNewUserAdded);
    }
  }

  showError(data) {
    if (this.error) {
      this.error.remove();
      this.error = null;
      this.modalInput.classList.remove("input_error");
    }

    const error = document.createElement("span");
    error.classList.add("modal__error");
    this.modalInput.classList.add("input_error");
    if (this.modalInput.value.trim() === "") {
      error.textContent = "The field can not be empty.";
    } else if (data.status === "error") {
      error.textContent = data.message;
    } else {
      error.textContent =
        "The username can not be more than 15 characters in length.";
    }
    this.modalInput.after(error);
    this.error = error;
  }

  createChat() {
    const main = document.createElement("main");
    main.className = "chat__messages messages";

    const aside = document.createElement("aside");
    aside.className = "chat__aside aside";

    const usersWrapper = document.createElement("div");
    usersWrapper.className = "chat__users users";

    const btnWrapper = document.createElement("div");
    btnWrapper.className = "aside__btn-wrapper";

    const logOutBtn = document.createElement("button");
    logOutBtn.classList.add("aside__btn");
    logOutBtn.type = "button";
    logOutBtn.textContent = "Log out";

    const messagesList = document.createElement("ul");
    messagesList.classList.add("messages__list");

    const usersList = document.createElement("ul");
    usersList.classList.add("users__list");

    const messagesForm = document.createElement("form");
    messagesForm.classList.add("messages__form");

    const messagesInput = document.createElement("input");
    messagesInput.classList.add("messages__input");
    messagesInput.placeholder = "Enter your message...";

    const messagesSubmitBtn = document.createElement("button");
    messagesSubmitBtn.className = "messages__submit visually-hidden";

    this.container.append(aside);
    this.container.append(main);

    aside.append(usersWrapper);
    aside.append(btnWrapper);
    btnWrapper.append(logOutBtn);
    usersWrapper.append(usersList);

    main.append(messagesList);
    main.append(messagesForm);
    messagesForm.append(messagesInput);
    messagesForm.append(messagesSubmitBtn);

    this.usersElement = usersList;
    this.messagesElement = messagesList;
    this.messagesInput = messagesInput;

    messagesForm.addEventListener("submit", this.onSendMessage);
    logOutBtn.addEventListener("click", this.onLogOut);
  }

  onLogOut() {
    const message = {
      user: this.currentUser,
      type: "exit",
    };

    this.ws.send(JSON.stringify(message));
    this.ws.close();

    this.clearChat();
    this.container.closest(".chat").classList.add("hidden");

    this.createModal();
  }

  clearChat() {
    this.container.querySelector(".chat__aside").remove();
    this.container.querySelector(".chat__messages").remove();
  }

  onSendMessage(e) {
    e.preventDefault();

    if (this.messagesInput.value.trim() === "") {
      this.showMessageError();
      this.messagesInput.focus();
    } else {
      if (this.error) {
        this.error.remove();
        this.error = null;
        this.messagesInput.classList.remove("input_error");
      }

      const message = {
        text: this.messagesInput.value,
        userName: this.currentUser.name,
        date: Date.now(),
        type: "send",
      };

      this.ws.send(JSON.stringify(message));
      this.messagesInput.value = "";
    }
  }

  showMessageError() {
    if (this.error) {
      this.error.remove();
      this.error = null;
      this.messagesInput.classList.remove("input_error");
    }

    const error = document.createElement("span");
    error.classList.add("messages__error");
    this.messagesInput.classList.add("input_error");
    error.textContent =
      "You need to write something first in order to send a message.";
    this.messagesInput.after(error);
    this.error = error;
  }
}
