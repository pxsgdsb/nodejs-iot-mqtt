/* 
工具函数封装
*/


// 获取日期 （1999-12-30）
function getDate(){
    let myDate = new Date();
    return myDate.getFullYear() + "-" + (myDate.getMonth()+1) + "-" + myDate.getDate()
}


/**
 * 车牌识别摄像头：生成Buffer数据包
 * @param {number} len 长度
 * @param {string} data 指令信息
 */
function getData16(len,data){
    let vz = Buffer.from('VZ')
    let other = [0,0,0,0,0,0];
    other[2] += ((len >>24) & 0xFF);
    other[3] += ((len >>16) & 0xFF);
    other[4] += ((len >>8) & 0xFF);
    other[5] += (len & 0xFF);
    other = Buffer.from(other)
    //拼接
    const totalLength = vz.length + other.length + data.length
    const ret = Buffer.concat([vz,other,data], totalLength);
    return ret;
}

//车牌识别摄像头：生成Buffer心跳包
function getHeartbeat(){
    let heartbeat1 = Buffer.from("VZ")
    let heartbeat2 = Buffer.from([1,0,0,0,0,0])
    //拼接
    const totalLength = heartbeat1.length + heartbeat2.length
    const ret = Buffer.concat([heartbeat1,heartbeat2], totalLength);
    return ret
}

export {
   getDate,getData16,getHeartbeat
};