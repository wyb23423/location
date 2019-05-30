
var map;
var adminId=false;
window.onload = function() {
	var heights = $(window).height();
	console.log(heights)
	$(".left_silde ").height(heights - 60);
	$(".min").height(heights - 60)
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
		viewModeAnimateMode: false,
		defaultViewMode: fengmap.FMViewMode.MODE_2D,
		//开发者申请应用下web服务的key
		key: '83a75157d56ffe85317ed7ba1e8120ff',
		//开发者申请应用名称
		appName: 'hunjingguanchang',
	});

	//打开Fengmap服务器的地图数据和主题
	map.openMapById(fmapID);
	//pop信息框控件配置参数
	var ctlOpt1 = new fengmap.controlOptions({
		mapCoord: {
			x: event.target.x, //设置弹框的x轴
			y: event.target.y, //设置弹框的y轴
			height: 1,
			groupID: 1 //设置弹框位于的楼层
		},
		width: 200, //设置弹框的宽度
		height: 100, //设置弹框的高度
		marginTop: 10, //距离地图的高度
		content: '<a target="_bank" href="http://www.fengmap.com">这是一个信息框</a>', //设置弹框的内容,
		closeCallBack: function() {
			console.log('this popwin closed!');
		}
	});

	var isDynamicMarker = false;
	var btnnum;
	console.log(map)

	function addMarker(gid, coord) {
		var group = map.getFMGroup(gid);

		//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
		var layer = group.getOrCreateLayer('imageMarker');
		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height: 2,
			url: '../../../public/image/blueImageMarker.png',
			size: 32,
			callback: function() {
				im.alwaysShow();
				isDynamicMarker = false
			}
		});
		layer.addMarker(im);
	};
	$("#storng ").hide()
	$("#storng ").show()
	if(adminId==true){
		var s="当前你没有权限进行其他的操作，只能查看区域"
	}else{
		var s="  "
	}
	$("#storng strong").html(
		"备注：选择区域基站模式；"+s
	)
	$("body").on("click", ".textBtn", function() {

		var group = map.getFMGroup(1);
		var layers = group.getOrCreateLayer('imageMarker');
		btnnum = $(this).find("button").data("clicnum");
		var vals = $(this).prev("input").val();
				console.log(vals)
		if(vals !="若完成所有就不用设置" && vals != 0) {
			layui.use('layer', function() { //独立版的layer无需执行这一句
				var $ = layui.jquery,
					layer = layui.layer; //独立版的layer无需执行这一句
				//触发事件
				//示范一个公告层
				layer.open({
					type: 1,
					title: false //不显示标题栏
						,
					closeBtn: false,
					area: '300px;',
					shade: 0.8,
					id: 'LAY_layuipro' //设定一个id，防止重复弹出
						,
					btn: ['确定', '取消'],
					btnAlign: 'c',
					moveType: 1 //拖拽模式，0或者1
						,
					content: '你当前已经选择坐标了  重选需要全部重置  请确定返回第一个点继续配置',
					success: function(layero) {
						var btn = layero.find('.layui-layer-btn');
						$("#zoneForm input").val(" ");
						var group = map.getFMGroup(1);
						$("#storng strong").html(
							"请从新设置第一个点"
						)
						var layers = group.getOrCreateLayer('imageMarker');
						layers.removeAll();
						var layerr = group.getOrCreateLayer('polygonMarker');
						layerr.removeAll();
					}
				});

			});
		} else {
			
				$(this).prev().val(" ")
				var gid = map.groupIDs[0];
				$("#storng ").show()
				$("#storng strong").html(
					"当前设置第" + btnnum + "个点，请在地图区域选择区域点击第一点"
				)
				isDynamicMarker = true;
				var htmls=`
					<div class="layui-form-item">
						<label class="layui-form-label">区域坐标</label>

						<div class="layui-input-block">
							<input type="text" name="onexy" lay-verify="title" value="若完成所有就不用设置" autocomplete="off" placeholder="请设置第一点" class="layui-input">
							<div class="textBtn">
								<button type="button" class="layui-btn layui-btn-sm btn1" data-clicnum="${btnnum+1}">设置</button>
							</div>
						</div>
					</div>
					`
			$("#zoneForm").append(htmls)
		}

	})

	function addhtml(num, coord) {
		var inputlist = $("#zoneForm input");
		$(inputlist[num - 1]).val(
			"{x:" + coord.x + ",y:" + coord.y + ",z:" + coord.z + "}"
		)
	}
	//创建自定义形状标注
	// 矩形
	function createPolygonMakere(coords) {
		var group = map.getFMGroup(map.groupIDs[0]);
		//返回当前层中第一个polygonMarker,如果没有，则自动创建
		layer = group.getOrCreateLayer('polygonMarker');
		polygonMarker = new fengmap.FMPolygonMarker({
			//设置透明度
			alpha: .5,
			//设置边框线的宽度
			lineWidth: 1,
			//设置高度
			height: 6,
			//设置多边形坐标点
			points: coords
		});
		layer.addMarker(polygonMarker);
	}
	// 圆心
	function createCircleMaker(center,r) {
		var group = map.getFMGroup(map.groupIDs[0]);
		
		layer = group.getOrCreateLayer('polygonMarker');
		circleMaker = new fengmap.FMPolygonMarker({
			//设置颜色
			color: '#3CF9DF',
			//设置透明度
			alpha: .3,
			//设置边框线的宽度
			lineWidth: 3,
			//设置高度
			height: 6,
			points: {
				//设置为圆形
				type: 'circle',
				//设置此形状的中心坐标
				center: center,
				//设置半径
				radius:r,
				//设置段数，默认为40段
				segments: 100,
			}
		});
		layer.addMarker(circleMaker);
	};
	var xyJson = [];
	var alarmNum = 0;
	map.on('mapClickNode', function(event) {
		if(event.nodeType == fengmap.FMNodeType.NONE) return;
		if(isDynamicMarker) {
			//获取坐标信息
			var eventInfo = event.eventInfo.coord;
			//获取焦点层
			var currentGid = map.focusGroupID;
			if(eventInfo) { //pc端
				var coord = {
					x: event.eventInfo.coord.x,
					y: event.eventInfo.coord.y,
					z: map.getFMGroup(currentGid).groupHeight + map.layerLocalHeight
				}
			} else { //移动端
				var coord = {
					x: event.mapCoord.x,
					y: event.mapCoord.y,
					z: map.getFMGroup(currentGid).groupHeight + map.layerLocalHeight
				}
			}
			addhtml(btnnum, coord)
			//添加Marker
			addMarker(currentGid, coord);
		
		}
	});
	function ponCoords(){
		var coords = [];
		var inputlist = $("#zoneForm input");

		for(var a = 0; a < inputlist.length; a++) {
			var valjsp = $(inputlist[a]).val();
		
			if(valjsp=="若完成所有就不用设置"){
				
			}else{
				var jsonVal = eval("(" + valjsp + ")")
				var cood = getCoordinate(jsonVal)
				coords.push(jsonVal);
				xyJson.push(cood)
			}
			
		}
		createPolygonMakere(coords)
	}
	layui.use(['form', 'layedit', 'laydate'], function() {
		var form = layui.form,
			layer = layui.layer,
			layedit = layui.layedit,
			laydate = layui.laydate;

		//创建一个编辑器
		//自定义验证规则
		form.verify({
			title: function(value) {
				if(value.length < 1) {
					return '标题至少得1个字符啊';
				}
			},
			pass: [/(.+){6,12}$/, '密码必须6到12位'],
			content: function(value) {
				layedit.sync(editIndex);
			}
		});

		//监听提交
		form.on('submit(demo1)', function(data) {
			var formeInfo = data.field;
			var enableType = formeInfo.enable;
			if(enableType == "on") {
				enableType = 1
			} else {
				enableType = 0
			}
			ponCoords()
			
			setTimeout(function(){
				layer.confirm('请确定当前区域范围 ', function(index){
  					//do something
					  addZone(enableType, xyJson);
					  console.log(xyJson)
					 
			  	layer.close(index);
				}); 
			},1000)
//			
			return false;
		});

		//表单初始赋值

	});
	var datalist,zonlist; 
	function addZone(enableType, xyJson) {
		console.log(xyJson)
		var urls = "/api/zone/addZone"
		var Dat = new Date();
		var timestamp = new Date().getTime();
		var username = $("#username").val();
		 datalist = {
			"createTime": timestamp,
			"createUser": "string",
			"enable": enableType,
			"name": username,
			"position": xyJson,
			"updateTime": timestamp,
			"updateUser": "string"
		}
		zonlist=datalist = JSON.stringify(datalist)
		
		postAjax(urls, datalist)
	}

	function postAjax(urls, data) {
		var contentType = "application/json;charset=UTF-8";
		var layer = layui.layer;
		console.log(data)
		$.ajax({
			type: "post",
			url: urls,
			async: true,
			data: data,
			contentType: contentType,
			success: function(red) {
				var cobackInfo = red.success;
				if(cobackInfo == true) {

					var ii = layer.load();
					//此处用setTimeout演示ajax的回调
					setTimeout(function() {
						layer.close(ii);
						layer.msg('添加成功');
						$(window).scrollTop(0);

						//
						//								window.location.href="anchornumInfo.html?id="+data.id
					}, 1000);
					setTimeout(function() {

						location.reload();

					}, 2000)
				}
			},
			error: function() {
				console.log("err")
				var ii = layer.load();
				//此处用setTimeout演示ajax的回调
				setTimeout(function() {
					layer.close(ii);
					layer.msg('加失败，请重新填写');
					//							location.reload();
				}, 1000);
				setTimeout(function() {
					//							location.reload();
				}, 1000)
			}
		});
	}

	//获取区域数据 显示状态  及操作
	$.ajax({
		type: "get",
		url: "/api/zone/getall",
		async: true,
		data: {
			'currentPage': 10,
			"pageSize": 100
		},
		success: function(data) {
			datalist = data.pagedData.datas;
			zonlist=datalist;
			addZon(datalist)
		}
	});

	function addZon(datalist) {
		for(var a = 0; a < datalist.length; a++) {
			var enable = datalist[a].enable;
			if(enable == 1) {
				enable = "开启"
			} else {
				enable = "关闭"
			}
			var name = datalist[a].name;
			console.log(datalist[a])
			var id = datalist[a].id;
			var postition=datalist[a].position;
			var htmls = `
				<tr data-id="${id}" >						
						<td style="width:20%">${name}</td>
					<td style="width:20%">
						${enable}
					</td>
					<td style="display:none" class="pistitionlist">
						${postition}
					</td>
					<td>
						<a class="layui-btn layui-btn-danger layui-btn-xs delete"  lay-event="del">删除区域</a>
						<a class="layui-btn layui-btn-danger layui-btn-xs showZone"  lay-event="show">显示区域</a>
					</td>
				</tr>
		`
			$("#tbodylist").append(htmls)
			if(adminId==true){
				$(".delete").hide()
				$(".addzone").hide()
			}
		}
	}
	// 删除
	var zoneopnclick = 0;
	$("#tbodylist").on("click",".showZone",function(){
		var id=$(this).parent().parent().data("id");
		var zone,zonename;
		for(var a=0;a<zonlist.length;a++){
			if(zonlist[a].id==id){
				zone=zonlist[a]
			}
		}
		if (zoneopnclick == 0) {
			$(this).html("关闭区域").addClass("btn-primary").removeClass("layui-btn-danger")
			zoneOpen(zone)
			zoneopnclick = 1
		} else {
			$(this).html("显示区域").removeClass(" btn-primary").addClass("layui-btn-danger");
			removerLayui(zone.name)
			zoneopnclick = 0
		}
		
	})
	function removerLayui(names) {

		for (var a = 0; a < textMarker.length; a++) {
			console.log(names)
			if (names+"区域" == textMarker[a].name_) {
				console.log(textMarker[a])
				layers.removeMarker(textMarker[a]);
			}
		}
		for (var a = 0; a < createPolygonMakerArr.length; a++) {
			if (names == createPolygonMakerArr[a].params.o3d.name) {
				layerPolygonMaker.removeMarker(createPolygonMakerArr[a]);
			}
		}

	}
	var zoneOpenArr=[]
	$("body").on("click", ".delete", function() {
		var id = $(this).parent().parent().data("id");
		var layer = layui.layer;
		
		$.ajax({
			type: "post",
			url: "/api/zone/deleteZone",
			async: true,
			data: {
				"id": id
			},
			success: function(dta) {
				var ii = layer.load();
				//此处用setTimeout演示ajax的回调
				setTimeout(function() {
					layer.close(ii);
					layer.msg('删除成功');
					$(window).scrollTop(0);
				}, 1000);
				setTimeout(function() {
					location.reload();
				}, 2000)
			},
			error: function() {
				var ii = layer.load();
				//此处用setTimeout演示ajax的回调
				setTimeout(function() {
					layer.close(ii);
					layer.msg('删除失败，请重试');
					$(window).scrollTop(0);
				}, 1000);
				setTimeout(function() {
					location.reload();
				}, 2000)
			}
		});
	})
	function zoneOpen(data) {
		zoneOpenArr.push(data.id)
		var list;
		var zonlistarr = [];
		var Alist = [];
		var zones = data.position;
		zones = eval("(" + zones + ")");
		console.log(zones)
		createPolygonMaker(zones, data.name)
		addTextMarker(zones[0], data.name)

	}
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
	function GetRandomNum(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		return (Min + Math.round(Rand * Range));
	}
	
	var createPolygonMakerArr = [];
	function createPolygonMaker(coords, name) {
		var coordslist = [];
		for (var a = 0; a < coords.length; a++) {
			var newlist = coodXy(coords[a].x, coords[a].y, 1)
			coordslist.push(newlist)
		}
		var colors = method1()
		var helght = GetRandomNum(3, 6)
		
		var group = map.getFMGroup(map.groupIDs[0]);
		//返回当前层中第一个polygonMarker,如果没有，则自动创建
		layerPolygonMaker = group.getOrCreateLayer('polygonMarker');
//		console.log(layerPolygonMaker)
//		if(layerPolygonMaker)
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
	var textMarker = []

	function addTextMarker(coord, names) {
		var coordslist = [];
		var newlist = coodXy(coord.x, coord.y, 1)
		var group = map.getFMGroup(map.groupIDs[0]);
		//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
		layers = group.getOrCreateLayer('textMarker');

		var gpos = group.mapCoord;

		//图标标注对象，默认位置为该楼层中心点
		tm = new fengmap.FMTextMarker({
			name: names+"区域",
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
	function coodXy(tagX, tagY, tagz,currentGid) {
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
			'x': 3073,
			'y': 2326
		}; //定位范围
		//根据定位四个角点的地图坐标点
		var mapParas = [];
		mapParas[0] = {//定位原点地图坐标
			'x': 11582810.7716, //11582810.6969
			'y': 3575751.7814	//3575751.9700
		}; 
		mapParas[1] = {//X轴终点地图坐标
			'x': 11582841.6422,
			'y': 3575751.7814
		}; 
		mapParas[2] = {//定位原点对角点地图坐标
			'x': 11582841.6422,
			'y': 3575775.2670
		}; 
		mapParas[3] = {//Y轴终点地图坐标
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
		mapCoord.z=tagz;
		return mapCoord
	}
	function getCoordinate(xy) {
//		console.log(xy)
		//创建转换器
		var trasformer = new CoordTransformer();
		//来至定位系统的参数 定位的原点坐标 已经定位的范围
		var locOrigion = {
			'x':  11582810.7716,
			'y': 3575751.7814
		}; //定位坐标原点
		var locRange = {
			'x': 30.73,
			'y': 23.26
		}; //定位范围
		//根据定位四个角点的地图坐标点
		var mapParas = [];
		mapParas[0] = {
			'x': 0,
			'y': 0
		}; //定位原点地图坐标
		mapParas[1] = {
			'x': 3073,
			'y': 0
		}; //X轴终点地图坐标
		mapParas[2] = {
			'x': 3073,
			'y': 2326
		}; //定位原点对角点地图坐标
		mapParas[3] = {
			'x': 0,
			'y': 2326
		}; //Y轴终点地图坐标
		//转换器初始化
		trasformer.init(locOrigion, locRange, mapParas);
		//定位系统中的定位坐标
		var loc = {
			'x': xy.x,
			'y': xy.y
		}; //对角点测试
		//转换后的地图坐标
		var mapCoord = trasformer.transform(loc);
		return mapCoord
	}
	layui.use('form', function() {
		var form = layui.form;
		//各种基于事件的操作，下面会有进一步介绍
		form.on('select(zoneselect)', function(data) {
			alarmNum = parseFloat(data.value);
		});
	});
	
};