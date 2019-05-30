/*
 *   label zyh2.0 
 * 		version 2.0
 * 		fenmap
 * 		jQuer
 * 		webscoket
 *     公用模块未转出  ：坐标值转换  地图显示 鼠标移入显示 数据接受显示标签    
 * */
var imgMarkerLayer = null;
var imgMarkerAry = [],
	arrlistdata = [];
var arrlistopen = false;;
var candrawCanvs={
	Cobj_:null,
	init:function(obj){
		this.Cobj_=obj;
		console.log(this.Cobj_)
	}
}
var heights = document.body.offsetHeight;
var gethttpdata = null;
$(".left_silde ").height(heights - 60);
$(".min").height(heights - 60)
//2014-06-18 10:33:24
var endTime = getNowFormatDate();
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}
//  lyui 时间控件
function startTime() {
	layui.use("laydate", function () {
		var laydate = layui.laydate;
		var ins = laydate.render({
			elem: '#test-limit1',
			type: 'datetime',
			format: "yyyy-MM-dd HH:mm:ss",
			min: '2000-4-14',
			max: '2023-10-11',
			ready: function () {
				ins.hint('请选择开始时间');
			}
		});
		var ins2 = laydate.render({
			elem: '#test-limit2',
			format: "yyyy-MM-dd HH:mm:ss",
			min: '2000-4-14',
			max: '2050-4-14',
			type: 'datetime',
			ready: function () {
				ins2.hint('只能选择三天时间段');
			}
		})
	})
}
//  时间html添加
function changeHtml() {
	var changeHtmls = `
				<ul>
						<li style="margin-bottom:15px ;">
							<div class="layui-inline" style="width: 100%;">
						      	<label class="layui-form-label" style="width: 30%;text-align: left;">开始日期：</label>
						      	<div class="layui-input-inline timebtn" style="width: 70%;padding-left: 10%;">
						        	<input type="text" class="layui-input timebtn" id="test-limit1" placeholder="yyyy-MM-dd">
						      	</div>
						    </div>
						   
						</li>
						<li>
							<div class="layui-inline" style="width: 100%;">
						      <label class="layui-form-label" style="width: 30%;text-align: left;">结束日期：</label>
						       <div class="layui-input-inline timebtn" style="width: 70%;padding-left: 10%;">
						         <input type="text" class="layui-input timebtn" id="test-limit2" placeholder="yyyy-MM-dd">
						      </div>
						    </div>
						   
						</li>
					</ul>    
				
				`
	return changeHtmls
}
// 获取标签数据
var taganames;

function getTgadata() {
	$.ajax({
		type: "get",
		url: "http://192.168.1.202/api/tag/getall",
		data: {
			currentPage: 1,
			pageSize: 10000
		},
		async: true,
		success: function (red) {
			var cityhtml;
			var arr = red.pagedData.datas
			console.log(arr.length)
			taganames = arr;
			for (var a = 0; a < arr.length; a++) {
				cityhtml = `
							<option value="${arr[a].tagNo}" data-tid="${arr[a].id}">${arr[a].tagNo}</option>
						`
				console.log(cityhtml)
				$("#typeOne").append(cityhtml)
			}

			$('.demo').fSelect();
		}
	});
}
//  开启轨迹与关闭轨迹
layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form,
		layer = layui.layer,
		layedit = layui.layedit,
		laydate = layui.laydate;
	form.on('switch(switchTest)', function (data) {
		console.log(this.checked)
		if (this.checked == true) {
			drawLines()
		} else {
			alert("关闭")
		}
	});

});

var alist = 0;
var taglineslist = []

function drawLines() {
	var tagnames;
	for (var a = 0; a < taganames.length; a++) {

		var arrlist = tagGrouping(gethttpdata, taganames[a].tagNo);
		console.log(arrlist)
		taglineslist.push(arrlist)
	}
	dataPacket(taglineslist)
}

function arrNum(arr) {
	setTimeout(function () {
		packetLines(arr, arr.length)
	}, 200)
}
var dataPacketArr = [];
var flistnum = 0;
var datapacketArr = {
	flist: null,
	lastDat: null,
	init: function (data) {

		if (flistnum == 0) {
			this.flistFun(data)
			flistnum++
		} else {
			flistnum++
			this.lastFun(data)
		}

		if (flistnum == taglineslist[0].length) {

			arrNum(dataPacketArr)
			//						
		}
	},
	flistFun: function (data) {
		var tagx = data.x,
			tagy = data.y,
			z = data.z;
		var locd = coodXy(tagx, tagy, 1)
		this.flist = {
			x: parseFloat(locd.x),
			y: parseFloat(locd.y),
			z: parseFloat(data.z),
		}
		dataPacketArr.push(this.flist)
	},
	lastFun: function (data) {
		var tagx = data.x,
			tagy = data.y,
			z = data.z;
		var locd = coodXy(tagx, tagy, 1)
		this.lastDat = {
			x: parseFloat(locd.x),
			y: parseFloat(locd.y),
			z: parseFloat(locd.z),
		}
		if (this.lastDat.x - this.flist.x > 4 || this.lastDat.y - this.flist.y > 4 || this.lastDat.z - this.flist.z > 4) {
			if (this.lastDat.x - this.flist.x < 5 || this.lastDat.y - this.flist.y < 5 || this.lastDat.z - this.flist.z < 5) {
				dataPacketArr.push(this.lastDat)
			}
		}
		//				console.log(flistnum==taglineslist.length)
	}
}
var setDate = 0;
var setTime

function clrIntervalTime(datalist) {
	window.clearInterval(setTime);

}

function packetLines(data, flistnums) {
	var datalist = data
	console.log(flistnums)
	setTime = setInterval(function () {
		if (setDate > flistnums) {
			clrIntervalTime()
		}
		var newdata = datalist.slice(setDate, setDate + 21)
		naviResult(newdata)
		setDate += 20;
	}, 1000)
}

function getNewTime() {
	var myDate = new Date();
}

function dataPacket(dataObj) {
	for (var a = 0; a < dataObj.length; a++) {
		for (var i = 0; i < dataObj[a].length; i++) {
			datapacketArr.init(dataObj[a][i])
		}
	}
}

var naviLines = [];
// 判断地方是否初始化成功

// 获取回放数据
function httpget(startTime, endTime, did) {
	var url = "../get_http",
		startTime = startTime,
		endTime = endTime;
	did = did;
	var selectArr = $(".demo").val();
	$.ajax({
		type: "post",
		url: "http://192.168.1.202/api/tag/queryTagHistory",
		contentType: "application/json; charset=utf-8",
		dataType: 'json',
		data: JSON.stringify({
			"endTime": endTime,
			"startTime": startTime,
			"tagNos": selectArr
		}),
		success: function (red) {
			var datas = red.pagedData.datas;
				var data = []

				for(var a = 0; a < datas.length; a++) {
					var jsonMSgArr = [
						datas[a].sTagNo, datas[a].position[0], datas[a].position[1], datas[a].position[2]
					]
					data.push(jsonMSgArr)
				}
				gethttpdata = data;
				playback(gethttpdata)
		}
	});
}

//  layui 模态框弹出层
layui.use('layer', function () { //独立版的layer无需执行这一句

	var $ = layui.jquery,
		info = "请选择回放时间",
		layer = layui.layer; //独立版的layer无需执行这一句
	//触发事件
	var htmls = changeHtml()
	var active = {
		notice: function () {
			var that = this;
			layer.open({
				type: 1,
				title: info, //不显示标题栏
				closeBtn: false,
				area: '300px;',
				shade: 0.8,
				id: 'LAY_layuipro' //设定一个id，防止重复弹出
				,
				btn: ['火速围观', '残忍拒绝'],
				btnAlign: 'c',
				moveType: 1 //拖拽模式，0或者1
				,
				content: htmls,
				success: function (layero) {
					var btn = layero.find('.layui-layer-btn');
					btn.find('.layui-layer-btn0').click(function () {
						var startTime = $("#test-limit1").val(),
							endTime = $("#test-limit2").val();
						httpget(startTime, endTime, 1)
					});
				}
			});
		}
	};
	$('.timebtn').on('click', function() {
		var othis = $(this),
			method = othis.data('method');
		active[method] ? active[method].call(this, othis) : '';
		startTime()
	});

});

// 时间插件 
var playTime

function playback(data) {
	playTime = data.length - 1;
	console.log(playTime)
	$.playBar.addBar($('.test'), 200 * playTime); //第一个参数是需要显示播放器的容器，第二个参数为时间，单位毫秒
	$.playBar.Stop();
}
//  数据队列

function playbackimg(time, data) {
	var index = time;
	if(data[index]==undefined){
		$(".contral").find("img").attr("src", "../../../public/image/play.png");
			$.playBar.Stop();
			action = true;
			clearInterval(setimg)
	}else{
		console.log(data[index][2]<0 || data[index][3]<0)
		if(data[index][2]<0 || data[index][3]<0){
			return false;	
		}else{
			var C_x=parseFloat(data[index][2])+560,C_y=parseFloat(data[index][3])+450;
			var jsonMSgArr=[data[index][1],C_x,C_y,data[index][0]]
			candrawCanvs.Cobj_.addimglist.init(jsonMSgArr, 1)
		}
		
	}
}
var time = 0
var action = true;
var setimg;
var newnumss
$(function () {
	$('.contral').click(function () {
		var nums = $("#newTime").html();
		newnumss = parseInt(nums);
		if (action) {
			$.playBar.Begin();
			action = false;
			$(this).find("img").attr("src", "../../../public/image/stop.png")
			if(changeType==true){
					var nowtime = changeNum(gethttpdata);
					time = nowtime
			}
			setimg = setInterval(function () {
				var nums = $("#newTime").html();
				if (changeType == true) {
					var nowtime = changeNum(newTimeHms);
					time = nowtime
				}
				else{
					
				}
				playbackimg(time, gethttpdata)
				time++
			}, 200)
		} else {
			$(this).find("img").attr("src", "../../../public/image/play.png");
			$.playBar.Stop();
			action = true;
			clearInterval(setimg)
		}
	});
	//				$.playBar.addBar($('.test'), 1000 * 60); //第一个参数是需要显示播放器的容器，第二个参数为时间，单位毫秒
	$.playBar.changeBarColor("#72dfff"); //设置进度条颜色
	$.playBar.Stop();
});