/**
 * 构建TCP客户端
 */

 import net from 'net'
 import {getData16,getHeartbeat} from './tools.js'
 import {loggerTcpClient} from "./log.js"

/**
 * 创建TCP客户端，并导出
 * @param {string} parameter.port 端口
 * @param {string} parameter.ip ip
 * @param {Function} callback 回调
 */
 export default class TcpClient{
	constructor(parameter,callback) {
        this.client = net.Socket();
        this.client.connect(parameter.port, parameter.ip)
        this.isReconnection = true   // 是否开启重连
        this.isStorageErr = false   // 是否存储错误
        this.client.on('connect', ()=> {
            // console.log(this.client.address());
            this.isStorageErr = false;
            callback?callback():""
        });
        this.client.on('error', (err)=> {
            if(this.isReconnection){
                if(!this.isStorageErr){
                    loggerTcpClient.error(parameter.device_name+':tcp客户端与服务器连接错误!',err)
                    this.isStorageErr = true;
                }
            }
        });
        this.client.on('close', ()=> {
            if(this.isReconnection){
                loggerTcpClient.warn(parameter.device_name+':tcp客户端连接已关闭!准备重连')
                this.client.connect(parameter.port, parameter.ip)
            }
        });
        
        //2秒发送一次心跳包
        setInterval(()=>{
            this.client.write(getHeartbeat());
        }, 2000);
        
	}
    /**
     * 发送消息
     * @param {object} cmd 发送的命令消息
     * @param {Function} fn 回调
     */
    setMsg(cmd,fn){
        //向摄像头发送命令
        cmd = getData16(cmd.length,cmd)
        this.client.write(cmd,function(){
            fn()
        });
    }
    /**
     * 监听消息
     * @param {string} device_name 设备名称
     * @param {Function} fn 回调
     */
    getMsg(device_name,fn){
        this.client.on("data", function (data) {
            fn(device_name,data.toString())
        })
    }
   
}