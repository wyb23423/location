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
	arrlistdata = [];
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
		
		//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
		if(imgMarkerLayer == null) {
			var group = map.getFMGroup(map.groupIDs[0]);
			//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建

			imgMarkerLayer = group.getOrCreateLayer('imageMarker');
		}
		var imgurs = "../../../public/image/F.png"
		console.log()
		var taginfo = taginfo
		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height: 0.5,
			url: imgurs,
			size: 32,
			name:taginfo,
			callback: function() {
				im.alwaysShow();
				im. name = taginfo
			}
		});
		//					imgMarkerLayer.removeAll()
		imgMarkerLayer.addMarker(im);
		imgMarkerAry.push(im);
		console.log(imgMarkerAry)
	};
	 var navi;
	//模拟导航 定位移动
	 function createNavi(coord) {
	 	
        if (!navi) {
          //初始化导航对象
          navi = new fengmap.FMNavigation({
            map: map,
            changeTiltAngle:false,
            followPosition:false,
            // 设置导航线的样式
            lineStyle: {
              // 导航线样式
              lineType: fengmap.FMLineType.FMARROW,
            }
          });
          // 设置导航事件
          navi.on('walking', function(data) {
            //设置定位图标的旋转角度
            setLocationMakerPosition(data.point, data.angle);
            //显示导航展示信息
            cardInfo(data);
          });
        }
        //添加起点
        navi.setStartPoint({
          x: coord.x,
          y: coord.y,
          height: 2,
          groupID: coord.groupID,
          url: 'image/start.png',
          size: 32
        });
        //添加终点
        navi.setEndPoint({
          x: coord[1].x,
          y: coord[1].y,
          height: 2,
          groupID: coord[1].groupID,
          url: 'image/end.png',
          size: 32
        });
        // 画出导航线
        navi.drawNaviLine();
      };
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
				if(jsonMSg.length == 1) {} else {
					var x = jsonMSg.position[0],
						y = jsonMSg.position[1],
						z = jsonMSg.position[0],
						sGroupNo = jsonMSg.sGroupNo;

					if(x < 0 || y < 0 || z < 0) {
						err = jsonMSg
						return false
					} else {
						var jsonMSgArr = [
							jsonMSg.sTagNo, jsonMSg.position[0], jsonMSg.position[1], jsonMSg.position[2]
						]
						arrlistdata.init(jsonMSgArr, currentGid)
						socketDate(jsonMSgArr[0],jsonMSgArr)
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

	// 心跳数据、

	var heartType = false;
	var myChart;
	// 心跳弹出
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
	var haskeyarr = {
		keyarr: [],
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
			if(imgMarkerAry.length <0) {
				haskeyarr.keyarr.push(arr[a]);
				zuobiao(arr[a][1], arr[a][2], currentGid)
			} else {
				var hasnum = haskeyarr.keyadddata(arr[a][0]);
				if(hasnum != false) {
					for(var o = 0; o < imgMarkerAry.length; o++) {
						var imgMarkeraryname = imgMarkerAry[o].opts_.name;
						var hasnumName = hasnum[0];
						if(imgMarkeraryname == hasnumName) {

							var rood = coodXy(arr[a][1], arr[a][2], currentGid);
							//											
							var coord = {
								groupID: 1,
								x: rood.x,
								y: rood.y,
								z: 0
							};

							imgMarkerAry[o].moveTo(coord)
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
							textMarkerAry[o].x = coord.x;
							textMarkerAry[o].y = coord.y
						}
					}
				} else {
					var taginfo = arr[a][4]
					haskeyarr.keyarr.push(arr[a]);

					zuobiao(arr[a][1], arr[a][2], currentGid,arr[a][0])
				}
			}
		}
	}
	// 坐标转换 数据坐标转换fengmap坐标系统
	function zuobiao(tagX, tagY, currentGid,names) {
			var tag_x = parseFloat(tagX);
			var tag_y = parseFloat(tagY);
			var currentGid = currentGid;
			var tagname=names;
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

				addMarker(currentGid, mapCoord,tagname)
				//				addTextMarkers(currentGid,mapCoord,taginfo)
			}


	}

	function coodXy(tagX, tagY, currentGid) {
		// 单位为厘米
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
			'y': tag_y
		}; //定位原点测试
		//转换后的地图坐标
		//		// 更换(loc)
		var mapCoord = trasformer.transform(loc);
//		createNavi(mapCoord)
		return mapCoord
	}
	var socketDateArr=[]
	function  socketDate(keys,data){
		
		if(socketDateArr.length==0){
			var data={
					names:keys,
					data:data
				}
				socketDateArr.push(data)
		}
		for(var a=0;a<socketDateArr.length;a++){
			
			if(keys==socketDateArr[a].names){
				return false
//				if(socketDateArr[a].data.length==0){
////					socketDateArr[a].data.length.push(data)
//				}else if(socketDateArr[a].data.length==1){
//					console.log(socketDateArr)
//				}
			}else{
//				var data={
//					names:keys,
//					data:data
//				}
//				socketDateArr.push(data)
			}
		}
		console.log(socketDateArr)
	}

	//			},1000);
	var aBtn = document.querySelectorAll('.btn');
	//开启2维模式
	aBtn[0].onclick = function() {

		//设置地图为2维模式
		map.viewMode = fengmap.FMViewMode.MODE_2D;
		this.classList.add('btn-primary');
		aBtn[1].classList.remove('btn-primary');
	};
	//开启3维模式
	aBtn[1].onclick = function() {
		console.log(132)
		//设置地图为3维模式
		map.viewMode = fengmap.FMViewMode.MODE_3D;
		this.classList.add('btn-primary');
		aBtn[0].classList.remove('btn-primary');
	};
}