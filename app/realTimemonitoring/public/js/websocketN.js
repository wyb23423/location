var webs = []
var webs2=[]
var times
var times=new Date().getTime();
var s;
onmessage=function (e) {
     s=e.data;
    var baseZone=eval("(" +s.data + ")");
    var hostIp=s.ip;
    for(var a=0;a<baseZone.length;a++){
        webs[a]=new WebSocket("ws://"+hostIp+":80/realtime/position/"+baseZone[a]+"/" +times);
        WebSocketTest(webs[a])
    }
}
var num=0
function WebSocketTest(webName) {
    console.log(webName)
    // 打开一个 web socket      
    webName.onopen = function () { // Web Socket 已连接上，使用 send() 方法发送数据
        webName.send("发送数据");
    };
    webName.onmessage = function (evt) {
        // console.log(webName)
        num++
       var stime=new Date().getTime()
       var Ad={
           data:evt.data,
           name:"当前线程ID数"+s+"当前时间"+stime+"当前条数"+num
       };
        
        postMessage(Ad)
    };
    webName.onclose = function () {
        console.log("连接已关闭...");
    };
}
