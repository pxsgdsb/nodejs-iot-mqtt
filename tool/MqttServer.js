/**
 * 构建MQTT服务
 */
import mosca from "mosca" // 引入mosca库，用于构建mqtt服务器
// import REDIS from "./redis.js" // 引入redis
import {loggerMqttServer} from "./log.js" // 引入日志



/**
 * 创建mqtt服务类，并导出
 * @param {string} parameter.mtport mqtt服务端口
 * @param {array} parameter.wsport websocket服务端口
 */
export default class MQTT {
    constructor(parameter) {
        //构建mqtt服务器
        this.server = new mosca.Server({
            port: parameter.mtport ? parameter.mtport : false,
            http: parameter.wsport ? { port: parameter.wsport, bundle: true, static: './' } : false
        });
        // 监听mqtt连接成功
        this.server.on('ready', function () {
            loggerMqttServer.trace("MQTT服务器构建成功...")
        });
        /**
         * 身份验证 (redis,数据库) 
         * @param {object} client 客户端信息
         * @param {string} username 客户端连接时的用户名
         * @param {string} password 客户端连接时的密码
         * @param {function} callback 回调函数
         */
        this.server.authenticate = async (client, username, password, callback) => {
            if(typeof username == "undefined" || typeof password == "undefined"){
                loggerMqttServer.trace(client.id+"账号或密码为空！")
                callback(null,false)
                return;
            }
            // 连接 redis鉴权
            // try {
            //     let r = await new REDIS(client.id)
            //     let data = await r.get("user_"+username.toString())  // 获取redis内的用户数据，用于鉴权
            //     if(data){
            //         data = JSON.parse(data)
            //         // 验证redis鉴权，账号密码正确
            //         if(username.toString() === data.username && password.toString() === data.password){
            //             loggerMqttServer.trace(`redis鉴权,MQTT客户: ${client.id} 成功登录`)
            //             r.quit();
            //             callback(null,true)
            //         }else{
            //             // 账号密码错误
            //             loggerMqttServer.error(`redis鉴权,MQTT客户: ${client.id} 登录失败`)
            //             r.quit();
            //             callback(null,false)
            //         }
            //     }
            // } catch (error) {
            //     loggerMqttServer.error(`redis鉴权发生错误: ${error.message}`)
            //     callback(null,false)
            // }

            // 模拟鉴权通过
            if(username.toString() === "test" && password.toString() === "123456"){
                loggerMqttServer.trace(`模拟鉴权,MQTT客户: ${client.id} 成功登录`)
                callback(null,true)
            }else{
                loggerMqttServer.error(`模拟鉴权,MQTT客户: ${client.id} 登录失败`)
                callback(null,false)
            }
        }
        // 监听mqtt保持通话
        this.server.on('clientConnected', function (client) {
            loggerMqttServer.trace(`MQTT客户: ${client.id} 保持通话...`)

        });
        // 监听mqtt断开连接
        this.server.on('clientDisconnected', function (client) {
            loggerMqttServer.warn(`MQTT客户: ${client.id} 断开连接!`)
        });
        // 监听mqtt错误
        this.server.on('error', function (err) {
            loggerMqttServer.warn(`MQTT服务器错误!`,err.message)
        });
    }

    /**
     * 封装方法：监听主题消息
     * @param {function} fn 回调函数
     */
    listening(fn) {
        //监听主题 消息
        this.server.on('published',  (packet, client)=> {
            let topic = packet.topic;
            let message = packet.payload;
            if(client){
                fn(client.id,0,message.toString(),topic);
            }
        });
    }

    /**
     * 封装方法：发送mqtt消息
     * @param {string} theme 要发送的主题
     * @param {string} msg 消息内容
     */
    setMsg(theme, msg) {
        //发送消息
        this.server.publish({ topic: theme, payload: msg },function(){
            loggerMqttServer.trace(`MQTT 主题：${theme} ，消息: ${msg} 发送成功!`)
        });
    }
}



