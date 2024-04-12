/* 
语音合成tcp：生成数据包
*/
import iconv from 'iconv-lite'

 
/**
 * 生成16进制摄像头命令
 * @param {string} str 原字符串
 * @param {string} format 转换类型
 * @return {Buffer} 转换后的Buffer
 */
function get16(str,format){
    let gbkb = "gbk"
    if(format==2){
        gbkb='big5'
    }
    var gbkBytes = iconv.encode(str,gbkb);
    if(format==3){
        gbkBytes=getBuf(stringToHex(str))
        // console.log(gbkBytes)
    }
    //贞头
    let head = getBuf(['fd'])

    //数据长度
    let getlen = Buffer.alloc(2);
    getlen.writeInt16BE(gbkBytes.length+3,0)

    //命令字，命令参数
    let parameter = getBuf(['01',format])
    

    //拼接
    const totalLength = head.length+ getlen.length + parameter.length + gbkBytes.length
    const ret = Buffer.concat([head,getlen,parameter,gbkBytes], totalLength);

    //异或
    let yh;
    for(let i = 0;i<Buffer.byteLength(ret);i++){
        yh ^= ret[i]
    }
    yh = getBuf([yh.toString(16)])

    //拼接2
    const totalLength2 = ret.length + yh.length
    const ret2 = Buffer.concat([ret,yh], totalLength2);
    
    // console.log(ret2)
    return ret2
}

/**
 * 生成16进制显屏语音合成命令
 * @param {string} str 原字符串
 * @return {Buffer} 转换后的Buffer
 */
function getAudio16(str){
    // 数据gbk
    let gbkBytes = iconv.encode(str,"gbk");
    //包头
    let head = getBuf(['FD']);
    //数据长度
    let getlen = Buffer.alloc(2);
    getlen.writeInt16BE(gbkBytes.length+2,0)
    //固定格式
    let fixed = getBuf(['01','01']);
    //拼接
    let totalLength = head.length+ getlen.length + fixed.length + gbkBytes.length;
    let ret = Buffer.concat([head,getlen,fixed,gbkBytes], totalLength);

    return ret;
}

/**
 * 生成16进制显屏 (临时)
 * @param {string} str 原字符串
 * @param {int} line 屏显行数
 * @param {int} color_num 颜色  1:红色、2：绿色、3：黄色
 * @return {Buffer} 转换后的Buffer 
 */
function getScreenReveal16(str,line,color_num){
    // 行号 控制字1
    let line_num = Buffer.alloc(1,line);
    //控制字2
    let controls2 = Buffer.alloc(1,0);
    // 颜色 控制字3 1:红色、2：绿色、3：黄色
    let color = Buffer.alloc(1,color_num);
    //控制字4 预留
    let controls4 = Buffer.alloc(1,0);

    //数据gbk
    let gbkBytes = iconv.encode(str,"gbk");//stringToHex(str);
    //合并数据和控制字
    let data = Buffer.concat([line_num,controls2,color,controls4,gbkBytes], line_num.length+controls2.length+color.length+controls4.length+gbkBytes.length);

    //包头
    let head = getBuf(['AA','55']);
    //流水
    let water = getBuf(['32']);
    //地址
    let address = getBuf(['64']);
    //业务类型
    let type = getBuf(['00']);
    //命令
    let cmd = getBuf(['27']);
    //长度
    let getlen = Buffer.alloc(2);
    getlen.writeInt16BE(data.length,0);

    //密码
    let cipher = getBuf(['00','00']);
    //结束符
    let end = getBuf(['AF']);

    // 获取校验值
    let verify_data = Buffer.concat([water,address,type,cmd,getlen,data,cipher], water.length+address.length+type.length+cmd.length+getlen.length+data.length+cipher.length);
    let verify_str = calculateCRC16Modbus(verify_data.toString('hex')); //校验值
    let verify_buffer = Buffer.from(verify_str, 'hex');

    //拼接
    let totalLength = head.length + water.length + address.length + type.length + cmd.length + getlen.length + data.length + verify_buffer.length + end.length;
    let ret = Buffer.concat([head,water,address,type,cmd,getlen,data,verify_buffer,end], totalLength);

    return ret;
}

/**
 * 生成16进制显屏 (广告)
 * @param {string} str 原字符串
 * @param {int} line 屏显行数
 * @param {int} color_num 颜色  1:红色、2：绿色、3：黄色
 * @return {Buffer} 转换后的Buffer 
 */
function getScreenReveal16Forever(str,line,color_num){
    // 行号 控制字1
    let line_num = Buffer.alloc(1,line);
    // 颜色 控制字2 1:红色、2：绿色、3：黄色
    let color = Buffer.alloc(1,color_num);
    //控制字3 预留
    let controls3 = Buffer.alloc(1,0);

    //数据gbk
    let gbkBytes = iconv.encode(str,"gbk");//stringToHex(str);
    //合并数据和控制字
    let data = Buffer.concat([line_num,color,controls3,gbkBytes], line_num.length+color.length+controls3.length+gbkBytes.length);

    //包头
    let head = getBuf(['AA','55']);
    //流水
    let water = getBuf(['32']);
    //地址
    let address = getBuf(['64']);
    //业务类型
    let type = getBuf(['00']);
    //命令
    let cmd = getBuf(['25']);
    //长度
    let getlen = Buffer.alloc(2);
    getlen.writeInt16BE(data.length,0);

    //密码
    let cipher = getBuf(['00','00']);
    //结束符
    let end = getBuf(['AF']);

    // 获取校验值
    let verify_data = Buffer.concat([water,address,type,cmd,getlen,data,cipher], water.length+address.length+type.length+cmd.length+getlen.length+data.length+cipher.length);
    let verify_str = calculateCRC16Modbus(verify_data.toString('hex')); //校验值
    let verify_buffer = Buffer.from(verify_str, 'hex');

    //拼接
    let totalLength = head.length + water.length + address.length + type.length + cmd.length + getlen.length + data.length + verify_buffer.length + end.length;
    let ret = Buffer.concat([head,water,address,type,cmd,getlen,data,verify_buffer,end], totalLength);

    return ret;
}


/**
 * 取消临显 
 * @param {int} options 每一行行数对应是否取消该行临显 
 * @return {Buffer} 转换后的Buffer 
 */
function cancelTemporaryDisplay(options){

    // 创建一个字节，用于存储位信息
    let byte = 0;
    // 设置每一位的状态
    for (let i = 0; i < 4; i++) {
        // 如果选项对象中包含了对应行的取消选项，并且该选项为 true，则将对应位设置为 1
        if (options[i] === true) {
            byte |= (1 << i);
            console.log(byte);
        }
    }
    // 创建一个 Buffer 对象，用于存储字节
    let data = Buffer.alloc(1);
    data.writeUInt8(byte, 0);
  
    //包头
    let head = getBuf(['AA','55']);
    //流水
    let water = getBuf(['32']);
    //地址
    let address = getBuf(['64']);
    //业务类型
    let type = getBuf(['00']);
    //命令
    let cmd = getBuf(['21']);
    //长度
    let getlen = Buffer.alloc(2);
    getlen.writeInt16BE(data.length,0);

    //密码
    let cipher = getBuf(['00','00']);
    //结束符
    let end = getBuf(['AF']);

    // 获取校验值
    let verify_data = Buffer.concat([water,address,type,cmd,getlen,data,cipher], water.length+address.length+type.length+cmd.length+getlen.length+data.length+cipher.length);
    let verify_str = calculateCRC16Modbus(verify_data.toString('hex')); //校验值
    let verify_buffer = Buffer.from(verify_str, 'hex');

    //拼接
    let totalLength = head.length + water.length + address.length + type.length + cmd.length + getlen.length + data.length + verify_buffer.length + end.length;
    let ret = Buffer.concat([head,water,address,type,cmd,getlen,data,verify_buffer,end], totalLength);
    console.log(ret);
    return ret;
}



/**
 * 十六进制数组转buf
 * @param {array} array 十六进制数组
 * @return {Buffer} Buffer
 */
function getBuf(array){
    var hex_array = array.map(el=>parseInt(el, 16))
    var uarray = new Uint8Array(hex_array)
    var buf = Buffer.from(uarray)
    return buf
}

 
/**
 * 生成十六进制数组
 * @param {string} str 原字符串
 * @return {array} 十六进制数组
 */
function stringToHex(str){
    var val=[];
    for(var i = 0; i < str.length; i++){
        if(val.length==0){
            val.push(str.charCodeAt(i).toString(16)[0]+str.charCodeAt(i).toString(16)[1]);
            val.push(str.charCodeAt(i).toString(16)[2]+str.charCodeAt(i).toString(16)[3]);
        }else{
            val.push(str.charCodeAt(i).toString(16)[0]+str.charCodeAt(i).toString(16)[1]);
            val.push(str.charCodeAt(i).toString(16)[2]+str.charCodeAt(i).toString(16)[3]);
        }
    }
    return val;
}

// CRC-16/MODBUS校验位 计算
function calculateCRC16Modbus(dataHexString) {
    const dataBytes = [];
    // 补零
    for (let i = 0; i < dataHexString.length; i += 2) {
        dataBytes.push(parseInt(dataHexString.substr(i, 2), 16));
    }
    let crc = 0xFFFF;
    const polynomial = 0xA001;  // This is the polynomial x^16 + x^15 + x^2 + 1
    for (const byte of dataBytes) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x0001) {
                crc = ((crc >> 1) ^ polynomial) & 0xFFFF;
            } else {
                crc >>= 1;
            }
        }
    }
    // 格式化输出，补零到4位
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export {get16,getAudio16,getScreenReveal16,getScreenReveal16Forever,cancelTemporaryDisplay}