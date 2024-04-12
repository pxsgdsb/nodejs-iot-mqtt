/* 
redis 封装
*/

import redis from "redis"
import {loggerRedis} from "./log.js"

/**
 * 创建REDIS连接
 */
export default class REDIS {
    // name: 需要连接redis用户名称
    constructor(name="") {
        return new Promise((resolve, reject) => {
            this.state = false
            this.client = redis.createClient(6379, '127.0.0.1', { auth_pass: '123456' });//auth_pass redis密码
            this.client.on('connect',async ()=> {
                loggerRedis.trace(name+":redis连接成功")
                this.name = name
                this.client.select(10, (dberr)=> {
                    if(dberr){
                        loggerRedis.trace(name+":redis 连接第10数据库失败",dberr)
                        reject(dberr)
                    }else{
                        loggerRedis.trace(name+":redis 连接第10数据库成功")
                        this.state = true
                        resolve(this)
                    }
                })
            })
            this.client.on("error", (err)=> {
                this.state = false
                loggerRedis.error(name+":redis 连接错误！",err)
                reject(err)
            });
        })
    }
    /**
     * 获取redis信息
     * @param {string} name 需要获取信息的key
     */
    get(name){
        return new Promise((resolve, reject) => {
            this.client.get(name,(err,data)=>{
                err?(loggerRedis.error(err),reject(err)):resolve(data)
            })
        })
    }
    /**
     * 设置redis
     * @param {string} name 需要设置的key
     * @param {string} val 需要设置的值
     */
    set(name,val){
        return new Promise((resolve, reject) => {
            this.client.set(name,val,(err,data)=>{
                err?(loggerRedis.error(err),reject(err)):resolve(data)
            })
        })
    }
    /**
     * 关闭redis连接
     */
    quit(){
        this.client.quit((err,data)=>{
            if(!err){
                loggerRedis.trace(this.name+":redis 已关闭")
            }
        })
    }
}



	
