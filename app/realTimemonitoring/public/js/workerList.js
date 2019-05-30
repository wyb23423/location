
    var workerlist=[];
    var times
    var times=new Date().getTime();
    function uniq(array) {
        var temp = []; //一个新的临时数组
        for(var i = 0; i < array.length; i++) {
            if(temp.indexOf(array[i]) == -1) {
                temp.push(array[i]);
            }
        }
        return temp;
    }
    // 数组中每个元素出现的次数
    function getindex(str) {
        var map = {};
        for(var i = 0; i < str.length; i++) {
            var s = str[i];
            var r = map[s];
            if(r) {
                map[s] += 1;
            } else {
                map[s] = 1;
            }
        }
        return JSON.stringify(map)
    }
    var anchors = []

    function groupList(data) {
        var groupArr = []
        var anchorArr = []
        for(var a = 0; a < data.length; a++) {
            groupArr.push(data[a].groupCode)
            anchorArr.push(data[a].baseNo)
            groupArr.sort()
        }
        anchorArr = getindex(groupArr)
        anchorArr = eval("(" + anchorArr + ")");
        groupArr = uniq(groupArr)
        for(var i = 0; i < groupArr.length; i++) {
            anchors.push(groupArr[i])
        }
        return anchors

    }
    function basearrlist() {
		var urls = "/api/base/getall"
		$.ajax({
			type: "get",
			url: urls,
			async: true,
			data: {
				currentPage: 1,
				pageSize: 10000,
			},
			success: function (red) {
               var info= groupList(red.pagedData.datas)
               info=JSON.stringify(info);
               workerMsg(info)
			}
		});
    }
    basearrlist()
    function workerMsg(data){
        
            console.log(window.location.host);
            var hostSty=window.location.host
           for(var a=0;a<1;a++){
               var s={
                   d:a,
                   data:data,
                   ip:hostSty
               }
               workerlist[a]=new Worker("../public/js/websocketN.js");
               workerlist[a].postMessage(s)
               workerFun(workerlist[a])
           }
    }
    function workerFun(s) {
        
        s.onmessage=function (evt) { 
            var sa=evt.data.data;
            // console.log(sa)
            getwebsocket(sa)
         }
    }
    setTimeout(function () {
       
    }, 0)
