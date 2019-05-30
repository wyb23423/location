/*
 *   label zyh2.0 
 * 		version 2.0
 * 		fenmap
 * 		jQuer
 * 		webscoket
 *     公用模块未转出  ：坐标值转换  地图显示 鼠标移入显示 数据接受显示标签    
 * */
var map;
var imgMarkerLayer = null;
var imgMarkerAry = [],
	arrlistdatas = [];
var textMarkerAry = [];
// 点击事件ID
var eventID = null;
var popMarker = null;
var arrlistopen = false;
window.onload = function() {
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

	var nums = 0
	//在点击的位置添加文字标注
	function addTextMarkers(gid, mapCoord, taginfo) {
		console.log(mapCoord)
		var group = map.getFMGroup(map.groupIDs[0]);
		if(group.getOrCreateLayer == null) {

		} else {

			//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
			layer = group.getOrCreateLayer('textMarker');
		}
		var gpos = group.mapCoord;
		//图标标注对象，默认位置为该楼层中心点
		tm = new fengmap.FMTextMarker({
			x: mapCoord.x,
			y: mapCoord.y - 0.5,
			height: 0.5,
			name: taginfo[0].name,
			//填充色
			fillcolor: "255,0,0",
			//字体大小
			fontsize: 20,
			//边框色
			strokecolor: "255,255,0",
			callback: function() {
				// 在图片载入完成后，设置 "一直可见"
				tm.alwaysShow();
			}
		});
		//文本标注层添加文本Marker
		layer.addMarker(tm);
		textMarkerAry.push(tm)
	};
	//在点击的位置添加图片标注
	function addMarker(gid, coord, taginfo) {

		map.gestureEnableController.enableMapHover = true;
		var group = map.getFMGroup(gid);

		var tagname = taginfo[0].name;
		var tag_no = taginfo[0].tagNo;
		//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
		if(imgMarkerLayer == null) {
			var group = map.getFMGroup(map.groupIDs[0]);
			//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建

			imgMarkerLayer = group.getOrCreateLayer('imageMarker');
		}
		var imgurs;
		console.log(taginfo)
		if(
			taginfo[0].type == 1
		) {
			imgurs = "../../../public/image/P.png"
		} else {
			imgurs = "../../../public/image/F.png"
		}
		var taginfo = taginfo
		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height: 0.5,
			url: imgurs,
			size: 32,
			name: tagname,
			data_: taginfo,
			tagNo: tag_no,
			callback: function() {
				im.alwaysShow();
				im.datas = taginfo
			}
		});
		//					imgMarkerLayer.removeAll()
		imgMarkerLayer.addMarker(im);
		imgMarkerAry.push(im)
	};

	function tagGet(tag_no) {
		var tag_no = tag_no;
		var taginfo;
		var urls = "http://192.168.1.202/api/tag/getall"
		$.ajax({
			type: "get",
			url: urls,
			async: false,
			data: {
				currentPage: 1,
				pageSize: 10,
				tagNo: tag_no
			},
			success: function(red) {
				taginfo = red
			}
		});
		return taginfo.pagedData.datas
	}
	// 获取摄像头列表
	var camear = [];

	function getcamearlist() {
		var urls = "/api/camera/getall"
		$.ajax({
			type: "get",
			url: urls,
			async: false,
			data: {
				currentPage: 1,
				pageSize: 100,
			},
			success: function(red) {
				camear = red.pagedData.datas;

			}
		});
	}
	getcamearlist()
	// 获取标签列表
	var tagarrlists;

	function tagarrlist() {
		var urls = "http://192.168.1.202/api/tag/getall"
		$.ajax({
			type: "get",
			url: urls,
			async: false,
			data: {
				currentPage: 1,
				pageSize: 10000,
			},
			success: function(red) {
				tagarrlists = red.pagedData.datas;
				addtabTga(tagarrlists)
			}
		});
	};

	function addtabTga(data) {
		var tagdata = data;
		for(var a = 0; a < tagdata.length; a++) {
			var ahtmls = `
				<tr>
					<td>${tagdata[a].name}</td>
					<td>
						<div class="layui-form-item">
							<div class="layui-input-block" style="    margin-left: 0; min-height: 36px;">
								<input type="checkbox" data-tagNo="${tagdata[a].tagNo}" name="close" lay-skin="switch"  lay-filter="switchTest"  lay-text="ON|OFF">
							</div>
						</div>
					</td>
				</tr>
			`;
			$("#tagarlist").append(ahtmls)
		}
		var form = layui.form;
		form.render()
	}
	// 实时路线数据更新
	var hostdata = [],
		newdata = [];
	var tagback = {
		flist: null,
		last: null,
		init: function() {},
		key: function() {},
		keydata: [],
	}

	var tagfor = []

	function fortag(tagno) {
		tagfor = []
		//		console.log(tagarrlists)
		for(var a = 0; a < tagarrlists.length; a++) {
			if(tagno == tagarrlists[a].tagNo) {
				tagfor.push(tagarrlists[a]);
			}
		}
	}
	tagarrlist()
	var getHeartTime = 0;
	// webSocket 获取长连接数据
	var err = null

	function WebSocketTest(currentGid) {

		if("WebSocket" in window) {
			// 打开一个 web socket
			var ws = new WebSocket("ws://192.168.1.202:80/realtime/position/0002,0001,0003");
			ws.onopen = function() {
				// Web Socket 已连接上，使用 send() 方法发送数据
				ws.send("发送数据");
			};
			ws.onmessage = function(evt) {
				var received_msg = evt.data;

				jsonMSg = eval("(" + received_msg + ")");
				//				console.log(jsonMSg)
				if(jsonMSg.length == 1) {} else {
					var x = jsonMSg.position[0],
						y = jsonMSg.position[1],
						z = jsonMSg.position[0],
						sGroupNo = jsonMSg.sGroupNo;

					if(x == -1) {
						err = jsonMSg

						console.log(err)
						return false
					} else {
						fortag(jsonMSg.sTagNo)
						tumble(jsonMSg.alarm, jsonMSg.sTagNo)

						if(tagfor.length == 0) {

						} else {
							camera(sGroupNo, jsonMSg.sTagNo)
							tagfor[0].iBbattery = jsonMSg.iBbattery
							var jsonMSgArr = [
								jsonMSg.sTagNo, jsonMSg.position[0], jsonMSg.position[1], jsonMSg.position[2], tagfor
							]
							//							Ec.initfun(jsonMSgArr);
							if(heartType == true) {
								getHeartTime += 200;
								var d = new Date();
								var dTime = d.getSeconds()
								var headet = Getheart(80, 100)
								if(tagNo == jsonMSg.sTagNo) {
									if(getHeartTime % 1000 == 0) {
										var heartDate = headet;
										console.log(heartDate)
										if(heartDate > 200 || heartDate < 50) {

										} else {

											addData(heartDate)
										}

									}
								}
							}

							arrlistdata.init(jsonMSgArr, currentGid)

						}
					}

				}

			};
			ws.onclose = function() {
				// 关闭 websocket	
			};
		} else {
			// 浏览器不支持 WebSocket

		}
	}

	//  模拟判断 超出误差
	//超出地图区域

	//

	function Getheart(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		return(Min + Math.round(Rand * Range));
	}
	// 心跳数据、
	var heartDate = [];
	$("#errorDat").hide()

	function addData(shift) {
		heartDate.push(shift);
		if(heartDate.length > 11) {
			heartDate.shift()
		}
		$("#heartNum").html(shift)
		getHeartDat(heartDate)
	}

	function getHeartDat(datalist) {
		var heart = datalist;
		console.log(datalist)
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
	$("#heart").click(function() {
		heartType = true;
		var heatHtml = "<div id=\"heatInfo\">\n\t\t\t<div id=\"heatName\" class=\"clearfix\">\n\t\t\t\t<div id=\"heatImg\" class=\"col-xs-4\">\n\t\t\t\t\t<img src=\"" + tagimgUrl + "\" />\n\t\t\t\t</div>\n\t\t\t\t<div id=\"heatTag\" class=\"col-xs-8\" style=\"padding-left: 15px;\">\n\t\t\t\t\t<p>\u59D3\u540D\uFF1A" + tagsname + "</p>\n\t\t\t\t\t<p>\u7F16\u53F7\uFF1A" + tagNo + "</p>\n\t\t\t\t\t<p>\u6240\u5C5E\u90E8\u95E8\uFF1A" + department + "</p>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\t\t\t<div id=\"\" class=\"clearfix\" style=\"margin-top:33px;position: relative;\">\n\t\t\t<div id=\"errorDat\" style=\"\n\t\t\t    position: absolute;\n\t\t\t    top: 0;\n\t\t\t    left: -15px;\n\t\t\t    width: 109%;\n\t\t\t    height: 303px;\n\t\t\t    text-align:  center;\n\t\t\t    justify-content:  center;\n\t\t\t    line-height:  300px;\n\t\t\t    background: #ddd;\n\t\t\t    background-color: #33333396;\n\t\t\t    color:  #fff;\n\t\t\t    font-size: 22px;\n\t\t\t\">\n\t\t\t    \t<p>\u5FC3\u8DF3\u6570\u636E\u9519\u8BEF\uFF0C\u5173\u95ED\u91CD\u8BD5</p>\n\t\t\t    </div>\n\t\t\t\t<hr class=\"style-two\" />\n\t\t\t\t<div id=\"hearimg\">\n\t\t\t\t\t<img src=\"../public/image/heartRate.png\" />\n\t\t\t\t\t<span id=\"heartNum\">测试中</span>\n\t\t\t\t</div>\n\t\t\t\t<p class=\"heatTitle\">\u5B9E\u65F6\u5FC3\u7387\u67E5\u770B</p>\n\t\t\t\t<div id=\"zoneEchart\" style=\"height: 300px\">\n\t\t\t\t\t\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>";
		getHeartbeat(tagNo)
		layer.open({
			title: '心跳数据',
			content: heatHtml,
			offset: 'rt',
			shade: 0,
			area: ['400px', '600px'],
			success: function(layero, index) {
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

	var st = setInterval(function() {
		var currentGid = map.focusGroupID;
		if(map.focusGroupID == 1) {
			WebSocketTest(currentGid)

			clearInterval(st)
		}
	}, 1000)
	WebSocketTest()
	// 整理数据
	arrlistdata = { // 
		"flistdata": null,
		dataArr: [

		], // 用来装标签数据的数组
		keyarr: [],
		keytag: null,
		keyadddata: function(key) {
			for(var i = 0; i < this.keyarr.length; i++) {
				if(key == this.keyarr[i]) {
					return this.keytag = this.keyarr[i]
				}
			}
			return false
		},
		flistnum: false, //判断是否为第一次进入的数据， 
		init: function(data, currentGid) {

			if(this.flistnum == false) {
				this.flistadddata(data, currentGid)
			} else {

				this.nextadddata(data, currentGid)

			}
		},
		flistadddata: function(data, currentGid) { // 将第一次进入的数据存在数组
			this.dataArr.push(data);
			this.keyarr.push(data[0])
			this.flistnum = true
		},
		nextadddata: function(data, currentGid) { //假如当前标签数据为第二次进来，将这次标签的数据与第一次进来的数据进行对比，如果相同则改变相同数组的值等于这次进来的数据，   后续进来数据同理

			var newdataname = data[0];

			var thistag = this.keyadddata(newdataname);

			if(thistag != false) {
				for(var j = 0; j < this.dataArr.length; j++) {

					if(this.dataArr[j][0] == thistag) {
						this.dataArr[j] = data
					}

				}
			} else {
				this.dataArr.push(data);
				this.keyarr.push(data[0])
			}
			var currentGid = currentGid;
			if(currentGid != -1) {

				canaddimg(this.dataArr, currentGid)

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
	$("#colose").click(function() {
		$("#tagInfo").hide()
	})
	// 鼠标移入弹出信息
	function popwinInfo(datainfo, idnum) {
		console.log(datainfo)

		jop = datainfo.zone,
			department = datainfo.department,
			tagsname = datainfo.name,
			tagimgUrl = datainfo.avatar,
			sex = datainfo.sex,
			tagNo = idnum;
		for(var a = 0; a < zonelist.length; a++) {

			if(jop == zonelist[a].id) {
				jop = zonelist[a].name
			}
		}
		if(sex == 1) {
			sex = "男"
		} else if(sex == 2) {
			sex = "女"
		}
		$("#tagInfo").show()
		$("#avatarImg").attr("src", tagimgUrl);
		$(".tagnames").html("姓名：" + tagsname);
		$(".tagsex").html("性别：" + sex)
		$(".tagnNo").html("编号：" + "<span id='tagNum'>" + tagNo + "</span>")
		$(".tagJop").html(jop)
		$(".iBbattery").html(datainfo.iBbattery)
		$(".tagdepartment").html(department)

	}
	var alarmType = false;
	$("#playLogin").click(function() {
		//		var thistagNum=$("#tagInfo").find("#tagNum");
		alarmType = true
	})
	// 判断摄像头位置区域变化
	var flistcamera, lastcamera;

	function camera(tagzone, tagno) {
		var tagnum = $("#tagNum").html();
		if(alarmType == true) {
			if(tagnum == undefined || tagnum != tagno) {
				return false
			} else {

				camerazone.init(tagzone)
			}

		}

	}

	function openCamera(tagzone) {
		var alarm = tagzone;
		for(var a = 0; a < camear.length; a++) {
			if(tagzone == camear[a].groupCode) {
				var camearIp = camear[a].ip,
					camearPort = camear[a].port,
					camearUsername = camear[a].username,
					camearPwd = camear[a].password;

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
		init: function(zones) {

			if(this.clicktypes == 0) {
				this.flistfuns(zones)
				this.clicktypes = 1;
			} else {
				this.lastfuncs(zones)
			}
		},
		flistfuns: function(zones) {
			this.flistzone = zones;

			openCamera(zones)
		},
		lastfuncs: function(zones) {
			this.lastzone = zones;

			if(this.lastzone == this.flistzone) {
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

			yes: function() {
				layer.closeAll();
			},
			zIndex: layer.zIndex //重点1
				,
			resizing: function(layero, index) {},
			success: function(layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.fun();
				iframeWin.clickLogin(camearIp, camearPort, camearUsername, camearPwd)
			},
			cancel: function(index, layero) {
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
		init: function(heart) {
			if(this.num == 1) {
				if(heart != 47) {
					this.flistfun(heart)
				}
			}
		},
		flistfun: function(heart) {
			this.flist = heart
		},
		lastfun: function(heart) {
			if(heart - this.heart < 30 || this.heart - heart > 30) {

			} else {

			}
		}
	}
	//  获取实时心跳数据
	function getHeartbeat(tagNo) {

		var urls = "http://192.168.1.202/api/tag/requestHeartRate"; // 心跳数据接口
		// 需要参数：ip, port(端口),cmd(控制命令),tagNo(标签编号)  （端口号为配置固定端口号 不用上传） 
		var tagIP, tagPort, tagCmd, tagNo
		$.ajax({
			type: "get",
			url: urls,
			async: false,
			data: {
				tagNo: tagNo
			},
			success: function(red) {

			}
		});
	}

	map.on('mapHoverNode', function(event) {

		if(event.nodeType == fengmap.FMNodeType.IMAGE_MARKER) {

			var coord = event.eventInfo.coord,
				gid = event.groupID;
			var name = event.name || '未登记';
			var idnum = event.datas[0].tagNo || '未登记';
			removePopWin();
			addPopWin(coord, gid, name, idnum);
			popwinInfo(event.datas[0], idnum)
		} else {
			setTimeout(function() {
				removePopWin();
			}, 5000)
		}
	});
	var haskeyarr = {
		keyarr: [],
		keyarrname: [],
		keytag: null,
		keyadddata: function(key) {

			for(var i = 0; i < this.keyarr.length; i++) {

				if(key == this.keyarr[i][0]) {
					return this.keytag = this.keyarr[i]
				}
			}
			return false
		},
	}
	// 图片移动

	function canaddimg(arr, currentGid) {

		for(var a = 0; a < arr.length; a++) {
			if(imgMarkerAry.length < 1) {
				haskeyarr.keyarr.push(arr[a]);
				haskeyarr.keyarrname.push(arr[a][0])
				var taginfo = arr[a][4];
				zuobiao(arr[a][1], arr[a][2], currentGid, taginfo)
			} else {
				var hasnum = haskeyarr.keyadddata(arr[a][0]);
				
				if(hasnum != false) {
					for(var o = 0; o < imgMarkerAry.length; o++) {
						var imgMarkeraryname = imgMarkerAry[o].opts_.name;
						var hasnumName = hasnum[4][0].name;
						if(imgMarkeraryname == hasnumName) {

							tagmarker.push(imgMarkeraryname)
							var rood = coodXy(arr[a][1], arr[a][2], currentGid);
							var coord = {
								groupID: 1,
								x: rood.x,
								y: rood.y,
								z: 0
							};
							if(imgMarkerAry[o].opts_.x == coord.x) {

							} else {
								var obj=[];
//								console.log(imgMarkerAry[o].name)
								imgMarkerAry[o].opts_.hosetx = imgMarkerAry[o].opts_.x;
								imgMarkerAry[o].opts_.hosety = imgMarkerAry[o].opts_.y;
							
								imgMarkerAry[o].moveTo(coord)
								imgMarkerAry[o].opts_.x = coord.x;
								imgMarkerAry[o].opts_.y = coord.y;
								imgMarkerAry[o].opts_.newx = coord.x
								imgMarkerAry[o].opts_.newy = coord.y
								track(obj)
							}

						}
					}

					for(var o = 0; o < textMarkerAry.length; o++) {
						var textMarkerAryName = textMarkerAry[o].opts_.name;
						var hasnumName = hasnum[4][0].name;
						if(textMarkerAryName == hasnumName) {

							var rood = coodXy(arr[a][1], arr[a][2], currentGid);
							//											
							var coord = {
								groupID: 1,
								x: rood.x,
								y: rood.y,
								z: 0
							};
							textMarkerAry[o].moveTo(coord)

						}
					}
				} else {
					var taginfo = arr[a][4]
					haskeyarr.keyarr.push(arr[a]);
					haskeyarr.keyarrname.push(arr[a][0])
					zuobiao(arr[a][1], arr[a][2], currentGid, taginfo)
				}
			}

		}
	}
	var tagmarker = [];
	var tagplayback;
	var form = layui.form
	var tagnoswitch = [];
	// 监控标签路径显示开关
	form.on('switch(switchTest)', function(data) {
		// console.log(data.elem); //得到checkbox原始DOM对象
		var tagnos = $(data.elem).data("tagno");
		console.log(tagnoswitch.indexOf(tagnos))
		if(tagnoswitch.indexOf(tagnos)==-1){
				
				tagnoswitch.push(tagnos)
		}else{
			
			var indexNum=tagnoswitch.indexOf(tagnos);
			tagnoswitch.splice(indexNum,1);
			clearNaviLines(tagnos)
		}
	
	});

	function track(obj){
		// console.log(tagnoswitch.length)
		var arrs = haskeyarr.keyarrname;
		
		for(var a = 0; a < tagnoswitch.length; a++) {
			
			var index = arrs.indexOf(tagnoswitch[a]);
			
			if(index != -1) {
				
				var objsd=[]
				var hostXY={
						hostX: imgMarkerAry[a].opts_.hosetx,
						hostY: imgMarkerAry[a].opts_.hosety
					}
				var newXY={
						newX: imgMarkerAry[a].opts_.newx,
						newY: imgMarkerAry[a].opts_.newy
					}
					
					objsd.push(hostXY)
					objsd.push(newXY)
				var tagnames = arrs[index];
				forName(tagnames,objsd)
			}
		}
	}
	function forName(name,obj){
		// console.log(name)
		
		for(var a=0;a<imgMarkerAry.length;a++){
			
			if(imgMarkerAry[a].opts_.name==name){
				drawLinesMap(obj,name)
			}
		}
	}
	// 画线
	
	function drawLinesMap(obj,name){
//		console.log(obj)
		var lineStyle = {
            //设置线的颜色
            color: 'red',
            //设置线的宽度
            lineWidth: 5,
            //设置线的透明度
            alpha: 0.8,
            //设置线的类型
            lineType: fengmap.FMLineType.FMARROW,
           
          };
         
          var naviResults=[{
              groupId: 1,
              points: [{
                x:obj[0].hostX,
                y:obj[0].hostY,
                z: 0
              },
              {
                x:obj[1].newX,
                y:obj[1].newY,
                z: 0
              }
            ]
          }];
       // console.log(naviResults)
          drawLines(naviResults, lineStyle,name);
	}
	var naviLines=[]
	function drawLines(results, lineStyle,name) {
        //绘制部分
        var line = new fengmap.FMLineMarker();
        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          var gid = result.groupId;
          var points = result.points;
          var seg = new fengmap.FMSegment();
          seg.groupId = gid;
          seg.points = points;
          line.addSegment(seg);
       
          var lineObject = map.drawLineMark(line, lineStyle);
          var lineObjectArr={
          		name:name,
          		lineObjects:lineObject
          };
          naviLines.push(lineObjectArr)
        }

      };
      function clearNaviLines(name){
      	 if (naviLines.length != 0) {
            for (var i = 0; i < naviLines.length; i++) {
            	if(naviLines[i].name==name){
            		map.clearLineMark(naviLines[i].lineObjects);
            	}
               
            }
          
        }
      }
	// 坐标转换 数据坐标转换fengmap坐标系统
	function zuobiao(tagX, tagY, currentGid, taginfo) {
		if(taginfo == undefined) {

		} else {
			var tag_x = parseFloat(tagX);
			var tag_y = parseFloat(tagY);
			var currentGid = currentGid;
			var trasformer = new CoordTransformer();
			//来至定位系统的参数 定位的原点坐标 已经定位的范围
			var locOrigion = {
				'x': 0,
				'y': 0
			};
			//定位坐标原点
			var locRange = {
				'x': 2662,
				'y': 1760
			}; //定位范围
			//根据定位四个角点的地图坐标点
			var mapParas = [];
			mapParas[0] = {
				'x': 11582814.5640,
				'y': 3575757.0966
			}; //定位原点地图坐标
			mapParas[1] = {
				'x': 11582841.6472,
				'y': 3575757.0966
			}; //X轴终点地图坐标
			mapParas[2] = {
				'x': 11582841.6472,
				'y': 3575775.6658
			}; //定位原点对角点地图坐标
			mapParas[3] = {
				'x': 11582814.5640,
				'y': 3575775.6658
			}; //Y轴终点地图坐标
			trasformer.init(locOrigion, locRange, mapParas);
			//定位系统中的定位坐标
			var loc = {
				'x': tag_x - 100,
				'y': tag_y + 130
			}; //定位原点测试
			//转换后的地图坐标

			var mapCoord = trasformer.transform(loc);
			var currentGid = currentGid;

			if(currentGid != -1) {

				addMarker(currentGid, mapCoord, taginfo)
				//				addTextMarkers(currentGid,mapCoord,taginfo)
			}
		}

	}

	function coodXy(tagX, tagY, currentGid) {
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
			'x': 2662,
			'y': 1760
		}; //定位范围
		//根据定位四个角点的地图坐标点
		var mapParas = [];
		mapParas[0] = {
			'x': 11582814.5640,
			'y': 3575757.6582
		}; //定位原点地图坐标
		mapParas[1] = {
			'x': 11582841.6422,
			'y': 3575757.6582
		}; //X轴终点地图坐标
		mapParas[2] = {
			'x': 11582841.6422,
			'y': 3575775.2670
		}; //定位原点对角点地图坐标
		mapParas[3] = {
			'x': 11582814.5640,
			'y': 3575775.2670
		}; //Y轴终点地图坐标
		trasformer.init(locOrigion, locRange, mapParas);
		//定位系统中的定位坐标

		var loc = {
			'x': tag_x,
			'y': tag_y + 50
		}; //定位原点测试
		//		console.log(loc)
		//转换后的地图坐标
		//		// 更换(loc)
		var mapCoord = trasformer.transform(loc);

		return mapCoord
	}

	//			},1000);
	var aBtn = document.querySelectorAll('.btn');
	console.log(aBtn)
	//开启2维模式
	aBtn[1].onclick = function() {

		//设置地图为2维模式
		map.viewMode = fengmap.FMViewMode.MODE_2D;
		this.classList.add('btn-primary');
		aBtn[1].classList.remove('btn-primary');
	};
	//开启3维模式
	aBtn[2].onclick = function() {
		console.log(132)
		//设置地图为3维模式
		map.viewMode = fengmap.FMViewMode.MODE_3D;
		this.classList.add('btn-primary');
		aBtn[0].classList.remove('btn-primary');
	};
	var removePopWin = function() {
		if(popMarker) {
			popMarker.close();
			popMarker = null;
		}
	}
	var addPopWin = function(coord, gid, txt, idnum) {
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
			closeCallBack: function() {
				//信息窗点击关闭操作
				// alert('信息窗关闭了！');
			}
		});
		//添加弹框到地图上
		popMarker = new fengmap.FMPopInfoWindow(map, ctlOpt);
	};

	//获取区域信息
	var zonelist;
	$.ajax({
		type: "get",
		url: "/api/zone/getall",
		async: true,
		data: {
			'currentPage': 10,
			"pageSize": 100
		},
		success: function(data) {
			zonelist = data.pagedData.datas;

		}
	});
	// 定时获取数据库报警信息
	setInterval(function() {
		$.ajax({
			type: "get",
			url: "/api/alarm/getall",
			async: true,
			data: {
				"currentPage": 1,
				"pageSize": 1000
			},
			success: function(data) {

				var alarminfo = data.pagedData.datas;
				//				alarm(alarminfo)
			}
		});
	}, 5000)

	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
			" " + date.getHours() + seperator2 + date.getMinutes() +
			seperator2 + date.getSeconds();
		return currentdate;
	}
	// 报警信息弹出
	function tumble(tumbleAlarm, tagno) {

		if(tumbleAlarm.length < 2) {
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
			//						alarm(tumblealarms)
		}
	}

	function alarm(alarmInfo) {

		layer = layui.layer; //独立版的layer无需执行这一句
		if(alarmInfo.length == 0) {
			return false;
		} else {
			console.log(alarmInfo)
			if(alarmInfo[0].tagNo == "00000002") {
				return false
			} else {

				var alarminfo = alarmInfo[0];
				var taginfo, zoneinfo;

				for(var a = 0; a < tagarrlists.length; a++) {

					if(alarminfo.tagNo == tagarrlists[a].tagNo) {

						taginfo = tagarrlists[a]
					}
				}
				for(var a = 0; a < zonelist.length; a++) {
					if(taginfo.zone == zonelist[a].id) {
						zoneinfo = zonelist[a]
					}
				}
				var alarmHtml = "\n\t\t\t\t\t\t<div id=\"heatInfo\">\n\t\t\t\t\t\t\t<div id=\"heatName\" class=\"clearfix\">\n\t\t\t\t\t\t\t\t<div id=\"heatImg\" class=\"col-xs-4\">\n\t\t\t\t\t\t\t\t\t<img src=\"" + taginfo.avatar + "\">\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div id=\"heatTag\" class=\"col-xs-8\" style=\"padding-left: 15px;\">\n\t\t\t\t\t\t\t\t\t<p>\u59D3\u540D\uFF1A" + taginfo.name + "</p>\n\t\t\t\t\t\t\t\t\t<p>\u7F16\u53F7\uFF1A" + alarminfo.tagNo + "</p>\n\t\t\t\t\t\t\t\t\t<p>\u57FA\u7AD9\u7F16\u53F7\uFF1A" + alarminfo.baseNo + "</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div id=\"\" class=\"clearfix\" style=\"margin-top:33px;position: relative;\">\n\t\t\t\n\t\t\t\t\t\t\t\t<hr class=\"style-two\" style=\"margin-bottom: 20px;\">\n\t\t\t\t\t\t\t\t<div class=\"alarmlist\">\n\t\t\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t\t\t<li>\u6240\u5C5E\u533A\u57DF\uFF1A" + zoneinfo.name + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u6240\u5C5E\u90E8\u95E8\uFF1A" + taginfo.job + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u4FE1\u606F\uFF1A" + alarminfo.type + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u65F6\u95F4\uFF1A" + alarminfo.alarmTime + "</li>\n\t\t\t\t\t\t\t\t\t\t<li>\u62A5\u8B66\u5185\u5BB9\uFF1A" + alarminfo.alarmMsg + "</li>\n\t\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t";
				layer.open({
					title: '报警弹出框',
					content: alarmHtml,
					offset: 'rt',
					shade: 0,
					area: ['400px', '600px'],
					success: function(layero, index) {}
				});
			}
		}
	}
	// 清除layer
	var layerPolygonMaker

	function removerLayui() {
		layerPolygonMaker.removeAll();
	}

	// 显示区域
	var zoneopnclick = 0;
	$("#zoneOpen").click(function() {
		if(zoneopnclick == 0) {
			zoneOpen();
			$("#zoneOpen").html("关闭区域").addClass(" btn-primary");
			zoneopnclick = 1
		} else {
			$("#zoneOpen").html("开启区域").removeClass(" btn-primary");
			removerLayui()
			zoneopnclick = 0
		}
	})
	// 区域
	function zoneOpen() {
		var list;
		var zonlistarr = [];
		var Alist = [];
		for(var a = 0; a < zonelist.length; a++) {
			console.log(zonelist.length)
			var zones = zonelist[a].position;
			zones = eval("(" + zones + ")");
			//			console.log(zones)
			createPolygonMaker(zones)
			addTextMarker(zones[0], zonelist[a].name)
		}
	}
	// 添加区域
	function GetRandomNum(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		return(Min + Math.round(Rand * Range));
	}
	// 随机颜色
	var colorArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

	function random(min, max) {
		if(isNaN(min) || isNaN(max)) {
			return null;
		}
		if(min > max) {
			min ^= max;
			max ^= min;
			min ^= max;
		}
		return(Math.random() * (max - min) | 0) + min;
	}

	function method1() {
		var color = "#";
		for(var i = 0; i < 6; i++) {
			color += colorArr[random(0, 16)];
		}
		return color;
	}

	function createPolygonMaker(coords) {
		var coordslist = [];
		for(var a = 0; a < coords.length; a++) {
			var newlist = coodXy(coords[a].x, coords[a].y, 1)
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
			//设置边框线的宽度
			lineWidth: 1,
			//设置高度
			height: helght,
			//设置多边形坐标点
			points: coordslist
		});
		layerPolygonMaker.addMarker(polygonMarker);
	}
	// 添加文字

	function addTextMarker(coord, names) {
		var coordslist = [];
		var newlist = coodXy(coord.x, coord.y, 1)
		var group = map.getFMGroup(map.groupIDs[0]);
		//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
		layer = group.getOrCreateLayer('textMarker');

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
			callback: function() {
				// 在图片载入完成后，设置 "一直可见"
				tm.alwaysShow();
			}
		});
		//文本标注层添加文本Marker
		layer.addMarker(tm);
	};
};