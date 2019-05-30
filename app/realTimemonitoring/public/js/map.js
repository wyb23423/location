/*
 *   label zyh2.0 
 * 		version 2.0
 * 		fenmap
 * 		jQuer
 * 		webscoket
 *     公用模块未转出  ：坐标值转换  地图显示 鼠标移入显示 数据接受显示标签    
 * */
/**
 * when I wrote this, only God and I understood what I wa doying
 * Now ,God noly knows
 */
var map;
var imgMarkerLayer = null;
var imgMarkerAry = [],
	arrlistdata = [];
var textMarkerAry = [];
// 点击事件ID
var eventID = null;
var popMarker = null;
var arrlistopen = false;
var animation = false;
//var im;
var jump;
var zonelist;

var anchardatas, showAnchor, Textlayer;
// window.onload = function () {
var fmapID = 'huijinguangchang';
//				var addmap=	 setTimeout(function(){
var urls = $("#myheaderimg").attr("src");
map = new fengmap.FMMap({
	//渲染dom
	container: document.getElementById('fengMap'),
	//地图数据位置
	mapServerURL: '../../../public/data/huijinguangchang/',
	//主题数据位置
	mapThemeURL: '../../../public/data/theme',
	//设置主题
	defaultThemeName: 'huijinguangchang',
	// 默认比例尺级别设置为20级
	defaultMapScaleLevel: 22,
	//开启2维，3维切换的动画显示
	defaultViewMode: fengmap.FMViewMode.MODE_2D,
	viewModeAnimateMode: true,
	//开发者申请应用下web服务的key
	key: '83a75157d56ffe85317ed7ba1e8120ff',
	//开发者申请应用名称
	appName: 'hunjingguanchang',
	// mapScaleRange: [200, 4000],？
});

//打开Fengmap服务器的地图数据和主题
map.openMapById(fmapID);
// 
map.gestureEnableController.enableMapHover = true;

map.on('mapClickNode', function (event) {
	if (event.nodeType == fengmap.FMNodeType.IMAGE_MARKER) {
		var coord = event.eventInfo.coord,
			gid = event.groupID;
		console.log(event.datas.taginfo[0].name)
		if (event.datas.type == 2) {
			var name = "基站" || '未登记';
			var idnum = event.datas.taginfo[0].name || '未登记';

			addPopWin(coord, gid, name, idnum);
		} else {
			var name = event.name_ || '未登记';
			var idnum = event.datas[0].tagNo || '未登记';
			removePopWin();
			addPopWin(coord, gid, name, idnum);
			popwinInfo(event.datas[0], idnum)
		}


	} else {
		setTimeout(function () {
			removePopWin();
		}, 5000)
	}
});
map.on('loadComplete', function () {
	tagAnchor()
})

function groupList(data) {
	var groupArr = []
	var anchorArr = []
	for (var a = 0; a < data.length; a++) {
		groupArr.push(data[a].groupCode)
		anchorArr.push(data[a].baseNo)
		groupArr.sort()
	}
	anchorArr = getindex(groupArr)
	anchorArr = eval("(" + anchorArr + ")");
	groupArr = uniq(groupArr)

	return groupArr

}

function tagAnchor() {
	var anchar = null;
	var urls = "/api/base/getall"
	$.ajax({
		type: "get",
		url: urls,
		data: {
			currentPage: 1,
			pageSize: 10000,
		},
		success: function (red) {
			anchardatas = red.pagedData.datas
			showAnchor(red.pagedData.datas);
			var groupLists = groupList(red.pagedData.datas);
			addgrouplist(groupLists)
		}
	});

	return anchar
}

function addgrouplist(arr) {
	for (var o = 0; o < arr.length; o++) {
		var htmls = `
				<tr data-id="${arr[o]}">	
					<td>
						${arr[o]}
					</td>
					<td>
						<a class="layui-btn layui-btn-danger layui-btn-xs clickgroud " data-datalist="${arr[o]}" data-show="1"  lay-event="del">关闭分组</a>
					</td>
				</tr>
			`
		$("#gourdbastbodylist").append(htmls)
	}

}
$(".gourdbas").hide();

function uniq(array) {
	var temp = []; //一个新的临时数组
	for (var i = 0; i < array.length; i++) {
		if (temp.indexOf(array[i]) == -1) {
			temp.push(array[i]);
		}
	}
	console.log(temp)
	return temp;
}
var showAnchor = function (data) {
	for (var a = 0; a < data.length; a++) {
		var coord = {
			x: data[a].coordx,
			y: data[a].coordy,
			z: data[a].z
		}
		var coord = coodXy(data[a].coordx, data[a].coordy)
		var name = data[a].baseNo;
		var groupid = data[a].groupCode;
		var name = {
			name: name,
			groupid: groupid
		}
		taginfo = [name]
		addTextMarkers(1, coord, taginfo)
		addMarker(1, coord, taginfo, true, 2)
	}
}

var nums = 0
//添加文字标注
function addTextMarkers(gid, mapCoord, taginfo) {
	var name = taginfo[0].name
	var group = map.getFMGroup(map.groupIDs[0]);
	if (group.getOrCreateLayer == null) {} else {
		//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
		Textlayer = group.getOrCreateLayer('textMarker');
	}
	var gpos = group.mapCoord;
	//图标标注对象，默认位置为该楼层中心点
	tm = new fengmap.FMTextMarker({
		x: mapCoord.x,
		y: mapCoord.y - 1,
		z: 50,
		height: 2,
		name: name,
		data: taginfo,
		//填充色
		fillcolor: "#009688",
		//字体大小
		fontsize: 15,
		type: 1,
		//边框色
		strokecolor: "255,255,0",
		callback: function () {
			// 在图片载入完成后，设置 "一直可见"
			tm.alwaysShow();
		}
	});
	//文本标注层添加文本Marker
	Textlayer.addMarker(tm);
	textMarkerAry.push(tm)
};
//图片标注
function addMarker(gid, coord, taginfo, img = null, type = 1) {

	map.gestureEnableController.enableMapHover = true;
	var group = map.getFMGroup(gid);
	var tagname = taginfo[0].name;
	var tag_no = taginfo[0].tagNo;
	//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建

	var group = map.getFMGroup(map.groupIDs[0]);
	//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建

	if (group == null) {
		return false;
	} else {
		if (imgMarkerLayer == null) {
			imgMarkerLayer = group.getOrCreateLayer('imageMarker');
		}
		var imgurs;
		if (
			taginfo[0].type == 1
		) {
			imgurs = taginfo[0].photo
			size = 48
		} else {
			imgurs = taginfo[0].photo
			size = 48
		}
		if (img !== null) {
			imgurs = "../../../public/image/anchor.png"
			size = 32
		}
		var taginfo = taginfo;

		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height: 0.5,
			url: imgurs,
			size: size,
			name: tagname,
			data_: {
				taginfo,
				type: type
			},

			tagNo: tag_no,
			callback: function () {
				im.alwaysShow();
				if (animation) {
					jump = im.jump({
						times: 0,
						duration: 1,
						delay: 0.5,
						height: 1
					});
				}
				im.datas = {
					taginfo: taginfo,
					type: type
				}
			}
		});
		//					imgMarkerLayer.removeAll()
		imgMarkerLayer.addMarker(im);
		var D_ = new Date();
		timestamps = D_.getTime();
		imgMarkerAry.push(im)
	}
};
var showtype = true;
$("body").on("click", ".clickgroud", function () {
	var showtype = $(this).attr("data-show");

	if (showtype == true) {
		var groupnum = $(this).data("datalist");
		for (var a = 0; a < imgMarkerAry.length; a++) {
			if (imgMarkerAry[a].datas.type == 2) {
				if (imgMarkerAry[a].datas.taginfo[0].groupid == groupnum) {

					imgMarkerLayer.removeMarker(imgMarkerAry[a])
				}
			}
		}
		for (var i = 0; i < textMarkerAry.length; i++) {
			if (textMarkerAry[i].opts_.data[0].groupid == groupnum) {
				console.log(layer)
				Textlayer.removeMarker(textMarkerAry[i])
			}
		}
		$(this).attr("data-show", 0)
		$(this).html("打开分组").removeClass("layui-btn-danger")
	} else {
		var newanchro = []
		var groupnum = $(this).data("datalist");
		for (var j = 0; j < anchardatas.length; j++) {
			if (anchardatas[j].groupCode == groupnum) {
				newanchro.push(anchardatas[j])
			}
		}
		showAnchor(newanchro);
		$(this).attr("data-show", 1).html("关闭分组").addClass("layui-btn-danger")
	}

})
// 获取数据库标签
function tagGet(tag_no) {
	var tag_no = tag_no;
	var taginfo;
	var urls = "/api/tag/getall"
	$.ajax({
		type: "get",
		url: urls,
		data: {
			currentPage: 1,
			pageSize: 10,
			tagNo: tag_no
		},
		success: function (red) {
			taginfo = red
		}
	});
	return taginfo.pagedData.datas
}
// 获取摄像头列表
var camear = [];
// 报警
function tagImgChange(tagno) {
	for (var a = 0; a < imgMarkerAry.length; a++) {

		if (imgMarkerAry.datas[0].tagNo == tagno) {
			animation = true
			if (imgMarkerAry.datas[0].type == 1) {
				imgurs = "../../../public/image/P2.png";
				imgMarkerAry.jump({
					times: 0,
					duration: 1,
					delay: 0.5,
					height: 10
				});
				imgMarkerAry.url = imgurs
				settagChange(imgMarkerAry, 1)
			} else {
				imgurs = "../../../public/image/F2.png";
				imgMarkerAry.jump({
					times: 0,
					duration: 1,
					delay: 0.5,
					height: 10
				});
				imgMarkerAry.url = imgurs
				settagChange(imgMarkerAry, 2)
			}

		}
	}
}
// 改变图片
function settagChange(obj, num) {

	setTimeout(function () {
		if (num == 1) {
			imgurs = "../../../public/image/P.png"
			obj.url = imgurs

		} else {
			imgurs = "../../../public/image/F.png"
			obj.url = imgurs

		}
	}, 10000)
}
// 获取地图
function getcamearlist() {
	var urls = "/api/camera/getall"
	$.ajax({
		type: "get",
		url: urls,
		data: {
			currentPage: 1,
			pageSize: 100,
		},
		success: function (red) {
			if (red.pagedData !== null) {
				camear = red.pagedData.datas;
			}


		}
	});
}
getcamearlist()

var getHeartTime = 0;
// webSocket 获取长连接数据
var err = null
var num = 0;

var newtime;
var timestamps

function getRemainderTime(timestamps, newtime) {
	var s1 = newtime,
		s2 = timestamps,
		runTime = parseInt((s2 - s1));
	var second = runTime;
	return second
}
obj = {

}
// websocket 初始化
function getwebsocket(evt) {
	if (map == undefined) {
		alert("地图为初始化成功，请重试")
	} else {

		if (evt) {
			if (num == 1) {
				var D_ = new Date();
				timestamps = D_.getTime();
			}
			num++
			var second = timestamps - newtime
			var received_msg = evt;
			jsonMSg = eval("(" + received_msg + ")");
			// console.log(jsonMSg)
			if (jsonMSg.length == 1) {} else {
				var x = jsonMSg.position[0],
					y = jsonMSg.position[1],
					z = jsonMSg.position[0],
					sGroupNo = jsonMSg.sGroupNo;
				if (x < 0 || y < 0 || z < 0) {
					err = jsonMSg
					return false
				} else {
					fortag(jsonMSg.sTagNo)
					tagfor[0].name = jsonMSg.sTagNo;
					tumble(jsonMSg.alarm, jsonMSg.sTagNo)
					if (tagfor.length == 0) {

					} else {
						camera(sGroupNo, jsonMSg.sTagNo)
						tagfor[0].iBbattery = jsonMSg.iBbattery
						var jsonMSgArr = [
							jsonMSg.sTagNo, jsonMSg.position[0], jsonMSg.position[1], jsonMSg.position[2], tagfor
						]
						if (heartType == true) {
							getHeartTime += 200;
							var d = new Date();
							var dTime = d.getSeconds()
							var headet = Getheart(80, 100)
							if (tagNo == jsonMSg.sTagNo) {
								if (getHeartTime % 1000 == 0) {
									var heartDate = headet;
									if (heartDate > 200 || heartDate < 50) {

									} else {

										addData(heartDate)
									}

								}
							}
						}

						arrlistdata.init(jsonMSgArr, 1)

					}
				}

			}
		}

	}
}
var a = 1
var webs = []
// 悬浮框
function popInfo(name, x, y) {
	var that = $("." + name);
	var widths = $(that).width();
	$("." + name).css({
		left: x - widths / 2 - 16 / 2,
		top: y + 10
	})
}

function Getheart(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return (Min + Math.round(Rand * Range));
}
// 心跳数据、
var heartDate = [];
$("#errorDat").hide()

function addData(shift) {
	heartDate.push(shift);
	if (heartDate.length > 11) {
		heartDate.shift()
	}
	$("#heartNum").html(shift)
	getHeartDat(heartDate)
}
// 心跳
function getHeartDat(datalist) {
	var heart = datalist;
	option = {
		xAxis: {
			type: 'category',
			data: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
		},
		yAxis: {
			type: 'value'
		},
		series: [{
			data: heart,
			type: 'line'
		}]
	};

	myChart.setOption(option)
}
var heartType = false;
var myChart;
// 心跳弹出
$("#heart").click(function () {
	heartType = true;
	var heatHtml = "<div id=\"heatInfo\">\n\t\t\t<div id=\"heatName\" class=\"clearfix\">\n\t\t\t\t<div id=\"heatImg\" class=\"col-xs-4\">\n\t\t\t\t\t<img src=\"" + tagimgUrl + "\" />\n\t\t\t\t</div>\n\t\t\t\t<div id=\"heatTag\" class=\"col-xs-8\" style=\"padding-left: 15px;\">\n\t\t\t\t\t<p>\u59D3\u540D\uFF1A" + tagsname + "</p>\n\t\t\t\t\t<p>\u7F16\u53F7\uFF1A" + tagNo + "</p>\n\t\t\t\t\t<p>\u6240\u5C5E\u90E8\u95E8\uFF1A" + department + "</p>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\t\t\t<div id=\"\" class=\"clearfix\" style=\"margin-top:33px;position: relative;\">\n\t\t\t<div id=\"errorDat\" style=\"\n\t\t\t    position: absolute;\n\t\t\t    top: 0;\n\t\t\t    left: -15px;\n\t\t\t    width: 109%;\n\t\t\t    height: 303px;\n\t\t\t    text-align:  center;\n\t\t\t    justify-content:  center;\n\t\t\t    line-height:  300px;\n\t\t\t    background: #ddd;\n\t\t\t    background-color: #33333396;\n\t\t\t    color:  #fff;\n\t\t\t    font-size: 22px;\n\t\t\t\">\n\t\t\t    \t<p>\u5FC3\u8DF3\u6570\u636E\u9519\u8BEF\uFF0C\u5173\u95ED\u91CD\u8BD5</p>\n\t\t\t    </div>\n\t\t\t\t<hr class=\"style-two\" />\n\t\t\t\t<div id=\"hearimg\">\n\t\t\t\t\t<img src=\"../public/image/heartRate.png\" />\n\t\t\t\t\t<span id=\"heartNum\">测试中</span>\n\t\t\t\t</div>\n\t\t\t\t<p class=\"heatTitle\">\u5B9E\u65F6\u5FC3\u7387\u67E5\u770B</p>\n\t\t\t\t<div id=\"zoneEchart\" style=\"height: 300px\">\n\t\t\t\t\t\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>";
	getHeartbeat(tagNo)
	layer.open({
		title: '心跳数据',
		content: heatHtml,
		offset: 'rt',
		shade: 0,
		area: ['400px', '600px'],
		success: function (layero, index) {
			$("#errorDat").hide()
			var tagNum = "B0000001";
			var getHeatDatUrl = ".."
			myChart = echarts.init(document.getElementById('zoneEchart'));
			var option = {
				xAxis: {
					type: 'category',
					data: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
				},
				yAxis: {
					type: 'value'
				},
				series: [{
					data: [],
					type: 'line'
				}]
			};
			myChart.setOption(option);

		}
	});

})

// 整理数据
arrlistdata = { // 
	"flistdata": null,
	dataArr: [],
	// 用来装标签数据的数组
	keyarr: [],
	keytag: null,
	keyadddata: function (key) {
		var i = this.keyarr.indexOf(key);
		if (~i) {
			return this.keytag = this.keyarr[i];
		}

		return false;
	},
	flistnum: false, //判断是否为第一次进入的数据， 
	init: function (data, currentGid) {
		var time = new Date().getTime();
		if (this.flistnum == false) {
			this.flistadddata(data, currentGid)
		} else {
			this.nextadddata(data, currentGid)
		}
	},
	flistadddata: function (data, currentGid) { // 将第一次进入的数据存在数组
		this.dataArr.push(data);
		this.keyarr.push(data[0])
		this.flistnum = true
	},
	nextadddata: function (data, currentGid) { //假如当前标签数据为第二次进来，将这次标签的数据与第一次进来的数据进行对比，如果相同则改变相同数组的值等于这次进来的数据，   后续进来数据同理

		var newdataname = data[0];
		var thistag = this.keyadddata(newdataname);
		if (thistag != false) {
			for (var j = 0; j < this.dataArr.length; j++) {
				if (this.dataArr[j][0] == thistag) {
					this.dataArr[j] = data
				}
			}
		} else {
			this.dataArr.push(data);
			this.keyarr.push(data[0])
		}
		var currentGid = currentGid;
		if (currentGid != -1) {
			canaddimg(data, currentGid)
		}
	}
}
var jop,
	department,
	tagsname,
	sex,
	tagimgUrl,
	tagNo;
$("#tagInfo").hide()
$("#colose").click(function () {
	$("#tagInfo").hide()
})

// 鼠标移入弹出信息
function popwinInfo(datainfo, idnum) {
	//		console.log(datainfo)
	jop = datainfo.zone,
		department = datainfo.department,
		tagsname = datainfo.name,
		tagimgUrl = datainfo.avatar,
		sex = datainfo.sex,
		tagNo = idnum;
	for (var a = 0; a < zonelist.length; a++) {
		if (jop == zonelist.id) {
			jop = zonelist.name
		}
	}
	if (sex == 1) {
		sex = "男"
	} else if (sex == 2) {
		sex = "女"
	}
	$("#tagInfo").show()
	$("#avatarImg").attr("src", tagimgUrl);
	$(".tagnames").html("姓名：" + tagsname);
	$(".tagsex").html("性别：" + sex)
	$(".tagnNo").html("编号：" + "<span id='tagNum'>" + tagsname + "</span>")
	$(".tagJop").html(jop)
	$(".iBbattery").html(datainfo.iBbattery)
	$(".tagdepartment").html(department)
}
var alarmType = false;
$("#playLogin").click(function () {
	//		var thistagNum=$("#tagInfo").find("#tagNum");
	alarmType = true
})
// 判断摄像头位置区域变化
var flistcamera, lastcamera;

function camera(tagzone, tagno) {
	var tagnum = $("#tagNum").html();
	if (alarmType == true) {
		if (tagnum == undefined || tagnum != tagno) {
			return false
		} else {
			camerazone.init(tagzone)
		}
	}

}
// 摄像头
function openCamera(tagzone) {
	var alarm = tagzone;
	for (var a = 0; a < camear.length; a++) {
		if (tagzone == camear.groupCode) {
			var camearIp = camear.ip,
				camearPort = camear.port,
				camearUsername = camear.username,
				camearPwd = camear.password;

			cameraOpen(camearIp, camearPort, camearUsername, camearPwd)
		}
	}
}
//layui 关闭弹出框
function layuiClose() {
	layer = layui.layer; //独立版的layer无需执行这一句
	layer.closeAll();
}
// 实时更新判断zone 是否变化
var camerazone = {
	flistzone: null,
	lastzone: null,
	types: 0,
	that: null,
	clicktypes: 0,
	init: function (zones) {
		if (this.clicktypes == 0) {
			this.flistfuns(zones)
			this.clicktypes = 1;
		} else {
			this.lastfuncs(zones)
		}
	},
	flistfuns: function (zones) {
		this.flistzone = zones;
		openCamera(zones)
	},
	lastfuncs: function (zones) {
		this.lastzone = zones;

		if (this.lastzone == this.flistzone) {
			return false
		} else {
			layuiClose()
			this.flistzone = zones;
			openCamera(zones)
		}
	}
}
// 摄像头调用 
function cameraOpen(camearIp, camearPort, camearUsername, camearPwd) {
	var $ = layui.jquery,
		layer = layui.layer; //独立版的layer无需执行这一句
	//触发事件
	layer.open({
		type: 2 //此处以iframe举例
			,
		title: '摄像头',
		area: ['80%', '90%'],
		shade: 0,
		resizeL: true,
		maxmin: true,
		offset: "auto",
		content: './sonhtml/baojin.html',

		yes: function () {
			layer.closeAll();
		},
		zIndex: layer.zIndex //重点1
			,
		resizing: function (layero, index) {},
		success: function (layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.fun();
			iframeWin.clickLogin(camearIp, camearPort, camearUsername, camearPwd)
		},
		cancel: function (index, layero) {
			layer.close(index);
			$("#playLogin").removeClass("btn-primary")
			alarmType = false;
			camerazone.clicktypes = 0
			return false;
		}
	});
}
var iferrorHeart = {
	flist: 0,
	last: 0,
	num: 1,
	init: function (heart) {
		if (this.num == 1) {
			if (heart != 47) {
				this.flistfun(heart)
			}
		}
	},
	flistfun: function (heart) {
		this.flist = heart
	},
	lastfun: function (heart) {
		if (heart - this.heart < 30 || this.heart - heart > 30) {

		} else {

		}
	}
}
var inininista = 1
//  获取实时心跳数据
function getHeartbeat(tagNo) {

	var urls = "/api/tag/requestHeartRate"; // 心跳数据接口
	// 需要参数：ip, port(端口),cmd(控制命令),tagNo(标签编号)  （端口号为配置固定端口号 不用上传） 
	var tagIP, tagPort, tagCmd, tagNo
	$.ajax({
		type: "get",
		url: urls,
		data: {
			tagNo: tagNo
		},
		success: function (red) {

		}
	});
}

var haskeyarr = {
	keyarr: [],
	keytag: null,
	keyadddata: function (key) {
		// console.log(this.keyarr)
		for (var i = 0; i < this.keyarr.length; i++) {
			if (key == this.keyarr[i][0]) {
				return this.keytag = this.keyarr[i]
			}
		}
		return false
	},
}

function canaddimg(arr, currentGid) {
	// console.log(arr)
	// for (var a = 0; a < arr.length; a++) {
	var group = map.getFMGroup(map.groupIDs[0]);
	if (group !== null) {
		if (imgMarkerAry.length < 1) {
			haskeyarr.keyarr.push(arr);
			var taginfo = arr[4];
			zuobiao(arr[1], arr[2], arr[3], currentGid, taginfo)
		} else {
			var hasnum = haskeyarr.keyadddata(arr[0]);
			if (hasnum !== false) {
				for (var o = 0; o < imgMarkerAry.length; o++) {
					var imgMarkeraryname = imgMarkerAry[o].opts_.name;
					var hasnumName = hasnum[4][0].name;
					if (imgMarkeraryname == hasnumName) {
						if (imgMarkerAry[o].datas == undefined) {
							return false;
						} else {
							var names = hasnumName;
							var rood = coodXy(arr[1], arr[2], currentGid);
							var coord = {
								groupID: 1,
								x: rood.x,
								y: rood.y,
								z: 0
							};
							imgMarkerAry[o].moveTo({
								x: coord.x,
								y: coord.y,
								name: names,
								callback: function () {
									var time = new Date().getTime();

								},
								update: function (obj) {
									var pt3 = map.coordMapToScreen(obj.x, obj.y)
									popInfo(this.name, pt3.x, pt3.y)
								}
							})
						}

					}
				}

				for (var o = 0; o < textMarkerAry.length; o++) {
					var textMarkerAryName = textMarkerAry[o].opts_.name;
					var hasnumName = hasnum[4][0].name;
					if (textMarkerAryName == hasnumName) {

						var rood = coodXy(arr[1], arr[2], currentGid);
						//											
						var coord = {
							groupID: 1,
							x: rood.x,
							y: rood.y,
							z: 0
						};
						textMarkerAry[o].moveTo(coord)
						textMarkerAry[o].x = coord.x;
						textMarkerAry[o].y = coord.y
					}
				}
			} else {
				var taginfo = arr[4]
				haskeyarr.keyarr.push(arr);
				zuobiao(arr[1], arr[2], arr[3], currentGid, taginfo)

			}
		}
	}
	// }
}
// 坐标转换 数据坐标转换fengmap坐标系统
function zuobiao(tagX, tagY, tagZ, currentGid, taginfo) {

	var taginfo = taginfo;
	if (taginfo == undefined) {

	} else {
		var tag_x = parseFloat(tagX);
		var tag_y = parseFloat(tagY);
		var currentGid = currentGid;
		var trasformer = new CoordTransformer();

		var locOrigion = {
			'x': 0,
			'y': 0
		}; //定位坐标原点
		var locRange = {
			'x': 3073,
			'y': 2326
		}; //定位范围
		//根据定位四个角点的地图坐标点
		var mapParas = [];
		mapParas[0] = { //定位原点地图坐标
			'x': 11582810.7716, //11582810.6969
			'y': 3575751.7814 //3575751.9700
		};
		mapParas[1] = { //X轴终点地图坐标
			'x': 11582841.6422,
			'y': 3575751.7814
		};
		mapParas[2] = { //定位原点对角点地图坐标
			'x': 11582841.6422,
			'y': 3575775.2670
		};
		mapParas[3] = { //Y轴终点地图坐标
			'x': 11582810.7716,
			'y': 3575775.2670
		};
		trasformer.init(locOrigion, locRange, mapParas);
		//定位系统中的定位坐标
		var loc = {
			'x': tag_x,
			'y': tag_y
		}; //定位原点测试
		console.log(loc)
		//转换后的地图坐标
		var mapCoord = trasformer.transform(loc);
		var currentGid = currentGid;
		if (currentGid != -1) {
			addMarker(currentGid, mapCoord, taginfo)
			//addTextMarkers(currentGid,mapCoord,taginfo)
		}
	}
}

function coodXy(tagX, tagY, tagz, currentGid) {
	// 单位为厘米
	//		console.log(tagX)
	var tag_x = parseFloat(tagX);
	var tag_y = parseFloat(tagY);
	var currentGid = currentGid;
	var trasformer = new CoordTransformer();
	//来至定位系统的参数 定位的原点坐标 已经定位的范围
	var locOrigion = {
		'x': 0,
		'y': 0
	}; //定位坐标原点
	var locRange = {
		'x': 3062,
		'y': 2302
	}; //定位范围
	//根据定位四个角点的地图坐标点
	var mapParas = [];
	mapParas[0] = { //定位原点地图坐标
		'x': 11582810.7716, //11582810.6969
		'y': 3575751.7814 //3575751.9700
	};
	mapParas[1] = { //X轴终点地图坐标
		'x': 11582841.6422,
		'y': 3575751.7814
	};
	mapParas[2] = { //定位原点对角点地图坐标
		'x': 11582841.6422,
		'y': 3575775.2670
	};
	mapParas[3] = { //Y轴终点地图坐标
		'x': 11582810.7716,
		'y': 3575775.2670
	};
	trasformer.init(locOrigion, locRange, mapParas);
	//定位系统中的定位坐标

	var loc = {
		'x': tag_x,
		'y': tag_y
	}; //定位原点测试
	//		console.log(loc)
	//转换后的地图坐标
	//		// 更换(loc)
	var mapCoord = trasformer.transform(loc);
	mapCoord.z = tagz;
	return mapCoord
}


//  工具栏 工具功能 
var aBtn = document.querySelectorAll('.btn');
//开启2维模式
aBtn[0].onclick = function () {
	//设置地图为2维模式
	map.viewMode = fengmap.FMViewMode.MODE_2D;
	this.classList.add('btn-primary');
	aBtn[1].classList.remove('btn-primary');
};
//开启3维模式
aBtn[1].onclick = function () {
	console.log(132)
	//设置地图为3维模式
	map.viewMode = fengmap.FMViewMode.MODE_3D;
	this.classList.add('btn-primary');
	aBtn[0].classList.remove('btn-primary');
};
aBtn[3].onclick = function () {
	layer = layui.layer; //独立版的layer无需执行这一句
	if ($(this).hasClass('btn-primary')) {
		$(this).removeClass('btn-primary');
		layer.closeAll();
	} else {
		this.classList.add('btn-primary');
		layer.open({
			type: 2,
			offset: 'rb',
			area: ['600px', '345px'],
			shade: 0,
			title: "下发协议",
			content: 'sonhtml/biaoqian.html' //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
		});
	}
};
aBtn[4].onclick = function () {
	layer = layui.layer; //独立版的layer无需执行这一句
	var that = $(this)
	if ($(this).hasClass('btn-primary')) {
		$(this).removeClass('btn-primary');
		layer.closeAll();
	} else {
		this.classList.add('btn-primary');
		layer.open({
			type: 2,
			offset: 'rb',
			area: ['500px', '250px'],
			shade: 0,
			title: "标签统计",
			content: 'sonhtml/dianziweilan.html', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
			cancel: function (index, layero) {
				if (confirm('确定要关闭么')) { //只有当点击confirm框的确定时，该层才会关闭
					layer.close(index)
					that.removeClass('btn-primary');
				}
				return false;
			}
		});
	}
}
var groudpnclick = 0
aBtn[5].onclick = function () {
	$(".gourdbas").hide();
	if (groudpnclick == 0) {
		$(this).html("关闭分组列表").addClass(" btn-primary");
		$(".gourdbas").show()
		groudpnclick = 1
	} else {
		$(this).html("显示分组列表").removeClass(" btn-primary");
		groudpnclick = 0
		$(".gourdbas").hide()
	}
}
var removePopWin = function () {
	if (popMarker) {
		popMarker.close();
		popMarker = null;
	}
}

function opfiram() {

}
var addPopWin = function (coord, gid, txt, idnum) {
	//信息框控件大小配置
	var ctlOpt = new fengmap.controlOptions({
		mapCoord: {
			//设置弹框的x轴
			x: coord.x,
			//设置弹框的y轴
			y: coord.y,
			height: 1, //控制信息窗的高度
			//设置弹框位于的楼层
			groupID: gid
		},
		//设置弹框的宽度
		width: 180,
		//设置弹框的高度
		height: 80,
		//marginTop: 10,
		//设置弹框的内容
		content: '<div><p>姓名：' + txt + '</p><p>编号：' + idnum + '</p><div>',
		closeCallBack: function () {
			//信息窗点击关闭操作
			// alert('信息窗关闭了！');
		}
	});
	//添加弹框到地图上
	popMarker = new fengmap.FMPopInfoWindow(map, ctlOpt);
};

//获取区域信息
$.ajax({
	type: "get",
	url: "/api/zone/getall",
	data: {
		"currentPage": 1,
		"pageSize": 1000
	},
	success: function (data) {
		zonelist = data.pagedData.datas;
		addZon(zonelist)
	}
});

function addZon(datalist) {
	for (var a = 0; a < datalist.length; a++) {
		var enable = datalist[a].enable;
		if (enable == 1) {
			enable = "开启"
		} else {
			enable = "关闭"
		}
		var name = datalist[a].name;
		var id = datalist[a].id;
		var htmls = `
				<tr data-id="${id}">						
						<td>${name}</td>
					<td>
						${enable}
					</td>
					<td>
						<a class="layui-btn layui-btn-danger layui-btn-xs clickZone " data-datalist="${datalist[a].id}"  lay-event="del">打开区域</a>
					</td>
				</tr>
		`
		$("#tbodylist").append(htmls)
	}
};
$("body").on("click", ".clickZone", function () {
	var zoneid = $(this).data("datalist")
	for (var a = 0; a < zonelist.length; a++) {
		if (zonelist[a].id == zoneid) {
			$(this).html("关闭区域")
			var zoneindex = zoneOpenArr.indexOf(zoneid);
			var name = zonelist[a].name
			if (zoneindex == -1) {
				zoneOpen(zonelist[a])
			} else {
				$(this).html("打开区域")
				zoneOpenArr.splice(zoneindex, 1)

				removerLayui(name)
			}
		}
	}
})

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}
// 报警信息弹出
function tumble(tumbleAlarm, tagno) {
	//		console.log(tumbleAlarm)
	if (tumbleAlarm.length < 2) {
		return false
	} else {
		var getNowFormatDates = getNowFormatDate();
		var tumblealarm = {
			alarmMsg: "请注意" + tumbleAlarm + "报警",
			alarmTime: getNowFormatDates,
			baseNo: null,
			id: 0,
			type: tumbleAlarm,
			tagNo: tagno
		}
		var tumblealarms = [];
		tumblealarms.push(tumblealarm)
		// alarm(tumblealarms)
	}
}
setInterval(function () {
	$.ajax({
		type: "get",
		url: "/api/alarm/getall",
		data: {
			"currentPage": 1,
			"pageSize": 1000
		},
		success: function (data) {
			var alarminfo = data.pagedData.datas;
			if (alarminfo.length == 0) {

			} else {
				tagImgChange(alarminfo[0].tagNo)
			}

			alarm(alarminfo)
		}
	});
}, 5000)

function alarm(alarmInfo) {
	layer = layui.layer; //独立版的layer无需执行这一句
	if (alarmInfo.length == 0) {
		return false;
	} else {

		if (alarmInfo[0].tagNo == "000000071") {
			return false
		} else {
			var alarminfo = alarmInfo[0];
			var taginfo, zoneinfo;
			for (var a = 0; a < tagarrlists.length; a++) {

				if (alarminfo.tagNo == tagarrlists[a].tagNo) {

					taginfo = tagarrlists[a]
				}
			}
			for (var a = 0; a < zonelist.length; a++) {

				if (taginfo.zone == zonelist[a].id) {
					zoneinfo = zonelist[a]

				}

			}
			//				console.log("报警")
			var alarmHtml = "\n\t\t\t\t\t\t<div id=\"heatInfo\">\n\t\t\t\t\t\t\t<div id=\"heatName\" class=\"clearfix\">\n\t\t\t\t\t\t\t\t<div id=\"heatImg\" class=\"col-xs-4\">\n\t\t\t\t\t\t\t\t\t<img src=\"" + taginfo.avatar + "\">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div id=\"heatTag\" class=\"col-xs-8\" style=\"padding-left: 15px;\">\n\t\t\t\t\t\t\t\t\t<p>\u59D3\u540D\uFF1A" + taginfo.name + "</p>\n\t\t\t\t\t\t\t\t\t<p>\u7F16\u53F7\uFF1A" + alarminfo.tagNo + "</p>\n\t\t\t\t\t\t\t\t\t<p>\u57FA\u7AD9\u7F16\u53F7\uFF1A" + alarminfo.baseNo + "</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div id=\"\" class=\"clearfix\" style=\"margin-top:33px;position: relative;\">\n\t\t\t\n\t\t\t\t\t\t\t\t<hr class=\"style-two\" style=\"margin-bottom: 20px;\">\n\t\t\t\t\t\t\t\t<div class=\"alarmlist\">\n\t\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t\t<li>\u6240\u5C5E\u533A\u57DF\uFF1A" + zoneinfo.name + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u6240\u5C5E\u90E8\u95E8\uFF1A" + taginfo.job + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u4FE1\u606F\uFF1A" + alarminfo.type + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u65F6\u95F4\uFF1A" + alarminfo.alarmTime + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u5185\u5BB9\uFF1A" + alarminfo.alarmMsg + "</li>\n\t\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t";
			layer.open({
				title: '报警弹出框',
				content: alarmHtml,
				offset: 'rt',
				shade: 0,
				area: ['400px', '600px'],
				success: function (layero, index) {

				}
			});
		}
	}
}
var layerPolygonMaker

function removerLayui(names) {

	for (var a = 0; a < textMarker.length; a++) {

		if (names == textMarker[a].name_) {
			layers.removeMarker(textMarker[a]);
			layers.removeMarker(textMarker[a]);
		}
	}
	for (var a = 0; a < createPolygonMakerArr.length; a++) {
		if (names == createPolygonMakerArr[a].params.o3d.name) {
			layerPolygonMaker.removeMarker(createPolygonMakerArr[a]);
			layerPolygonMaker.removeMarker(createPolygonMakerArr[a]);
		}
	}

}

// 显示区域
$(".zoneCont").hide()
var zoneopnclick = 0;
$("#zoneOpen").click(function () {
	if (zoneopnclick == 0) {
		$("#zoneOpen").html("关闭区域列表").addClass(" btn-primary");
		$(".zoneCont").show()
		zoneopnclick = 1
	} else {
		$("#zoneOpen").html("显示区域列表").removeClass(" btn-primary");
		zoneopnclick = 0
		$(".zoneCont").hide()
	}
})
// 区域
var zoneOpenArr = []

function zoneOpen(data) {
	zoneOpenArr.push(data.id)
	var list;
	var zonlistarr = [];
	var Alist = [];
	var zones = data.position;
	zones = eval("(" + zones + ")");

	createPolygonMaker(zones, data.name)
	addTextMarker(zones[0], data.name)

}
// 添加区域
function GetRandomNum(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return (Min + Math.round(Rand * Range));
}
// 随机颜色
var colorArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function random(min, max) {
	if (isNaN(min) || isNaN(max)) {
		return null;
	}
	if (min > max) {
		min ^= max;
		max ^= min;
		min ^= max;
	}
	return (Math.random() * (max - min) | 0) + min;
}

function method1() {
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += colorArr[random(0, 16)];
	}
	return color;
}
var createPolygonMakerArr = [];
var layerPolygonMaker;

function createPolygonMaker(coords, name) {
	var coordslist = [];
	for (var a = 0; a < coords.length; a++) {
		var newlist = coodXy(coords[a].x, coords[a].y, coords.z, 1)
		coordslist.push(newlist)
	}
	var colors = method1()
	var helght = GetRandomNum(3, 6)
	var group = map.getFMGroup(map.groupIDs[0]);
	//返回当前层中第一个polygonMarker,如果没有，则自动创建
	layerPolygonMaker = group.getOrCreateLayer('polygonMarker');
	polygonMarker = new fengmap.FMPolygonMarker({
		//设置透明度
		color: colors,
		alpha: .5,
		data_: name,
		//设置边框线的宽度
		lineWidth: 1,
		//设置高度
		height: helght,
		//设置多边形坐标点
		points: coordslist
	});
	polygonMarker.params.o3d.name = name
	layerPolygonMaker.addMarker(polygonMarker);
	createPolygonMakerArr.push(polygonMarker)
}
// 添加文字
var textMarker = []

function addTextMarker(coord, names) {

	var coordslist = [];
	var newlist = coodXy(coord.x, coord.y, 1);
	var group = map.getFMGroup(map.groupIDs[0]);
	//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
	layers = group.getOrCreateLayer('textMarker');

	var gpos = group.mapCoord;

	//图标标注对象，默认位置为该楼层中心点
	tm = new fengmap.FMTextMarker({
		name: names,
		//填充色
		x: newlist.x,
		y: newlist.y,
		fillcolor: "255,0,0",
		//字体大小
		fontsize: 20,
		//边框色
		strokecolor: "255,255,0",
		callback: function () {
			// 在图片载入完成后，设置 "一直可见"
			tm.alwaysShow();
		}
	});
	//文本标注层添加文本Marker
	layers.addMarker(tm);
	textMarker.push(tm)

};
// };