var htmls = `
    <nav class="haderNav">
        <div id="maxnav" class="clearfix maxnav">
            <div class="layui-col-xs1">
                <div class="logocont">
                    <ul class="layui-nav">
                        <li class="layui-nav-item">
                            <a href="" style="text-align: center;">
                                <!--<img src="../../../public/image/log.jpg"/>-->
                                LOGO
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <ul class="layui-nav layui-col-xs8" id="navlist">
                <li class="layui-nav-item">
                    <a data-href="../../index/view/index.html" href="javascript:;">首页</a>
                </li>
                <li class="layui-nav-item ">
                    <a data-href="../../admin/view/admin.html" href="javascript:;">管理员设置</a>
                </li>
                <li class="layui-nav-item  ">
                    <a data-href="../../system/area/area.html" href="javascript:;">系统设置</a>
                </li>
                <!--<li class="layui-nav-item ">
                    <a data-href="../../DataObj/vlew/index.html" href="javascript:;">数据展示</a>
                </li>-->
                <!--<li class="layui-nav-item ">
                        <a data-href="../../equipment/view/equipment.html" href="javascript:;">监控展示</a>
                    </li>-->
                <li class="layui-nav-item ">
                    <a data-href="../../equipment/view/equipment.html" href="javascript:;">设备管理</a>
                </li>
                <li class="layui-nav-item  ">
                    <a data-href="../../anchornum/view/anchornum.html" href="javascript:;">人员管理</a>
                </li>
                <li class="layui-nav-item">
                    <a data-href="../../realTimemonitoring/view/realTimemonitoring.html" href="javascript:;">实时监控</a>
                </li>
                <!--<li class="layui-nav-item ">
                    <a data-href="../../fence/vlew/fence.html" href="javascript:;">电子围栏</a>
                </li>-->
                <li class="layui-nav-item">
                    <a data-href="../../ALARM/view/Alarm.html" href="javascript:;">报警信息</a>
                </li>
            </ul>
            <div class="layui-col-xs3">
                <ul class="layui-nav">
                    <li class="layui-nav-item">
                        <a href="">控制台<span class="layui-badge">9</span></a>
                    </li>
                    <li class="layui-nav-item">
                        <a href="">个人中心<span class="layui-badge-dot"></span></a>
                    </li>
                    <li class="layui-nav-item" lay-unselect="">
                        <a href="javascript:;"><img src="../../../public/layui/images/face/71.gif" id="myheaderimg" class="layui-nav-img">我</a>
                        <dl class="layui-nav-child">
                            <dd>
                                <a href="javascript:;">修改信息</a>
                            </dd>
                            <dd>
                                <a href="javascript:;">安全管理</a>
                            </dd>
                            <dd>
                                <a href="javascript:;">退了</a>
                            </dd>
                        </dl>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
`;
$("#header").html(htmls);

$(window).ready(function () {
    initHead();

    var index = sessionStorage.getItem('navIndex') || 0;
    var nav = $('#navlist');
    var list = Array.from(nav.children());
    list[index].classList.add('layui-this');

    nav.click(function (e) {
        var target = e.target;
        var url;
        if (target.tagName === 'A') {
            url = target.getAttribute('data-href');
            target = target.parentNode;
        } else if (target.tagName === 'LI') {
            url = target.children[0].getAttribute('data-href');
        }

        if (url) {
            sessionStorage.setItem('navIndex', list.indexOf(target));
            location.href = url;
        }
    })
})

function initHead() {
    document.head.innerHTML += `
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <link rel="stylesheet" type="text/css" href="../../../public/css/media.css"/>
    `;

    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", "../../../public/js/all.js");
    document.body.appendChild(script);
}