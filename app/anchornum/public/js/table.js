/**
 * 人员列表
 */
$(function () {
    var zonelist = null;
    var adminId = false;

    var result = location.search.match(/type=(\d+)/);
    var tagType = result ? +result[1] : 1;

    var tags = document.getElementsByClassName('tag');
    tags[tagType - 1].classList.add('layui-this');

    $.ajax({
        type: "get",
        url: "/api/zone/getall",
        async: true,
        data: {
            'currentPage': 10,
            "pageSize": 100
        },
        success: function (data) {
            zonelist = data.pagedData.datas;
            for (var a = 0; a < zonelist.length; a++) {
                var htmls = `<option value="${zonelist[a].id}">${zonelist[a].name}</option>`
                $("#zone").append(htmls);
            }
            render();

            layui.use('form', function () {
                var form = layui.form;

                form.render('select'); //刷新select选择框渲染
                //各种基于事件的操作，下面会有进一步介绍
            });
        }
    });
    var datas = [];

    function zoneName(id) {
        for (var a = 0; a < zonelist.length; a++) {
            if (zonelist[a].id == id) {
                return zonelist[a].name
            }
        }
    }

    function render() {
        layui.use('table', function () {
            var table = layui.table;
            table.render({
                elem: '#test',
                url: '/api/tag/getall',
                toolbar: '#toolbarDemo',
                where: {
                    type: tagType
                },
                request: {
                    pageName: 'currentPage', //页码的参数名称，默认：page
                    limitName: 'pageSize' //每页数据量的参数名，默认：limit
                },
                limit: 20,
                parseData: function (res) { //res 即为原始返回的数据
                    var rows = res.pagedData.datas;

                    datas.length = 0;
                    for (var a = 0; a < rows.length; a++) {
                        var names = zoneName(rows[a].zone);
                        rows[a].zone = names;
                        datas.push(rows[a]);
                    }

                    return {
                        "code": res.success === true ? 0 : res.success, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.pagedData.totalCount, //解析数据长度
                        "data": datas //解析数据列表
                    };
                },
                done: function (res, curr, count) {
                    if (adminId == true) {
                        $(".deleteBtn").hide();
                        $(".configBtn").hide();
                        $("#caozuo[data-field='caozuo']").find("div").html("没权限操作");
                    }
                },
                title: '用户数据表',
                totalRow: true,
                cols: [
                    [{
                            field: 'id',
                            title: '基站ID',
                            width: "7%",
                            templet: '#usernameid'
                        }, {
                            field: 'name',
                            title: '人员名称',
                            width: "16%",
                            templet: '#name',
                        },
                        {
                            field: 'tagNo',
                            title: '编号',
                            width: "13%",
                            templet: '#tagNo'
                        }, {
                            field: 'department',
                            title: '部门',
                            width: "13%",
                            templet: '#department'
                        },
                        {
                            field: 'job',
                            title: '职位',
                            width: "10%",
                            templet: '#job'

                        },
                        {
                            field: 'level',
                            title: '等级',
                            width: "8%",
                            templet: '#level'

                        },
                        {
                            field: 'zone',
                            title: '区域',
                            width: "16%",
                            templet: '#zones',

                        }, {
                            field: "caozuo",
                            fixed: 'right',
                            title: '操作',
                            width: "16%",
                            templet: '#demo'
                        }
                    ]
                ],
                id: 'testReload',
                page: true
            });
            layui.use(['form', 'layedit', 'laydate'], function () {
                layui.form.on('submit(demo1)', function (data) {
                    var timestamp = new Date().getTime();
                    var formeInfo = data.field;
                    var create_use = $("#adminName .Idname").text();
                    var data = {
                        "id": tagid,
                        "coordy": formeInfo.coordy, //    人员名称
                        "coordx": formeInfo.coordx, //    区域
                        "zone": formeInfo.zone, //    等级
                        "update_user": create_use, //    修改人
                        "update_time": timestamp, //    修改日期
                        "type": tagType
                    };
                    var urls = "/api/base/updateBase"
                    var data = JSON.stringify(data);
                    postAjax(urls, data);

                    return false;
                });
            });
            var $ = layui.$,
                active = {
                    reload: function () {
                        var demoReload = $('#demoReload');
                        //执行重载
                        table.reload('testReload', {
                            page: {
                                curr: 1 //重新从第 1 页开始
                            },
                            where: {
                                key: {
                                    id: demoReload.val()
                                }
                            }
                        });
                    }
                };
            $('.demoTable .layui-btn').on('click', function () {
                var type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });

            function postAjax(urls, data) {
                $.ajax({
                    type: "post",
                    url: urls,
                    async: true,
                    data: data,
                    contentType: "application/json;charset=UTF-8",
                    success: function (red) {
                        var cobackInfo = red.success;
                        if (cobackInfo == true) {
                            var ii = layer.load();
                            //此处用setTimeout演示ajax的回调
                            setTimeout(function () {
                                layer.close(ii);
                                layer.msg('人员标签添加成功');
                                $(window).scrollTop(0);
                            }, 1000);
                            setTimeout(function () {
                                location.reload();
                            }, 2000)
                        }
                    },
                    error: function () {
                        console.log("err")
                        var ii = layer.load();
                        //此处用setTimeout演示ajax的回调
                        setTimeout(function () {
                            layer.close(ii);
                            layer.msg('人员标签添加失败，请重新填写');
                            location.reload();
                        }, 1000);
                        setTimeout(function () {
                            location.reload();
                        }, 1000)
                    }
                });
            }

            table.on('tool(test)', function (obj) {
                var data = obj.data;
                if (obj.event === 'del') {
                    layer.confirm('真的删除该基站吗？ID为' + data.id + "的基站", function (index) {
                        DeleteBook(data.id);
                        layer.close(index);
                    });
                } else if (obj.event === 'edit') {
                    EditBook(data.id)
                } else if (obj.event === 'info') {
                    Goinfo(data.id);
                }
            });
            //工具栏事件
            table.on('toolbar(test)', function (obj) {
                var checkStatus = table.checkStatus(obj.config.id);
                switch (obj.event) {
                    case 'getCheckData':
                        var data = checkStatus.data;
                        layer.alert(JSON.stringify(data));
                        break;
                    case 'getCheckLength':
                        var data = checkStatus.data;
                        layer.msg('选中了：' + data.length + ' 个');
                        break;
                    case 'isAll':
                        layer.msg(checkStatus.isAll ? '全选' : '未全选')
                        break;
                };
            });
        });
    }

    function EditBook(id) {
        alert("是否编辑设备：ID" + id);
        console.log(this)
        $("#exampleModal").modal("toggle")
        tagid = id

    }
    //删除操作
    function DeleteBook(id) {
        $.ajax({
            url: "/api/tag/deleteTag?id=" + id,
            type: "post",
            contentType: "application/json",
            data: {
                id: id
            },
            success: function (red) {
                console.log(red)
                if (red.success == true) {
                    alert(red.message)
                    //								location.reload();
                } else {
                    alert("服务繁忙，请重试")
                }
            }
        })

    }
})