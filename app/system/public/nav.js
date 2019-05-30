var map;
var navi = null;
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
	//地图加载完成回调
	//地图加载完成回调
	map.on('loadComplete', function() {
		//初始化导航对象
		navi = new fengmap.FMNavigation({
			map: map,
			// 设置导航线的样式
			lineStyle: {
				//设置线为导航线样式
				lineType: fengmap.FMLineType.FMARROW,
				lineWidth: 6,
				//设置线的颜色
				// godColor: '#FF0000',
				//设置边线的颜色
				// godEdgeColor: '#920000',
			}
		});
	});

	// 点击计数
	var clickCount = 0;

	//判断起点是否是同一处坐标
	var lastCoord = null;
	$("#zoneForm").on("click", ".textBtn", function() {
		clickCount = $(this).find("button").data("clicnum");
		$(this).prev().val(" ")
		var gid = map.groupIDs[0]
		$("#storng ").show()
		$("#storng strong").html(
			"当前设置第" + clickCount + "个点，请在地图区域选择区域点击第一点"
		)
		isDynamicMarker = true
	})
	$("#clearNav").click(function() {
		navi.clearAll();
		clickCount = 0;
		lastCoord = null;
		$("#zoneForm input").val("  ");
	})
	//点击地图事件。开始选点开始后，点击地图一次为起点，第二次点击为终点
	map.on('mapClickNode', function(event) {
		if(event.nodeType == fengmap.FMNodeType.MODEL && navi != undefined) {
			var modelLabel = event.label;
			var coord;
			// 如果拾取的模型没有Label对象，则使用模型中心点的坐标
			// 有则使用与模型对应的Label对象的坐标。
			//			console.log(modelLabel)
			if(!modelLabel) {
				coord = {
					x: event.mapCoord.x,
					y: event.mapCoord.y,
					groupID: event.groupID
				}
			} else {
				coord = {
					x: event.mapCoord.x,
					y: event.mapCoord.y,
					groupID: event.groupID
				};
			}
			console.log(clickCount)

			//第三次点击清除路径，重现设置起点起点
			if(clickCount == 3) {
				navi.clearAll();
				clickCount = 0;
				lastCoord = null;
			   
			}

			//第一次点击添加起点
			if(clickCount == 1) {
				lastCoord = coord;
				navi.setStartPoint({
					x: coord.x,
					y: coord.y,
					height: 2,
					groupID: coord.groupID,
					url: '../../../public/image/start.png',
					size: 32
				});
				addhtml(clickCount, coord)

			} else if(clickCount == 2) { //添加终点并画路线
				//判断起点和终点是否相同
				if(lastCoord.x == coord.x) {
					$('#message').attr("class", "alert alert-warning");
					return;
				} else {
					$('#message').attr("class", "alert alert-warning hidden");
				}
				addhtml(clickCount, coord)
				navi.setEndPoint({
					x: coord.x,
					y: coord.y,
					height: 2,
					groupID: coord.groupID,
					url: '../../../public/image/end.png',
					size: 32
				});

				// 画导航线
				navi.drawNaviLine();
			}
			clickCount++;
		}
	})

	function addhtml(num, coord) {
		var inputlist = $("#zoneForm input");
		$(inputlist[num - 1]).val(
			"{X:" + coord.x + ",Y:" + coord.y + "}"
		)
	}
	map.openMapById(fmapID);

};