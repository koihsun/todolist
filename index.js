// npm 內建的模組
const http = require('http')
// 外部套件
const { v4: uuidv4 } = require('uuid')
// 自己寫的錯誤處理模組
const errHandle = require('./errorHandle')

let todos = []

const requestListener = (req, res) => {
  const reqUrl = req.url
  const reqMethod = req.method
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
   'Content-Type': 'application/json'
 }

  // console.log(reqUrl);
  // console.log(reqMethod);

  let body = ''

  req.on('data', chunk => {
    body += chunk
  });

  if (reqUrl === '/' && reqMethod === 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      data: []
    }));
    res.end();

  } else if (reqUrl === '/todos' && reqMethod === 'GET') { // 查詢
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: 'success',
        data: todos
      }));
      res.end();
  } else if (reqUrl === '/todos' && reqMethod === 'POST') { // 新增
    req.on('end', ()=> {
      try {
        const title = JSON.parse(body).title
        console.log(title)

        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4()
          }
          todos.push(todo);
    
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: 'success',
            data: todos
          }))
          res.end();
        } else {
          errHandle(res);
        }
      } catch (error) {
        errHandle(res);
      }
    })
  } else if (reqUrl === '/todos' && reqMethod === 'DELETE') { // 刪除所有
    res.writeHead(200, headers);
    todos.length = 0
    res.write(JSON.stringify({
      status: 'success',
      data: todos,
      message: '刪除成功'
    }))
    res.end();
  } else if (reqUrl.startsWith('/todos/') && reqMethod === 'DELETE') { // 刪除單筆
    let id = reqUrl.split('/').pop();
    // console.log(id);
    let index = todos.findIndex(item => item.id === id)
    // console.log(index);

    if (index !== -1) {
      res.writeHead(200, headers);
      todos.splice(index, 1)

      res.write(JSON.stringify({
        status: 'success',
        data: todos,
        message: `刪除第${ index }筆成功`
      }));
      res.end();
    } else {
      errHandle(res);
    }
  } else if (reqUrl.startsWith('/todos/') && reqMethod === 'PATCH') { // 編輯單筆
    let id = reqUrl.split('/').pop();
    // console.log(id);
    let index = todos.findIndex(item => item.id === id)
    console.log(index);

    if (index !== -1) {
      req.on('end', () => {
        try {
          const title = JSON.parse(body).title

          if (title !== undefined) {
            res.writeHead(200, headers);
  
            todos[index].title = title
            res.write(JSON.stringify({
              status: 'success',
              data: todos[index],
              message: `編輯第${ index }筆成功`
            }));
  
            res.end();
          } else {
            errHandle(res);
          }
        } catch(error) {
          errHandle(res);
        }
      })
    } else {
      errHandle(res);
    }
  } else if (reqMethod === 'OPTIONS') { // 跨網域，會先問你
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(401, headers)
    res.write(JSON.stringify({
      status: 'fail',
      message: []
    }));
    res.end();
  }
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 3005)