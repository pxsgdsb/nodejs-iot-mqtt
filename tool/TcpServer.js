/**
 * 构建TCP服务端
 */

import net from 'net'
import {get16} from './buf16.js'
import {loggerTcpServer} from "./log.js"

/**
 * 创建TCP服务，并导出
 * @param {string} parameter.port 端口
 * @param {Function} callback 回调
 */
export default class TCP{
	constructor(parameter,callback) {
        this.socketList = {} //存储 socket对象
        this.server = net.createServer();
        this.server.listen(parameter.port, function(){
            loggerTcpServer.trace("TCP服务器构建成功...")
        })
        this.server.on("close", function () {
            loggerTcpServer.warn("TCP服务器关闭")
        })
        this.server.on('error', function(err){
            loggerTcpServer.error("TCP服务器错误",err)
        });
        //监听新的连接
        this.server.on('connection', (socket)=>{
            //监听消息
            socket.on("data",(data)=>{
                data = data.toString()
                if(data[0] == "@"){
                    if(!this.socketList[data.slice(1)]){
                        loggerTcpServer.trace("tcp客户: "+data.slice(1)+"连接成功！")
                        socket.name = data.slice(1)
                        this.socketList[data.slice(1)] = socket;
                        let win = get16('连接成功','01')
                        socket.write(win)
                    }else{
                        loggerTcpServer.warn("tcp客户: "+data.slice(1)+"连接名重复！")
                    }
                }else{
                    callback?callback(socket.name?socket.name:null,data):""
                }
            })
            socket.on("error",err=>{
                delete this.socketList[socket.name]
                loggerTcpServer.warn(`tcp客户 ${socket.name} 错误，成功踢出！`,err)
                socket.destroy()
            })
            socket.on("close",err=>{
                loggerTcpServer.warn(`tcp客户 ${socket.name} 断开连接！`)
                delete this.socketList[socket.name]
            })
            
        });
	}
    /**
     * 发送消息
     * @param {string} name 设备名称
     * @param {string} msg 消息内容
     */
    setMsg(name,msg){
        //发送消息
        if(this.socketList[name]){
            this.socketList[name].write(msg)
        }else{
            loggerTcpServer.warn(`发送消息失败，tcp客户 ${name} 不存在！`)
        }
    }
}
