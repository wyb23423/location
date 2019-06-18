layui.use('layer', function () { //独立版的layer无需执行这一句
	var $ = layui.jquery,
		layer = layui.layer; //独立版的layer无需执行这一句

	//触发事件
	var active = {
		offset: function (othis) {
			var type = othis.data('type'),
				text = othis.text();
			console.log(type)

			layer.open({
				type: 1,
				title: "数据信息!!",
				offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
				,
				Boolean: true,
				id: 'layerDemo' + type //防止重复弹出
				,
				area: ['459px', '400'],
				content: `
				<div style="padding: 23px 29px;    width: 459px;">
					<div class="listjglist" style="">
						<div id="" style="">
							<p style="color: #DD0000;font-weight: 600;"> 标签编号：9999</p>
							<p>所在坐标：<span style="font-weight: ;">997-998               </span></p>
							<p>所在区域：<span style=";font-weight: ;">办公室 </span></p>
							<p>报警信息：<span style=";font-weight: ;">标签损坏             </span></p>
							<p>&nbsp;<span style=";font-weight: ;    font-size: 10px;    color: red;">注意: 报警信息为特定信息,请及时处理,请及时处理,请及时处理             </span></p>
							<div class="text-center " style="    position: absolute;  top: 36px;   right: 19px;   opacity: .8;">
								<i class="layui-icon  layui-icon-tips"  style="font-size: 82px;color: #f50404; font-weight: 600;"></i>
							</div>
						</div>
					</div>	
				</div>`,
				btn: '关闭全部框',
				btnAlign: 'r' //按钮居中
				,
				shade: 0 //不显示遮罩
				,
				yes: function () {
					layer.closeAll()
				}
			});
		},
		baojin: function (othis) {
			var type = othis.data('type'),
				text = othis.text();


			layer.open({
				type: 1,
				title: "注意报警弹出信息!!",
				offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
				,
				resize: true,
				moveOut: true,
				anim: 5,
				Boolean: true,
				id: 'layerDemo' + type //防止重复弹出
				,
				area: ['1200px', '750px'],
				content: `
						<table class="layui-table">
						  <colgroup>
						    <col width="10">
						    <col width="100">
						    <col>
						  </colgroup>
						  <thead>
						    <tr>
						      <th>ID</th>
						      <th>报警标签</th>
						      <th>报警时间</th>
						      <th>报警坐标</th>
						      <th>报警区域</th>
						      <th>报警信息</th>
						      <th>操作</th>
						    </tr> 
						  </thead>
						  <tbody id="tabid">
						  </tbody>
					</table>
					`,
				success: function (layero, index) {

					for (var a = 0; a < jsonmsglist.length; a++) {

						var id = a,
							tagaddr = jsonmsglist[a].bjdate.tagaddr,
							x = jsonmsglist[a].bjdate.x,
							y = jsonmsglist[a].bjdate.y
						bjinfo = jsonmsglist[a].gjinfo,
							bjday = jsonmsglist[a].time, chuli = jsonmsglist[a].chuli,
							quyu = "办公室";

						if (chuli == false) {
							var caozuo = "caozuo"
							var caozuotext = "确认处理"
							var btncolo = ""
						} else if (chuli == true) {
							var caozuo = "ycaozuo"
							var caozuotext = "已处理"
							var btncolo = "layui-btn-warm"
						}
						var htmls = `
								<tr>
							      <td class="theid">${id}</td>
							      <td>${tagaddr}</td>
							      <td>${bjday}</td>
							      <td>x:${x},y:${y}</td>
							      <td>${quyu}</td>
							      <td>${bjinfo}</td>
							      <td>
							      	<a class="layui-btn  ${caozuo} ${btncolo} layui-btn-xs" lay-event="del">${caozuotext}</a>
							      	<a class="layui-btn layui-btn-danger delete layui-btn-xs" lay-event="del">删除</a>
							      </td>
							    </tr>
							`
						$("#tabid").append(htmls)
					}
				},
				btn: '关闭全部框',
				btnAlign: 'r' //按钮居中
				,
				shade: 0 //不显示遮罩
				,
				yes: function () {
					layer.closeAll()
				}
			});
		},
		people: function (othis) {
			var type = othis.data('type');
			var people = tagarrlists.filter(function (v) {
				return !!ids[v.tagNo];
			});

			layer.open({
				type: 1,
				title: `人员信息(共${people.length}人)`,
				offset: type, //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
				resize: true,
				moveOut: true,
				anim: 5,
				Boolean: true,
				id: 'layerDemo' + type, //防止重复弹出
				area: ['1200px', '750px'],
				content: `
					<table class="layui-table">
						<colgroup>
							<col width="20">
							<col width="100">
							<col>
						</colgroup>
						<thead>
							<tr>
								<th>ID</th>
								<th>人员名称</th>
								<th>编号</th>
								<th>区域</th>
								<th>部门</th>
								<th>职位</th>
							</tr> 
						</thead>
						<tbody id="tabid">
						</tbody>
					</table>
					`,
				success: function () {
					fetch('/api/zone/getall?currentPage=10&pageSize=100')
						.then(res => res.json())
						.then(res => {
							var zoneList = res.pagedData.datas;
							var table = $("#tabid");

							for (var a = 0; a < people.length; a++) {
								var person = people[a];
								var zone = zoneList.find(v => v.id == person.zone);

								table.append(`
									<tr>
										<td class="theid">${person.id}</td>
										<td>${person.name}</td>
										<td>${person.tagNo}</td>
										<td>${zone ? zone.name : '未知区域'}</td>
										<td>${person.department}</td>
										<td>${person.job}</td>
									</tr>
								`)
							}
						})
						.catch(console.log);
				},
				btn: '关闭全部框',
				btnAlign: 'r', //按钮居中
				shade: 0, //不显示遮罩
				yes: function () {
					layer.closeAll()
				}
			});
		}
	};
	$("body").on("click", ".delete", function (even) {

		var theid = $(this).parent().prevAll(".theid").html();
		$(this).parent().parent().remove();

		jsonmsglist.shift(theid)

	})
	$("body").on("click", ".caozuo", function () {
		var theid = $(this).parent().prevAll(".theid").html();
		$(this).html("已处理");
		$(this).removeClass("caozuo ")
		$(this).addClass(" layui-btn-warm ")
		jsonmsglist[theid].chuli = true
	})

	$('.measurement').on('click', "button", function () {
		var othis = $(this),
			method = othis.data('method');

		var htmlname = $(this).data("name")
		active[method] ? active[method].call(this, othis, htmlname) : '';
	});

});