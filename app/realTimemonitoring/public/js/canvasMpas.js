/**	 */
var canvasdraw = {
	moveTox: null,
	moveToy: null,
	obj: null,
	context: null,
	peopleCtx: null,
	originX: 0,
	originY: 0,
	scaleX: 0,
	scaleY: 0,
	gridstep: 60,
	scalerate: 1.2,
	griddotted: 1,
	downdistanceX: 0,
	downdistanceY: 0,
	planwidth: 0,
	planheight: 0,
	planscalex: 1,
	planscaley: 1,
	showgrid: !1,
	backgroundimg: null,
	anchorimg: null,
	tagdaddrimg: null,
	tagdaddrimg2: null,
	algorithmobj: null,
	devicesobj: null,
	domain: null,
	tagshowmodel: 0,
	cameranum: 3,
	clickstate: false,
	divhtmls: null,
	pxcm: 0.016947,
	slicenumMin: 0,
	slicenumMax: 0,
	state: false,
	cameras: {
		1: {},
		2: {},
		3: {}
	},
	measureArr: [],
	rid: null,
	init: function (t, i, s, c, d) { // 初始化
		console.log(s)
		this.obj = document.getElementById(t), // 获取对象
			this.context = this.obj.getContext("2d"), // 对象创建 2d的canvas 区
			this.devicesobj = s,
			this.domain = i;
		this.peopleObj = document.getElementById(c);
		this.peopleCtx = this.peopleObj.getContext("2d") // 标签单用canvas
		this.drawfencesObj = document.getElementById(d);
		this.drawfencesCtx = this.drawfencesObj.getContext("2d")
	},
	resizeCanvas: function () { //   调整画布大小
		var t = document.getElementById("main"),
			i = t.offsetHeight,
			s = t.offsetWidth;
		// console.log(t)
		this.obj.width = s,
			this.obj.height = i - 0,
			this.originX = 0 * this.obj.width, //  设置起点X
			this.originY = 1 * this.obj.height, //  设置起点Y
			this.scaleX = .5 * this.obj.width, //  缩小X
			this.scaleY = .5 * this.obj.height //  缩小Y

		this.rid = null;
	},
	loadbgimg: function (t, labelarr) { // 添加图片

		var i = this;
		this.backgroundimg = new Image,
			this.backgroundimg.src = this.domain + t,
			this.anchorimg = new Image, // 添加基站图片
			this.anchorimg.src = this.domain + "/public/image/anchor.png",

			this.backgroundimg.width > 0 ? this.backgroundimg.onload = function () {
				i.anchorimg.onload = function () {
					i.drawflow()
				}
			} : this.anchorimg.onload = function () {
				i.drawflow()
			}
	},
	setrate: function (t, i, s) { // 控制大小
		var e = i - this.originX,
			h = s - this.originY;
		t ? (this.gridstep /= this.scalerate, e /= this.scalerate, h /= this.scalerate) :
			(this.gridstep *= this.scalerate, e *= this.scalerate, h *= this.scalerate),
			this.scaleX = this.originX = i - e,
			this.scaleY = this.originY = s - h;
		this.rid = null;
	},
	drawgrid: function () {
		if (!this.rid) {
			var rid = this.rid = document.createElement('canvas');
			rid.width = this.obj.width;
			rid.height = this.obj.height;

			var ctx = rid.getContext('2d');
			ctx.beginPath();
			for (var t = this.scaleY; t <= this.obj.height; t += this.gridstep)
				for (var i = 0; i <= this.obj.width; i += 2 * this.griddotted) ctx.moveTo(i, t),
					ctx.lineTo(i + this.griddotted, t);
			for (t = this.scaleY - this.gridstep; t >= 0; t -= this.gridstep)
				for (i = 0; i <= this.obj.width; i += 2 * this.griddotted) ctx.moveTo(i, t),
					ctx.lineTo(i + this.griddotted, t);
			for (t = this.scaleX; t <= this.obj.width; t += this.gridstep)
				for (i = 0; i <= this.obj.height; i += 2 * this.griddotted) ctx.moveTo(t, i),
					ctx.lineTo(t, i + this.griddotted);
			for (t = this.scaleX - this.gridstep; t >= 0; t -= this.gridstep)
				for (i = 0; i <= this.obj.height; i += 2 * this.griddotted) ctx.moveTo(t, i),
					ctx.lineTo(t, i + this.griddotted);

			ctx.stroke();
		}

		this.context.drawImage(this.rid, 0, 0, this.rid.width, this.rid.height);
	},
	draworigin: function () {
		this.context.arc(this.originX, this.originY, .2 * this.gridstep, 0, 360, !1),
			this.context.lineWidth = 1,
			this.context.strokeStyle = "red",
			this.context.stroke(),
			this.context.beginPath()
	},
	resetorigin: function (t, i, s, e) {
		t ? (this.scaleX = this.originX = i - this.downdistanceX, this.scaleY = this.originY = s - this.downdistanceY) : (this.downdistanceX = i - this.originX, this.downdistanceY = s - this.originY)
	},
	drawflow: function () {
		this.context.clearRect(0, 0, this.obj.width, this.obj.height); // 重置
		this.showgrid ? (this.drawplan(), this.drawgrid()) : (this.drawgrid(), this.drawplan());
		this.draworigin(); // 圆
		this.drawfences(); // 线
		this.drawcamera(); // 暂无功能
		this.drawanchor(); // 写字
		this.drawpoint(this.devicesobj);
	},
	drawfencesBj: function (fenceoArr) {
		var fenceoObj = this.devicesobj.fenceobj;
		var fenceoArr = fenceoArr;
		var A_x = fenceoArr.x
		var A_y = fenceoArr.y;
		var A_tagno = fenceoArr.tagNo
		for (var t in fenceoObj) {
			var fenceParm = fenceoObj[t].param;
			var fenceName = fenceoObj[t].name;
			var G1_x = this.originX + (fenceParm[0].x + 580) / 100 * this.gridstep,
				G1_y = this.originY - (fenceParm[0].y + 400) / 100 * this.gridstep, // 左上——>1
				G2_x = this.originX + (fenceParm[3].x + 580) / 100 * this.gridstep,
				G2_y = this.originY - (fenceParm[3].y + 400) / 100 * this.gridstep, // 右上——>2
				G3_x = this.originX + (fenceParm[2].x + 580) / 100 * this.gridstep,
				G3_y = this.originY - (fenceParm[2].y + 400) / 100 * this.gridstep, // 右下——>3
				G4_x = this.originX + (fenceParm[1].x + 580) / 100 * this.gridstep,
				G4_y = this.originY - (fenceParm[1].y + 400) / 100 * this.gridstep; // 左下——>4

			if (G1_x < A_x && G1_y < A_y && G2_x > A_x && G2_y < A_y && G3_x > A_x && G3_y > A_y && G4_x < A_x && G4_y > A_y) {
				$(".felect").hide();
				for (var a = 0; a < canvasdraw.addimglist.dataArr.length; a++) {
					if (canvasdraw.addimglist.dataArr[a][0] == A_tagno) {

						canvasdraw.addimglist.dataArr[a].src = "../../../public/image/P.png";
					}
				}
			} else {
				for (var a = 0; a < canvasdraw.addimglist.dataArr.length; a++) {
					if (canvasdraw.addimglist.dataArr[a][0] == A_tagno) {
						canvasdraw.addimglist.dataArr[a].src = "../../../public/image/P2.png";

					}
				}
				// for(var i = 0; i < canvasdraw.tagarrlists.length; i++) {
				// 	if(canvasdraw.tagarrlists[i].tagNo == A_tagno) {
				// 		var info = canvasdraw.tagarrlists[i];
				// 		var htmls = `
				// 					<div>
				// 						<div>
				// 							<div class="porple${info}  headImgCont">
				// 								<img class='headImg' src="${info.avatar}" />
				// 							</div>
				// 							<div class="porpleInfoCont">
				// 								<div>
				// 									<p>标签编号：${info.tagNo}</p>
				// 									<p>标签名称：${info.name}</p>
				// 								</div>
				// 							</div>
				// 						</div>
				// 					</div>
				// 				`
				// 		$(".felect").html(htmls);
				// 		$(".felect").css({
				// 			"border": "3px solid red"
				// 		})
				// 		$(".felect").show();
				// 	}
				// }

			}
		}
	},
	drawfences: function () {
		for (var t in this.devicesobj.fenceobj) {
			if (this.devicesobj.fenceobj[t].param)
				if (canvasdraw.newTaginfo != null) {
					var A_x = canvasdraw.newTaginfo.x,
						A_y = canvasdraw.newTaginfo.y,
						tagname = canvasdraw.newTaginfo.name,
						tagId = canvasdraw.newTaginfo.id;

				}
			for (var i = this.devicesobj.fenceobj[t].param, s = 0; s < 4; s++) {

				var e = 3;

				if (0 != s && (e = s - 1), i[e] && i[s]) {
					var h = this.originX + (i[e].x + 400 + 100 + 80) / 100 * this.gridstep,
						o = this.originY - (i[e].y + 400) / 100 * this.gridstep,
						a = this.originX + (i[s].x + 400 + 100 + 80) / 100 * this.gridstep,
						n = this.originY - (i[s].y + 400) / 100 * this.gridstep;

					0 == s && (this.context.fillStyle = "black", this.context.font = .25 * this.gridstep + "pt Calibri", this.context.fillText(this.devicesobj.fenceobj[t].name + "区域", a - .8 * this.gridstep, n + .6 * this.gridstep)),
						this.context.setLineDash([25, 25]);
					this.context.moveTo(h, o),
						this.context.lineTo(a, n),
						this.context.strokeStyle = "#f50",
						this.context.lineWidth = 5,
						this.context.stroke(),
						this.context.beginPath()
				}
			}
		}
	},

	drawments: function (even, nums, state) {

		this.state = state;
		if (nums == 1) { // 点击第一次确定基本点

			var canvasx = this.getCanvsCoordinate(this.obj, even);
			this.moveTox = canvasx.x;
			this.moveToy = canvasx.y;
			this.canvasArc(this.moveTox, this.moveToy);
			this.addhtml(this.moveTox, this.moveToy);
			this.divhtmls.innerHTML = "请点击终点"

		} else if (nums == 2) { // 点击第二次确定到达点

			var drawmentsX = even.offsetX,
				drawmentsY = even.offsetY;
			drawmentsX = drawmentsX;
			drawmentsY = drawmentsY;

			this.canvasStroke(drawmentsX, drawmentsY)
			this.canvasArc(drawmentsX, drawmentsY)
			this.addhtml(drawmentsX, drawmentsY)
		} else if (nums == 3) { // 鼠标移动位置点

			var drawmentsX = even.offsetX,
				drawmentsY = even.offsetY;
			drawmentsX = drawmentsX;
			drawmentsY = drawmentsY;
			///**/
			this.canvasStroke(drawmentsX, drawmentsY)
			this.canvasArc(drawmentsX, drawmentsY)
			this.addhtml(drawmentsX, drawmentsY)
			this.getpxcm(this.moveTox, this.moveToy, drawmentsX, drawmentsY)
		}
	},
	getCanvsCoordinate: function (canvas, even) {
		var rect = canvas.getBoundingClientRect();
		var leftB = parseInt(this.getStyles(canvas).borderLeftWidth); //获取的是样式，需要转换为数值
		var topB = parseInt(this.getStyles(canvas).borderTopWidth);
		cavasX = (even.clientX - rect.left) - leftB, canvasY = (even.clientY - rect.top) - topB;
		return {
			x: (even.clientX - rect.left) - leftB,
			y: (even.clientY - rect.top) - topB
		};
	},
	getStyles: function (obj) { //兼容FF，IE10; IE9及以下未测试
		return document.defaultView.getComputedStyle(obj);
	},
	getpxcm: function (x1, y1, x2, y2) {
		if (this.gridstep == 60) {
			this.slicenumMin = 1, this.slicenumMax = 1;
			var x1 = Number(x1),
				x2 = Number(x2),
				y1 = Number(y1),
				y2 = Number(y2);
			var cm = Math.sqrt(
				Number(Number(Math.pow(x1 - x2, 2)) + Number(Math.pow(y1 - y2, 2)))
			);
			var cm = (cm * this.pxcm).toFixed(2)
		} else if (this.gridstep < 60) {
			// console.log("当前为缩小状态" + 2)
			var cm = Math.sqrt(
				Number(Number(Math.pow(x1 - x2, 2)) + Number(Math.pow(y1 - y2, 2)))
			);
			// console.log(x1, x2, y1, y2, cm)
			// console.log(this.slicenumMin)

			var cm = (cm * this.pxcm * Math.pow(this.scalerate, this.slicenumMin)).toFixed(2)
		} else if (this.gridstep > 60) {
			// console.log("当前为放大状态" + 3)
			var cm = Math.sqrt(
				Number(Number(Math.pow(x1 - x2, 2)) + Number(Math.pow(y1 - y2, 2)))
			);
			var cm = (cm * this.pxcm / Math.pow(this.scalerate, this.slicenumMax)).toFixed(2)
		}

		this.divhtmls.innerHTML = "测量长度为" + cm + "米"
	},
	canvasStroke: function (drawmentsX, drawmentsY) {

		this.drawflow()
		this.canvasArc(this.moveTox, this.moveToy)
		this.context.setLineDash([30, 15]);
		this.context.strokeStyle = "#666";
		this.context.lineWidth = 2
		this.context.moveTo(this.moveTox, this.moveToy)
		this.context.lineTo(drawmentsX, drawmentsY);
		this.context.stroke();
	},
	canvasArc: function (arcX, xrcY) {
		this.context.beginPath();
		this.context.arc(arcX, xrcY, 5, 0, 360, false);
		this.context.lineWidth = 2;
		this.context.strokeStyle = "green";
		this.context.stroke(); //画空心圆
		this.context.closePath();

	},
	addhtml: function (htmlx, htmly) {
		//			var htmlx=htmlx+50,htmly=htmly-50
		if (document.getElementById("info") == null) {
			this.divhtmls = document.createElement("div")
			this.obj.parentNode.append(this.divhtmls);
			this.divhtmls.setAttribute("id", "info");
			this.divhtmls.setAttribute("style", "position:absolute;z-index:9;width: auto;height: auto;background: #B35E14;font-size: 15px;top:" + htmly + "px;left:" + htmlx + "px;padding: 11px 12px;  border-radius: 8px;color: #fff;");
			this.divhtmls.innerHTML = "请点击终点"
		} else {
			this.divhtmls.setAttribute("style", "position:absolute;z-index:9;width: auto;height: auto;background: #B35E14;font-size: 15px;top:" + htmly + "px;left:" + htmlx + "px;padding: 11px 12px;  border-radius: 8px;color: #fff;");
		}

	},
	canvassock: function (arr, nums) {

		var arrrlist = arr;
		this.context.moveTo(arrrlist[0][0], arrrlist[0][1]);
		this.context.lineTo(arrrlist[1][0], arrrlist[1][1]);
		this.context.strokeStyle = "#666"
		this.context.stroke();

	},
	drawplan: function () {
		try {
			this.planwidth = this.backgroundimg.width * this.gridstep * this.planscalex,
				this.planheight = this.backgroundimg.height * this.gridstep * this.planscaley,
				this.context.drawImage(
					this.backgroundimg,
					this.originX,
					this.originY - this.planheight,
					this.planwidth, this.planheight)
		} catch (t) {}
	},
	drawcamera: function () {},
	drawanchor: function () {
		for (var t in this.devicesobj.anchaorobj) {
			var i = this.originX + ((this.devicesobj.anchaorobj[t].x / 100 + 3.5) * this.gridstep),
				s = this.originY - ((this.devicesobj.anchaorobj[t].y / 100 - 1.5) * this.gridstep);
			this.context.drawImage(this.anchorimg, i - .5 * this.gridstep, s - .5 * this.gridstep, .9 * this.gridstep, .9 * this.gridstep),
				null == this.devicesobj.real3anchor || void 0 == this.devicesobj.real3anchor[t] ? this.context.fillStyle = "black" : this.context.fillStyle = "red",
				this.context.font = .25 * this.gridstep + "pt Calibri",
				this.context.fillText("基站 " + t, i - .8 * this.gridstep, s + .6 * this.gridstep)
		}
	},
	triangleArea: function (t, i, s) {
		var e = Math.sqrt((t.x - i.x) * (t.x - i.x) + (t.y - i.y) * (t.y - i.y)),
			h = Math.sqrt((t.x - s.x) * (t.x - s.x) + (t.y - s.y) * (t.y - s.y)),
			o = Math.sqrt((s.x - i.x) * (s.x - i.x) + (s.y - i.y) * (s.y - i.y)),
			a = (e + h + o) / 2;
		return Math.sqrt(a * (a - e) * (a - h) * (a - o))
	},
	inQuadrangle: function (t, i, s, e, h, o) {
		var a = this.triangleArea(t, i, s) + this.triangleArea(t, e, s),
			n = this.triangleArea(t, i, h) + this.triangleArea(i, s, h) + this.triangleArea(s, e, h) + this.triangleArea(e, t, h);
		return 1 == o ? !(a == n || a.toFixed(7) == n.toFixed(7)) : a == n || a.toFixed(7) == n.toFixed(7)
	},
	drawpath: function () {},
	newTaginfo: null,
	addimglist: {
		flistnum: false,
		dataArr: [], // 用来装标签数据的数组
		keyarr: [],
		keytag: null,
		keyadddata: function (key) {
			for (var i = 0; i < this.keyarr.length; i++) {
				if (key == this.keyarr[i]) {
					return this.keytag = this.keyarr[i]
				}
			}
			return false
		},
		//判断是否为第一次进入的数据， 
		init: function (data) {
			if (this.flistnum == false) {

				this.flistadddata(data)
			} else {
				this.nextadddata(data)
			}
		},
		flistadddata: function (data) { // 将第一次进入的数据存在数组
			var datas = data;
			datas.src = "../../../public/image/P.png"
			this.dataArr.push(datas);
			this.keyarr.push(data[0]);
			this.flistnum = true;
			// canvasdraw.pepoleHtml();
		},
		nextadddata: function (data) {
			//假如当前标签数据为第二次进来，将这次标签的数据与第一次进来的数据进行对比，如果相同则改变相同数组的值等于这次进来的数据，   后续进来数据同理
			var newdataname = data[0];
			var thistag = this.keyadddata(newdataname);
			if (thistag != false) {
				for (var i = 0; i < this.dataArr.length; i++) {
					if (this.dataArr[i][0] == thistag) {
						this.dataArr[i][1] = data[1];
						this.dataArr[i][2] = data[2];
						this.dataArr[i][3] = data[3];
						this.addimglists(this.dataArr)
						break
					}
				}
			} else {
				data.src = "../../../public/image/P.png"
				this.dataArr.push(data);
				this.keyarr.push(data[0]);
			}
		},
		tagmoveNum: -1,
		addimgnum: 0,
		addimglists: function (arrlist) {
			canvasdraw.drawflow()
			for (this.addimgnum = 0; this.addimgnum < arrlist.length; this.addimgnum++) {
				arrlist[this.addimgnum].name = new Image;
				arrlist[this.addimgnum].name.src = arrlist[this.addimgnum].src;
				var i = canvasdraw.originX + ((arrlist[this.addimgnum][1] / 100) * canvasdraw.gridstep),
					s = canvasdraw.originY - ((arrlist[this.addimgnum][2] / 100) * canvasdraw.gridstep);
				canvasdraw.context.globalCompositeOperation = "source-over";
				var nums = this.addimgnum;
				canvasdraw.context.drawImage(arrlist[nums].name, i - .5, s - .5, .9 * canvasdraw.gridstep, .9 * canvasdraw.gridstep);
			}

		}
	},
	peoplemove: function (Cx, Cy, obj) {
		const className = obj[0],
			width = $(".peopleinfo" + className).width();
		$(".peopleinfo" + className).css({
			left: Cx,
			top: Cy + 50
		})
	},
	pepoleHtml: function () {

		// $("#peopleCont").html()
		// for(var i = 0; i < this.addimglist.dataArr.length; i++) {
		// 	var obj = this.addimglist.dataArr[i];
		// 	var infoHtml = `
		// 			<div class="peopleinfo${obj[0]} peopleinfo">
		// 				<p>编号：${obj[0]}</p>
		// 			</div>
		// 	`
		// 	$("#peopleCont").append(infoHtml)
		// }
	},

	hostcoord: [],
	linCoord: {
		coordObj: {
			newCoord: null,
			hostcoord: null,
		},
		init: function (coord) {
			this.coordObj.hostcoord = coord.coordinate
			coordArr.push(coord)
		},
		coordArr: [],
		coordKey: function (coord) {
			for (var a = 0; a < coordArr.length; a++) {
				if (coordArr[a].name == coord.name) {
					this.newCoord = coord.coordinate
				} else {
					coordArr.push(coord)
				}
			}
		}
	},
	tagarrlists: null,
	taginfoGet: function (urls) { // 获取所有标签
		var urls = "/api/tag/getall"
		$.ajax({
			type: "get",
			url: urls,
			async: true,
			data: {
				currentPage: 1,
				pageSize: 100,
			},
			success: function (red) {
				canvasdraw.tagarrlists = red.pagedData.datas
			}
		});
	},
	zonelist: null,
	zoneGet: function () {
		$.ajax({
			type: "get",
			url: "/api/zone/getall",
			async: true,
			data: {
				'currentPage': 10,
				"pageSize": 100
			},
			success: function (data) {
				canvasdraw.zonelist = data.pagedData.datas;

				console.log(canvasdraw.zonelist)
			}
		});
	},
	ifErrotag: function (arrobj) {

		var errotagData = arrobj.gjdate;
		var errmsg
		var errinfotext

	},
	arrlits: [],
	addtagDemo: function (arrlist) {
		var htmlcont = document.getElementById("motele");

		canvasdraw.arrlits = []
		for (var a = 0; a < arrlist.length; a++) {
			var errinfo = canvasdraw.ifErrotag(arrlist[a]);

			var tagname = arrlist[a].id;
			var v_val = arrlist[a].v_val;
			var x = arrlist[a].x - 50;
			var y = arrlist[a].y - 60;
			var gjdate = arrlist[a].gjdate;
			canvasdraw.arrlits.push([arrlist[a].x, arrlist[a].y, tagname, v_val, gjdate, errinfo])
			//			// console.log(canvasdraw.arrlits)
		}
	},
	TagDom: [],
	domObjArr: [],
	changeTagdom: function () {

	},
	isshow: null,
	moveover: function (arrlistxy, event) {

	},
	lista: 0,
	drawpoint: function (objlist) {

	},
	draline: function (coord, line) {

	},
	serachChange: function () {
		var values = $("#serachInput").val();
		var type = false;
		if (values != "") {
			if (canvasdraw.addimglist.dataArr.length == 0) {
				alert("没有标签在线 请检查");
				return false
			} else {
				for (var a = 0; a < canvasdraw.addimglist.dataArr.length; a++) {
					if (values == canvasdraw.addimglist.dataArr[a][0]) {
						canvasdraw.getinfo(canvasdraw.addimglist.dataArr, a);
						break;
						type = true;
					}
				}
			}
		} else {
			console.log(" 1")
		}
		//				if(type==false){
		//							alert("标签未上线或不存在")
		//						}
	},
	getinfo: function (obj, key) {
		if (obj) {
			canvasdraw.addimglist.dataArr[key].src = "../../../public/image/P2.png";
			console.log(canvasdraw.tagarrlists)
			for (var a = 0; a < canvasdraw.tagarrlists.length; a++) {

				if (canvasdraw.addimglist.dataArr[key][0] == canvasdraw.tagarrlists[a].tagNo) {
					var infos = canvasdraw.tagarrlists[a];
					var info = {
						tagno: infos.tagNo,
						name: infos.name,
						imgurl: infos.avatar
					}
					canvasdraw.porpleShow(info)
				}
			}

		}
	},
	porpleShow: function (info, coord) {
		var info = info;
		if (info) {
			$(".porpleinfoCont").show()
			var htmls = `
				<div>
					<div>
						<div class="porple${info.tagno} porpleundefined">
							<img  class='headImg' src="${info.imgurl}"/>
						</div>
						<div>
							<div class="P_info">
								<p>标签编号：${info.tagno}</p>
								<p>标签名称：${info.name}</p>
							</div>
						</div>
					</div>
				</div>
			`
			$(".porpleinfoCont").html(htmls)
		}
	}
};
canvasdraw.drawpoint()