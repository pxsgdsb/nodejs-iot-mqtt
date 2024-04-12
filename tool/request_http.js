/* 
http请求
*/

import https from "https"

/**
 * 发送 POST 请求
 * @param {string} host 
 * @param {string} url 
 * @param {object} data 请求传参
 * @returns {Promise} 包含响应数据的 Promise
 */
function apiPost(host,url,data) {

    // 将数据转换为 x-www-form-urlencoded 格式
    // const contents = querystring.stringify(data);

    // 将数据转换为 JSON 字符串
    const contents = JSON.stringify(data);

    let options = {
        host: host,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(contents)
            // 'X-Requested-With': 'XMLHttpRequest'
        }
    }
    return new Promise((resolve, reject) => {
        let req = https.request(options, function(res) {
            let responseData = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                responseData += chunk;
            });
            res.on('end', function() {
                resolve(responseData);
            });
        });
        req.on('error', function(error) {
            reject(error);
        });
        // 发送请求数据
        req.write(contents);
        // 结束请求
        req.end();
    });
}


export {
    apiPost
};