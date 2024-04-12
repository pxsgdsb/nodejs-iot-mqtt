

import log4js from "log4js" // 引入log4js模块

// 配置日志类型
log4js.configure({
    appenders: {
        console: { type: 'console' }, // 添加控制台输出器
        MqttServer: { type: 'dateFile', filename: 'log/MqttServer/MqttServer', pattern: 'yyyy_MM_dd.log', alwaysIncludePattern: true },
        TcpServer: { type: 'dateFile', filename: 'log/TcpServer/TcpServer', pattern: 'yyyy_MM_dd.log', alwaysIncludePattern: true },
        TcpClient: { type: 'dateFile', filename: 'log/TcpClient/TcpClient', pattern: 'yyyy_MM_dd.log', alwaysIncludePattern: true },
        Redis: { type: 'dateFile', filename: 'log/Redis/Redis', pattern: 'yyyy_MM_dd.log', alwaysIncludePattern: true },
        Mysql: { type: 'dateFile', filename: 'log/Mysql/Mysql', pattern: 'yyyy_MM_dd.log', alwaysIncludePattern: true },
    },
    categories: {
        default: { appenders: ["console","MqttServer"], level: "trace" }, // "console" 同时输出到控制台和文件
        TcpServer: { appenders: ["console","TcpServer"], level: "trace" },
        TcpClient: { appenders: ["console","TcpClient"], level: "trace" },
        Redis: { appenders: ["console","Redis"], level: "trace" },
        Mysql: { appenders: ["console","Mysql"], level: "trace" },
    }
});

// 定义常量
const loggerMqttServer = log4js.getLogger("MqttServer");
const loggerTcpServer = log4js.getLogger("TcpServer");
const loggerTcpClient = log4js.getLogger("TcpClient");
const loggerRedis = log4js.getLogger("Redis");
const loggerMysql = log4js.getLogger("Mysql");

// 导出常量
export {
    loggerMqttServer,loggerTcpServer,loggerTcpClient,loggerRedis,loggerMysql
}

// logger.trace("跟踪");
// logger.debug("调试");
// logger.info("信息");
// logger.warn("警告");
// logger.error("错误");
// logger.fatal("致命的");