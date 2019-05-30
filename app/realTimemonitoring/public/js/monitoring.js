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
var arrlistopen = false;;
window.onload = function() {
	var heights = document.body.offsetHeight;
	var gethttpdata = null;
	$(".left_silde ").height(heights - 60);
	$(".min").height(heights - 60)
	var a0000007, a0000004, a0000003, a0000006
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
		viewModeAnimateMode: true,
		//开发者申请应用下web服务的key
		key: '83a75157d56ffe85317ed7ba1e8120ff',
		//开发者申请应用名称
		appName: 'hunjingguanchang',
		// mapScaleRange: [200, 4000],？
	});
	//打开Fengmap服务器的地图数据和主题
	map.openMapById(fmapID);
	// 添加标注
	function addMarker(gid, coord, tagname) {

		var group = map.getFMGroup(gid);
		//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
		if(imgMarkerLayer == null) {
			var group = map.getFMGroup(map.groupIDs[0]);
			//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
			imgMarkerLayer = group.getOrCreateLayer('imageMarker');
		}

		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height: 0.5,
			url: '../../../public/image/tagimg.png',
			size: 32,
			name: tagname,
			callback: function() {
				im.alwaysShow();
			}
		});
		console.log(im)
		//					imgMarkerLayer.removeAll()
		imgMarkerLayer.addMarker(im);
		imgMarkerAry.push(im)
	};
	//	

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
		//设置地图为3维模式
		map.viewMode = fengmap.FMViewMode.MODE_3D;
		this.classList.add('btn-primary');
		aBtn[0].classList.remove('btn-primary');
	};
	//  暂无作用
	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = year + seperator1 + month + seperator1 + strDate;
		return currentdate;
	}
	//  暂无作用
	function timestampToTime(timestamp) {
		var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		var D = date.getDate() + ' ';
		var h = date.getHours() + ':';
		var m = date.getMinutes() + ':';
		var s = date.getSeconds();
		return Y + M + D + h + m + s;
	}
	//2014-06-18 10:33:24
	var endTime = getNowFormatDate();
	//  lyui 时间控件
	function startTime() {
		layui.use("laydate", function() {
			var laydate = layui.laydate;
			var ins = laydate.render({
				elem: '#test-limit1',
				type: 'datetime',
				format: "yyyy-MM-dd HH:mm:ss",
				min: '2000-4-14',
				max: '2023-10-11',
				ready: function() {
					ins.hint('请选择开始时间');
				}
			});
			var ins2 = laydate.render({
				elem: '#test-limit2',
				format: "yyyy-MM-dd HH:mm:ss",
				min: '2000-4-14',
				max: '2050-4-14',
				type: 'datetime',
				ready: function() {
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
			url: "/api/tag/getall",
			data: {
				currentPage: 1,
				pageSize: 10000
			},
			datatype: "jsonp",
			async: true,
			success: function(red) {
				var cityhtml;
				var arr = red.pagedData.datas
				console.log(arr.length)
				taganames = arr;
				for(var a = 0; a < arr.length; a++) {
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
	layui.use(['form', 'layedit', 'laydate'], function() {
		var form = layui.form,
			layer = layui.layer,
			layedit = layui.layedit,
			laydate = layui.laydate;
		form.on('switch(switchTest)', function(data) {
			console.log(this.checked)
			if(this.checked == true) {
				drawLines()
			} else {
				alert("关闭")
			}
		});

	});
	getTgadata()
	var alist = 0;
	var taglineslist = []

	function drawLines() {
		var tagnames;
		for(var a = 0; a < taganames.length; a++) {

			var arrlist = tagGrouping(gethttpdata, taganames[a].tagNo);
			console.log(arrlist)
			taglineslist.push(arrlist)
		}
		dataPacket(taglineslist)
	}

	function arrNum(arr) {
		setTimeout(function() {
			packetLines(arr, arr.length)
		}, 200)
	}
	var dataPacketArr = [];
	var flistnum = 0;
	var datapacketArr = {
		flist: null,
		lastDat: null,
		init: function(data) {

			if(flistnum == 0) {
				this.flistFun(data)
				flistnum++
			} else {
				flistnum++
				this.lastFun(data)
			}

			if(flistnum == taglineslist[0].length) {

				arrNum(dataPacketArr)
				//						
			}
		},
		flistFun: function(data) {
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
		lastFun: function(data) {
			var tagx = data.x,
				tagy = data.y,
				z = data.z;
			var locd = coodXy(tagx, tagy, 1)
			this.lastDat = {
				x: parseFloat(locd.x),
				y: parseFloat(locd.y),
				z: parseFloat(locd.z),
			}
			if(this.lastDat.x - this.flist.x > 4 || this.lastDat.y - this.flist.y > 4 || this.lastDat.z - this.flist.z > 4) {
				if(this.lastDat.x - this.flist.x < 5 || this.lastDat.y - this.flist.y < 5 || this.lastDat.z - this.flist.z < 5) {
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
		setTime = setInterval(function() {
			if(setDate > flistnums) {
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
		for(var a = 0; a < dataObj.length; a++) {
			for(var i = 0; i < dataObj[a].length; i++) {
				datapacketArr.init(dataObj[a][i])
			}
		}
	}

	var naviLines = [];
	// 判断地方是否初始化成功
	function naviResult(data) {
		var naviResults = [{
			groupId: 1,
			points: data
		}];

		//配置线型、线宽、透明度等
		var lineStyle = {
			//设置线的宽度
			lineWidth: 2,
			//设置线的透明度
			alpha: 0.8,
			//设置线的类型为导航线
			lineType: fengmap.FMLineType.FMARROW,
			//设置线动画,false为动画
			noAnimate: true,
		};
		//绘制线
		drawLinesTagMap(naviResults, lineStyle);

	}

	function drawLinesTagMap(results, lineStyle) {
		console.log(results)
		var line = new fengmap.FMLineMarker();
		for(var i = 0; i < results.length; i++) {
			var result = results[i];
			var gid = result.groupId;
			var points = result.points;
			var seg = new fengmap.FMSegment();
			seg.groupId = gid;
			seg.points = points;
			line.addSegment(seg);
			var lineObject = map.drawLineMark(line, lineStyle);
			naviLines.push(lineObject);
		}
	}
	var mapInit = false
	map.on("loadComplete", function() {
		mapInit = true
	})
	// 获取回放数据
	function httpget(startTime, endTime, did) {
		var url = "../get_http",
			startTime = startTime,
			endTime = endTime;
		did = did;
		var selectArr = $(".demo").val();
		$.ajax({
			type: "post",
			url: "/api/tag/queryTagHistory",
			contentType: "application/json; charset=utf-8",
			dataType: 'json',
			data: JSON.stringify({
				"endTime": endTime,
				"startTime": startTime,
				"tagNos": selectArr
			}),
			success: function(red) {
				
				var datas = red.pagedData.datas;
				var data = []
				if(datas.length==0){
					layer.msg('没有当前人员的历史信息', {icon: 6}); 
				}else{
					for(var a = 0; a < datas.length; a++) {
						var jsonMSgArr = [
							datas[a].sTagNo, datas[a].position[0], datas[a].position[1], datas[a].position[2]
						]
						data.push(jsonMSgArr)
					}
					gethttpdata = data;
					playback(gethttpdata)
				}
				
			}
		});
	}
	//  获取当前标签的所有数据 =》数组格式
	function tagGrouping(data, tagnamse) {
		var tagArr = [];
		for(var a = 0; a < data.length; a++) {
			if(data[a][0] == tagnamse) {
				var jmsg = {
					x: data[a][1],
					y: data[a][2],
					z: data[a][3]
				}
				tagArr.push(jmsg);
			}
		}
		return tagArr;
	}
	//  layui 模态框弹出层
	layui.use('layer', function() { //独立版的layer无需执行这一句

		var $ = layui.jquery,
			info = "请选择回放时间",
			layer = layui.layer; //独立版的layer无需执行这一句
		//触发事件
		var htmls = changeHtml()
		var active = {
			notice: function() {
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
					success: function(layero) {
						var btn = layero.find('.layui-layer-btn');
						btn.find('.layui-layer-btn0').click(function() {
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
		nextadddata: function(data, currentGid) { //假如当前标签数据为第二次进来，将这次标签的数据与第一次进来的数据进行对比，如果相同则改变相同数组的值等于这次进来的数据，   后续进来数据同理\
			//				console.log(data);
			//				console.log(currentGid)
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
	//  图片移动判断
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

	function canaddimg(arr, currentGid) {

		for(var a = 0; a < arr.length; a++) {
			if(imgMarkerAry.length < 1) {
				haskeyarr.keyarr.push(arr[a]);
				zuobiao(arr[a][1], arr[a][2], currentGid, arr[a][0])
			} else {
				var hasnum = haskeyarr.keyadddata(arr[a][0]);

				if(hasnum != false) {
					for(var o = 0; o < imgMarkerAry.length; o++) {
						var imgMarkeraryname = imgMarkerAry[o].opts_.name;
						var hasnumName = hasnum[0];
						console.log(imgMarkeraryname)
						if(imgMarkeraryname == hasnumName) {
							var rood = coodXy(arr[a][1], arr[a][2], currentGid);

							var coord = {
								groupID: 1,
								x: rood.x,
								y: rood.y,
								z: 0
							};
							imgMarkerAry[o].moveTo(coord)
						}
					}
				} else {
					haskeyarr.keyarr.push(arr[a]);
					zuobiao(arr[a][1], arr[a][2], currentGid)
				}
			}
		}
	}
	// 坐标转换 数据坐标转换fengmap坐标系统
	function zuobiao(tagX, tagY, currentGid, tagname) {
		console.log(tagX)
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
			'x': 2462,
			'y': 1860
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
			'x': tag_x,
			'y': tag_y + 20
		}; //定位原点测试
		//转换后的地图坐标

		var mapCoord = trasformer.transform(loc);
		var currentGid = currentGid;

		if(currentGid != -1) {
			addMarker(currentGid, mapCoord, tagname)
			//					addTextMarker(currentGid,mapCoord,tagname)addTextMarker
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
			'x': 2462,
			'y': 1860
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
			'x': tag_x,
			'y': tag_y + 20
		}; //定位原点测试
		//转换后的地图坐标
		//		// // console.log(loc)
		var mapCoord = trasformer.transform(loc);
		return mapCoord
	}

	function playbackimg(time, data) {
		var index = time;
		arrlistdata.init(data[index], 1)
	}
	var time = 0
	var action = true;
	var setimg;
	var newnumss
	$(function() {
		$('.contral').click(function() {
			var nums = $("#newTime").html();
			newnumss = parseInt(nums);
	
			if(action) {
				$.playBar.Begin();
				action = false;
				$(this).find("img").attr("src", "../../../public/image/stop.png")
				setimg = setInterval(function() {
					var nums = $("#newTime").html();
					if(changeType == true) {
						var nowtime = changeNum(newTimeHms)
						time = nowtime
					}
					playbackimg(time, gethttpdata)
					time++
				}, 200)
			} else {
				$(this).find("img").attr("src", "../../../public/image/play.png");
				//						$.playBar.restTime(1000*60)//重新设置时间，并重新开始播放
				$.playBar.Stop();
				action = true;
				clearInterval(setimg)
			}
		});
		//				$.playBar.addBar($('.test'), 1000 * 60); //第一个参数是需要显示播放器的容器，第二个参数为时间，单位毫秒
		$.playBar.changeBarColor("#72dfff"); //设置进度条颜色
		$.playBar.Stop();
	});
};