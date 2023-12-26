const createRequest = async (options = { url, method, id, data, callback }) => {
  try {
    fetch(`${options.url}/${options.method}`, {
      method: "POST",
      body: JSON.stringify(options.data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        options.callback(data);
      });
  } catch (e) {
    throw new Error(e);
  }
};

export default createRequest;
