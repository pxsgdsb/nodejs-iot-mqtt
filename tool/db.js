/* 
mysql 函数封装
*/

import mysql from "mysql" // 引入mqtt库
import {loggerMysql} from "./log.js" // 引入日志库

export const db = {};

// 创建数据库连接池
let pool  = mysql.createPool({
  host: '', // 数据库地址
  user : '', // 数据库用户名
  password : '', // 数据库密码
  database : '', // 数据库名称
  multipleStatements: true,  // 允许执行多条语句
});

// 连接数据库
pool.getConnection(function(err, connection) {
    if(err){
        loggerMysql.error("数据库连接失败！",err.message)
    }else{
        loggerMysql.error("数据库连接成功！");
    }
});


/**
 * 封装执行sql方法
 * @param {string} sql sql
 * @param {array} valArr sql条件数组
 * @return {objct/array} sql执行结果
 */
db.query = function(sql,valArr){
    return new Promise((resolve, reject) => {
        if (!sql) {
            console.log("sql语句不能为空")
            reject();
        }
        pool.query(sql,valArr?valArr:[],function(err, rows, fields){
            if (err) {
                loggerMysql.error("sql执行错误：",sql)
                loggerMysql.error(err.message)
                reject(err);
                return;
            };
            resolve(rows);
        })
    })
}

// 监听数据库异常
process.on('uncaughtException', err => {
    loggerMysql.error('有一个未捕获的错误', err.message)
})
