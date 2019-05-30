// var measurement = {
// 	obj: null,
// 	parentobj: null,
// 	nextcanvas: null,
// 	clicknum: 0,
// 	colodX: null,
// 	colodY: null,
// 	colodX1: null,
// 	colodY1: null,
// 	context: null,
// 	toppx: 102 - 50,
// 	leftpx: 220,
// 	div: null,
// 	spancd2: null,
// 	init: function (nextid) {
// 		var parent = document.getElementById(nextid);

// 		this.div = document.createElement("div");
// 		this.div.setAttribute("id", "newDiv");
// 		this.div.setAttribute("style", "position: absolute;z-index: 9;");

// 		parent.append(this.div)
// 	},
// 	addmeasurement: function (nextid) {

// 	},
// 	getflist: function (event) {
// 		console.log(event)
// 		var spans = document.getElementById("lastcho");
// 		if (spans != null) {
// 			this.div.removeChild(spans);
// 		}
// 		this.colodX = event.clientX - this.leftpx;
// 		this.colodY = event.clientY - this.toppx;
// 		this.spancd = document.createElement("span");
// 		this.spancd.setAttribute("id", "flistcho");
// 		this.div.setAttribute("style", "position: absolute;z-index: 9;left: " + this.colodX + "px;top:" + this.colodY + "px");

// 		console.log(document.getElementById("flistcho"))
// 		if (document.getElementById("flistcho") == null) {

// 			this.div.append(this.spancd)
// 			this.spancd.setAttribute("style", "position: absolute;left: -5px;top:-5px;background: #edbf3b;width: 10px;height: 10px;border-radius: 50%;");
// 		} else if (
// 			document.getElementById("flistcho") != null
// 		) {
// 			this.spancd.setAttribute("style", "position: absolute;left: -5px;top:-5px;background: #edbf3b;width: 10px;height: 10px;border-radius: 50%;");
// 		}
// 		//		this.div.addEventListener(event,this.movercanvas,false)
// 	},
// 	getlast: function (event, numer) {
// 		console.log(event)
// 		this.colodX1 = event.clientX - this.leftpx;
// 		this.colodY1 = event.clientY - this.toppx;
// 		if (this.colodX1 > this.colodX || this.colodY1 > this.colodY1) {
// 			var widthx = this.colodX1 - this.colodX;
// 			var heighty = this.colodY1 - this.colodY;
// 			var span2x = widthx - 10,
// 				span2y = heighty - 10;
// 			console.log(span2x)
// 			this.div.setAttribute(
// 				"style", "position: absolute;z-index: 9;left: " + this.colodX + "px;top:" + this.colodY + "px;width:" + widthx + "px;height:" + heighty + "px;border:3px dashed red;"
// 			)
// 		} else if (this.colodX1 < this.colodX || this.colodY1 < this.colodY) {
// 			var widthx = this.colodX - this.colodX1;
// 			var heighty = this.colodY - this.colodY1;
// 			var span2x = this.colodX,
// 				span2y = this.colodY - 10
// 			console.log(span2x)
// 			this.div.setAttribute(
// 				"style", "position: absolute;z-index: 9;left: " + this.colodX + "px;top:" + this.colodY + "px;width:" + widthx + "px;height:" + heighty + "px;border:3px dashed red;transform: translate(" + -widthx + "px," + -heighty + "px);"
// 			)

// 		} else if (this.colodX1 > this.colodX || this.colodY1 < this.colodY) {
// 			var widthx = this.colodX1 - this.colodX;
// 			var heighty = this.colodY - this.colodY1;
// 			var span2x = this.colodX,
// 				span2y = this.colodY - 10
// 			console.log(span2x)
// 			this.div.setAttribute(
// 				"style", "position: absolute;z-index: 9;left: " + this.colodX + "px;top:" + this.colodY + "px;width:" + widthx + "px;height:" + heighty + "px;border:3px dashed red;transform: translate(" + -widthx + "px," + -heighty + "px);"
// 			)
// 		} else if (this.colodX1 < this.colodX || this.colodY1 > this.colodY) {
// 			var widthx = this.colodX - this.colodX1;
// 			var heighty = this.colodY1 - this.colodY;
// 			var span2x = this.colodX,
// 				span2y = this.colodY - 10
// 			console.log(span2x)
// 			this.div.setAttribute(
// 				"style", "position: absolute;z-index: 9;left: " + this.colodX + "px;top:" + this.colodY + "px;width:" + widthx + "px;height:" + heighty + "px;border:3px dashed red;transform: translate(" + -widthx + "px," + -heighty + "px);"
// 			)
// 		}

// 		if (document.getElementById("lastcho") == null) {

// 			console.log(2)
// 			this.spancd2 = document.createElement("span");
// 			this.spancd2.setAttribute("id", "lastcho");
// 			this.div.append(this.spancd2);
// 			this.spancd2.setAttribute("style", "position: absolute;left:" + span2x + "px;top:" + span2y + "px;background: #edbf3b;width: 10px;height: 10px;border-radius: 50%;");

// 		} else
// 		if (document.getElementById("lastcho") != null) {
// 			console.log(1)
// 			this.spancd2.setAttribute("style", "position: absolute;left:" + span2x + "px;top:" + span2y + "px;background: #edbf3b;width: 10px;height: 10px;border-radius: 50%;");
// 		}



// 		this.alongnum(widthx, heighty)
// 	},
// 	movercanvs: function (even) {
// 		this.onmouseover = function () {

// 		}
// 	},
// 	alongnum: function (x, y) {
// 		var a = Math.sqrt(x * x + y * y);

// 	}
// }

// function getwebsocket(evt) {
// 	if (evt) {
// 		var jsonMSg = JSON.parse(evt);
// 		if (jsonMSg.length !== 1) {
// 			var x = parseFloat(jsonMSg.position[0]),
// 				y = parseFloat(jsonMSg.position[1]),
// 				z = parseFloat(jsonMSg.position[0]);

// 			if (!(x < 0 || y < 0)) {
// 				var jsonMSgArr = [jsonMSg.sTagNo, 560 + x, 450 + y, 0, 0, tagfor];
// 				canvasdraw.addimglist.init(jsonMSgArr, 1);
// 			}
// 		}
// 	}
// }


// 地图配置
var config = {
	bg: '../public/image/5ad8909aeff13.png',
	width: 3062,
	height: 2302,
	time: 5000
}

var map;
var ids = {}; // 在地图上的标签编号, 用于筛选人员

// 初始化地图
function init() {
	var root = document.getElementById('fengMap');
	var engine = new WsGui.Engine(root).addLayer(1);

	var bg = new WsGui.Canvas2DImage('bg').attr({
		src: config.bg,
		width: '100%',
		height: '100%'
	});
	bg.style.loadImg().then(function (img) {
		var width = root.offsetWidth / 2;
		var height = width * img.height / img.width;
		map = new WsGui.Container('map')
			.attr({
				width: width,
				height: height,
				left: width / 2,
				top: (root.offsetHeight - height) / 2
			})
			.add(bg);

		engine.getLayer(1).add(map);
	})
	engine.render();

	return root;
}

// 获取标签相关对象
var getTag = (function () {
	var tags = {}; // 标签

	return function (id) {
		var tagObj = tags[id];
		if (!tagObj) {
			var icon = tagfor[0].photo;
			var tag = new WsGui.Canvas2DImage('tag_' + id + '_icon').attr('src', icon);

			tag.animation = new WsGui.Canvas2DAnimation(1000)
				.addEndCall(function () {
					paint(tagObj);
				});

			tags[id] = tagObj = {
				isInit: true,
				pos: [],
				tag: tag,
				timer: null,
				id: id
			}
		}

		return tagObj;
	}
})();

// 刷新标签
function paint(tagObj) {
	if (tagObj.timer) {
		clearTimeout(tagObj.timer);
		tagObj.timer = null;
	}

	var pos = tagObj.pos.shift();
	var tag = tagObj.tag;
	if (pos) {
		tag.isVisible = true;
		var attr = {
			left: pos[0],
			bottom: pos[1]
		};

		if (tagObj.isInit) { // 标签没有在地图上, 直接添加
			tagObj.isInit = false;
			map.add(tag.attr(attr));
			ids[tagObj.id] = true;

			tagObj.timer = setTimeout(paint, config.time, tagObj);
		} else { // 标签在地图上, 移动标签
			tag.animation.stop();
			tag.animation
				.addFrame(0, {
					left: tag.style.left,
					bottom: tag.style.bottom
				})
				.addFrame(1, attr)
				.start();
		}
	} else {
		tagObj.timer = setTimeout(function () {
			// 信号消失, 移除标签
			tagObj.isInit = true;
			tag.animation.stop();
			map.remove(tag, false);

			ids[tagObj.id] = false;
		}, config.time);
	}
}

function getwebsocket(evt) {
	if (!map) return;

	if (evt) {
		var jsonMSg = JSON.parse(evt);
		if (jsonMSg.length !== 1) {
			var x = parseFloat(jsonMSg.position[0]),
				y = parseFloat(jsonMSg.position[1]);

			if (!(x < 0 || y < 0)) {
				fortag(jsonMSg.sTagNo);

				if (tagfor.length) {
					x *= map.width / config.width / WsGui.devicePixelRatio;
					y *= map.height / config.height / WsGui.devicePixelRatio;

					var tagObj = getTag(jsonMSg.sTagNo);
					tagObj.pos.push([x, y]);
					paint(tagObj);
				}
			}
		}
	}
}