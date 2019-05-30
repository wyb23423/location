
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

	var isDynamicMarker = true;
	var btnnum;
	console.log(map)

	$("#storng ").hide()
	$("#storng ").show()
	if(adminId==true){
		var s="当前你没有权限进行其他的操作，只能查看区域"
	}else{
		var s="  "
	}
	$("#storng strong").html(
		"请根据提示步骤完成基站录入， 1、先设置基站原点  2、添加基站  3、提交分组"
	)
	// 圆心
	var layermode = layui.layer;
	var lagermodeArr=[];
	var coordTow=null;
	map.on('mapClickNode', function(event) {
		console.log(event.nodeType == fengmap.FMNodeType.IMAGE_MARKER)
		if (event.nodeType == fengmap.FMNodeType.IMAGE_MARKER) {
		} else{
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
				layermode.confirm('你是否在进行原点选取', {
					btn: ['取消','确定'] //按钮
				}, function(){
					
				}, function(){
					if(lagermodeArr.length==0){
						coordTow=getCoordinate(coord)
						addMarkers(coord);
						console.log(coordTow)
					}else{
						layermode.confirm('你已经选取点，是否更换基站原点',{
							btn:["取消","确定"]
						},
						function(){
							
						},function(){
							layer.removeMarker(originlist)
							 coordTow=getCoordinate(coord)
							addMarkers(coord)
						})
					}
						lagermodeArr.push(layer.index)
					}
				);
			
			}
			
		}
	});
	var originlist=[],anchorList=[];
	function addMarkers(coord ,anchorInfo=null) {
		var baseorigin,Images;
		if(anchorInfo==null){
			Images="../../../public/image/query_function_location.png";
			baseorigin='原点';
		}else{
			Images="../../../public/image/anchor.png";
			baseorigin=anchorInfo.base_no;
		}
		var group = map.getFMGroup(map.groupIDs[0]);
		//返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
		layer = group.getOrCreateLayer('imageMarker');
		//图标标注对象，默认位置为该楼层中心点
		var im = new fengmap.FMImageMarker({
			x: coord.x,
			y: coord.y,
			height:coord.z,
			url:Images,
			size: 32,
			name: baseorigin,
			callback: function () {
			}
		});
		layer.addMarker(im);
		if(anchorInfo==null){
			originlist=im
		}else{
			anchorList.push(im)
		}
	};
	
	layui.use(['form', 'layedit', 'laydate'], function() {
		var form = layui.form;
		//监听提交
		form.on('submit(demo1)', function(data) {
			var formeInfo = data.field;
		
			appendAnchor(formeInfo)
			return false;
		});
	});
	var datalist,zonlist,anchorArr=[]; 
	function appendAnchor(formeInfo){
	
		var coord,coordx,coordy;
		if(coordTow==null){
			layer.msg('你未设置基站原点，基站原点默认为地图原点');
			 coordx=parseFloat(formeInfo.coordx);
			 coordy=parseFloat(formeInfo.coordy);
			 coord=coodXy(coordx,coordy,1);
			addMarkers(coord,formeInfo)
		}else{
			 coordx=parseFloat(formeInfo.coordx)+coordTow.x;
			 coordy=parseFloat(formeInfo.coordy)+coordTow.y;
			
			coord=coodXy(coordx,coordy,1);
			addMarkers(coord,formeInfo)
		}
		addTextMarker(coord,formeInfo.base_no)
		var anchor={
			coordXY:{
				x:coordx,
				y:coordy
			},
			name:formeInfo.base_no,
			formeInfo:formeInfo
		}
		anchorArr.push(anchor)
		addtable(anchor)
	}
	function addtable(data){
		var htmldata=data.formeInfo;
		console.log(data)
		var htmls=`
			<tr>
				<td>${htmldata.name}</td>
				<td><input type="text" class="coordx" name="coordx" value="${htmldata.coordx}" style="width:100%"></td>
				<td><input type="text" class="inputchange" name="coordx" value="${htmldata.coordy}" data-ids="${htmldata.base_no}"  style="width:100%"></td>
			</tr>
		`
		$("#ancharTable").append(htmls)
	}
	$("#ancharTable").on("change",".inputchange",function(e){
		
		var coordy=$(this).val();
		var ids=$(this).data("ids");
		var coordx=$(this).parent().parent().find(".coordx").val();
	
		anchorMoveto(coordx,coordy,ids)
	})
	function anchorMoveto(coordxnew,coordynew,ids){
	
		for(var a=0;a<anchorList.length;a++){
			if(anchorList[a].name_==ids){
				var coordx,coordy;
				console.log(anchorArr[a])
				if(coordTow==null){
					layer.msg('你未设置基站原点，基站原点默认为地图原点');
					 coordx=parseFloat(coordxnew);
					 coordy=parseFloat(coordynew);
					 coord=coodXy(coordx,coordy,1);
				}else{
					 coordx=parseFloat(coordxnew)+coordTow.x;
					 coordy=parseFloat(coordynew)+coordTow.y;
					 coordz=parseFloat(0)/100;
					coord=coodXy(coordx,coordy,1);
				}
				anchorList[a].moveTo({
					x: coord.x,
					y: coord.y,
					name: ids,
					callback: function () {
					},
					update: function (obj) {
					}
				})
				var coordXY={
					x:coordx,
					y:coordy
				}
				anchorList[a].coordXY=coordXY
				var name;
				for(var i=0;i<addTextMarkarr.length;i++){
					if(addTextMarkarr[i].name_==ids){
						layers.removeMarker(addTextMarkarr[i])
					}
				}
				addTextMarker(coord,ids)
			}
		}
	}
	function  postfroms(){
		console.log(anchorArr)
	}
	var urls = "/api/base/addBase";
	$(".sumintslid").click(function(){
	
		for(var a=0;a<anchorArr.length;a++){
			var formeInfo=anchorArr[a].formeInfo;
			console.log(anchorArr)
			var data = {
				"alarm": 1,
				"baseNo": formeInfo.base_no,
				"coordx": anchorArr[a].coordXY.x,
				"coordy": anchorArr[a].coordXY.y,
				"coordz": formeInfo.coordz,
				"createTime": null,
				"createUser": null,
				"description": formeInfo.description,
				"groupCode": formeInfo.group_code,
				"install_time": null,
				'ip': formeInfo.ip,
				'location':null,
				'loseRate': "0",
				"main":formeInfo.main,
				'name': formeInfo.name,
				'owner': null,
				"group_base_size":formeInfo.group_base_size,
				"min_base_size":formeInfo.min_base_size,
				'update_time': null,
				'update_user': 'string',
				'upload_type': "1",
				'work': true,
				'zone': formeInfo.zone,
				"algorithm_type":formeInfo.algorithm_type,
				"time_correction_value":formeInfo.time_correction_value
			};
			console.log(data)
			var data = JSON.stringify(data);
			postAjax(urls,data)
		}
		
	})
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
						// window.location.href="anchornumInfo.html?id="+data.id
					}, 1000);
					setTimeout(function() {
						// location.reload();
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
		var zonelist =datalist;
		console.log()
		for(var a = 0; a < zonelist.length; a++) {
			var htmls = `
				<option value="${zonelist[a].id}">${zonelist[a].name}</option>
			`
			var optionhtmls = `
				<dd lay-value="${zonelist[a].id}" >${zonelist[a].name}</dd>
			`
			$("#zone").append(htmls);
			//							$("#zone").next(".layui-unselect").find(".layui-anim-upbit").append(optionhtmls);
		}
		layui.use('form', function() {
			var form = layui.form;

			form.render('select'); //刷新select选择框渲染
			//各种基于事件的操作，下面会有进一步介绍
		});
	}
	// 删除
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
			console.log(data.elem); //得到select原始DOM对象
			console.log(data.value); //得到被选中的值
			console.log(data.othis); //得到美化后的DOM对象
			alarmNum = parseFloat(data.value) + 1;
		});
	});
	
};
var addTextMarkarr=[]
function addTextMarker(coord, names) {
	var newlist = coord;
	var group = map.getFMGroup(map.groupIDs[0]);
	//返回当前层中第一个textMarkerLayer,如果没有，则自动创建
	layers = group.getOrCreateLayer('textMarker');

	var gpos = group.mapCoord;

	//图标标注对象，默认位置为该楼层中心点
	tm = new fengmap.FMTextMarker({
		name: names,
		//填充色
		x: newlist.x,
		y: newlist.y-1,
		fillcolor: "255,0,0",
		//字体大小
		fontsize: 15,
		//边框色
		strokecolor: "255,255,0",
		callback: function () {
			// 在图片载入完成后，设置 "一直可见"
			tm.alwaysShow();
		}
	});
	//文本标注层添加文本Marker
	layers.addMarker(tm);
	addTextMarkarr.push(tm)
};

var a=11; function test2(){ this.a=22; let b=()=>{console.log(this.a)}; b(); } var x=new test2()