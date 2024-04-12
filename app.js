/* 
启动文件
*/

import MQTT from "./tool/MqttServer.js"     // 引入封装的 mqtt服务端库
import TcpClient from "./tool/TcpClient.js"  // 引入封装的 TCP客户端库
import {loggerMqttServer,loggerTcpClient} from "./tool/log.js"  // 引入日志操作
import validator from "validator"             // 引入验证器
// import {apiPost} from "./tool/request_http.js" 

// 创建 mqtt服务端
const mt = new MQTT({
    mtport:1883,   // mqtt 服务端口
    wsport:3001    // mqtt-websocket 服务端口
})

//创建 tcp客户端:(连接摄像头)
let ServerObj = {} // 缓存对象：存储 tcpServer设备(摄像头)

// let cameras = await db.query("SELECT * FROM ws_parking_passage WHERE device_type=1 AND status=1");  // 执行sql查询数据库 启用的摄像头列表
// 模拟数据库数据
let cameras = [{device_type: 1, status: 1, name: '测试车道', device_name: 'yanfa_test', device_ip: '192.168.14.100',mqtt_status: 0,status_time: null,rtsp_url: ''}];

for (const item of cameras) {
    // 循环创建 tcp客户端连接
    ServerObj[item.device_name] = new TcpClient({device_name:item.device_name,port:8131,ip:item.device_ip},function(){
        loggerTcpClient.trace(`摄像头 ${item.device_name} 连接成功`);
        // 监听摄像头返回结果
        ServerObj[item.device_name].getMsg(item.device_name,function(device_name,result){
            let data = result.slice(8)
            if(data.length>8){
                let msg = JSON.parse(data)
                // 控制台打印操作结果
                console.log(`${device_name}成功获取摄像头信息：`,msg);
            }
        })
    })
}

/**
 * 监听mqtt主题订阅
 * @param {string} name 用户名称
 * @param {string} insertId 报错日志到数据库后返回的id
 * @param {string} message 消息内容
 * @param {string} topic 主题
 */
mt.listening(function(name,insertId,message,topic){
    // 验证数据类型 是否为json
    if(validator.isJSON(message)){ //是
        message = JSON.parse(message)
        loggerMqttServer.trace(`${topic}主题收到MQTT客户 ${name} 的消息：${JSON.stringify(message)}`)
    }else{ // 否
        loggerMqttServer.trace(`${topic}主题收到MQTT客户 ${name} 的消息：${message}`)
    }
    
    // 监听指定主题发送的消息，进行处理
    switch(topic) {
        case "open":
            //监听'open'订阅，摄像头控制开关闸
            //消息格式：{"device_name":"yanfa_test","operate":"open","io":0}
            if(message.operate=="open"){
                let open = Buffer.from(`{"cmd":"ioctl_resp","id":${insertId},"io":${message.io},"value":2,"delay":500}`) // 生成Buffer类型操作命令
                if(ServerObj[message.device_name]){
                    // 发送操作命令
                    ServerObj[message.device_name].setMsg(open,function(){
                        loggerTcpClient.trace( message.device_name + " 摄像头 '开闸' 命令发送成功");
                    })
                }
            }
           break;
        case "get_hw_board_version":
            // 监听'get_hw_board_version'订阅，获取摄像头硬件版本信息
            // 消息格式：{"device_name":"yanfa_test","operate":"get_hw_board_version"}
            if(message.operate=="get_hw_board_version"){
                let open = Buffer.from(`{"cmd":"get_hw_board_version","id":${insertId}}`) // 生成Buffer类型操作命令
                // 发送命令
                if(ServerObj[message.device_name]){
                    // 发送操作命令
                    ServerObj[message.device_name].setMsg(open,function(){
                        loggerTcpClient.trace(message.device_name + " 摄像头 '获取摄像头硬件版本信息'"+`{"cmd":"get_hw_board_version","id":${insertId}}`+" 命令发送成功");
                    })
                }
            }
           break;
    } 
})

// 不限制监听数量
process.setMaxListeners(0)
