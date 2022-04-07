const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
};

function errHandle(response) {
    response.writeHead(400, headers);
    response.write(JSON.stringify({
        "status": "faill",
        "msg": "欄位未填寫正確，或 todo id不存在"
    }));
    response.end();
}

function okHandle(response, data) {
    response.writeHead(200, headers);
    response.write(JSON.stringify({
        "status": "success",
        "data": data
    }));
    response.end();
}

module.exports = { errHandle, okHandle }