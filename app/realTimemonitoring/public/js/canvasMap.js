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

	function createMap() {
		if (root.offsetHeight) {
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
		} else {
			requestAnimationFrame(createMap);
		}
	}

	createMap();

	return root;
}

// 获取标签相关对象
var getTag = (function () {
	var tags = {}; // 标签

	return function (id, create = true) {
		var tagObj = tags[id];
		if (!tagObj && create) {
			var icon = tagfor[0].photo;
			var tag = new WsGui.Canvas2DImage(id).attr('src', icon);

			tag.animation = new WsGui.Canvas2DAnimation(1000).addEndCall(() => paint(tagObj));

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