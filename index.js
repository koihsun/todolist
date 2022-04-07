const http = require("http");
const { v4: uuidv4 } = require("uuid");

const { errHandle, okHandle } = require("./responseHandle");

let data = [];

const requestListener = (request, response) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
  };

  let rawData = '';
  request.on('data', (chunk) => { rawData += chunk; });

  if (request.url === "/todos" && request.method === "GET") {
    okHandle(response, data);
  } else if (request.url === "/todos" && request.method === "POST") {
    request.on('end', () => {
      try {
        const { title } = JSON.parse(rawData);
        if (title) {
          data.push({
            title: title,
            id: uuidv4()
          })
          okHandle(response, data);
        } else {
          errHandle(response);
        }
      } catch (e) {
        errHandle(response);
      }
    });
  } else if (request.url === "/todos" && request.method === "DELETE") {
    data.length = 0;
    okHandle(response, data);
  } else if (request.url.startsWith("/todos/") && request.method === "DELETE") {
    const arr = request.url.split('/');

    if (arr.length != 3) {
      errHandle(response);
    } else {
      const index = arr.pop()
      const id = data.findIndex(item => item.id === index)

      if (id !== -1) {
        data.splice(id, 1);
        okHandle(response, data);
      }
      else
        errHandle(response);
    }
  } else if (request.url.startsWith("/todos/") && request.method === "PATCH") {
    const arr = request.url.split('/');
    if (arr.length != 3) {
      errHandle(response);
    } else {
      const index = arr.pop()
      const id = data.findIndex(item => item.id === index)

      if (id !== -1) {
        request.on('end', () => {
          try {
            const { title } = JSON.parse(rawData);
            if (title) {
              data[id].title = title;
              okHandle(response, data);
            } else {
              errHandle(response);
            }
          } catch (e) {
            errHandle(response);
          }
        });
      }
      else
        errHandle(response);
    }
  } else if (request.url === "/todos" && request.method === "OPTIONS") {
    okHandle(response, [])
  } else {
    response.writeHead(404, headers);
    response.write('網頁不存在');
    response.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);