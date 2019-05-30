/**
 * @this  *Zyh->基站配置
 * @param MSG->协议返回数据 
 * @versions  *1.0 
 */
var analysis={
    info:{},
    init:function(data){
        var msg=data;
        this.analysisFun(msg)
        console.log(this.info)
        return this.info
    },
    analysisFun:function(msg){
        console.log(msg.toString('hex', 1, 2))
        if(msg.toString('hex', 1, 2) == '41'){
			// 命令字 *- 41 ==>基站基本属性
			this.info.zoneno = msg.toString('hex', 2, 4);// 转换进制 组号
			this.info.baseNo = msg.toString('hex', 4,6);// 转换进制 基站标识
			this.info.distance = msg.toString('hex',6,8);// 转换进制 距离
			this.info.route = msg.toString('hex', 8, 9);// 转换进制  信道
            this.info.time = msg.toString('hex', 9,13);// 转换进制  时间参数补偿
            this.info.frequency = msg.toString('hex', 13, 14);// 转换进制  频率等级
            this.info.power = msg.toString('hex', 14, 15);// 转换进制  功率登记
        }else
        if(msg.toString('hex', 1, 2) == '42'){
            //命令字 *- 42 ==>基站网络基本属性
            this.info.IP = msg.toString('hex', 2, 6);// 转换进制 IP
			this.info.MASK = msg.toString('hex', 6, 10);// 转换进制 基站MASK
			this.info.MAC = msg.toString('hex', 10,16);// 转换进制 基站MAC
			this.info.port = msg.toString('hex', 16,18);// 转换进制 基站端口号
			this.info.PCip = msg.toString('hex', 18, 22);// 转换进制  PCip
            this.info.PCPort = msg.toString('hex', 22, 24);// 转换进制  PCPort
            this.info.transmission = msg.toString('hex', 24, 25);// 转换进制  传输模式
        }
    }
}
var a=0x23
analysis.init(a)