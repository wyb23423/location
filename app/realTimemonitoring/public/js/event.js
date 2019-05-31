/**
 * canvasMap页面的交互事件
 */

function addEvent(obj, xEvent, fn) {
    if (obj.attachEvent) {
        obj.attachEvent('on' + xEvent, fn);
    } else {
        obj.addEventListener(xEvent, fn, false);
    }
}

function removeEvent(obj, xEvent, fn) {
    if (obj.attachEvent) {
        obj.detachEvent('on' + xEvent, fn);
    } else {
        obj.removeEventListener(xEvent, fn, false);
    }
}

function onMouseWheel(ev) {
    ev = ev || window.event;
    ev.returnValue = false;
    if (ev.preventDefault) {
        ev.preventDefault();
    }

    if (!map) return;

    var scale = map.style.scale[0];
    var down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
    if (down) {
        scale *= 9 / 10;
        map.attr('scale', map.style.scale[0] * 9 / 10);
    } else {
        scale *= 11 / 10
    }

    scale = Math.max(0.3, Math.min(3, scale));
    map.attr('scale', scale);
}

var downX = 0,
    downY = 0;

function getPosition(e) {
    var clientX = e.clientX,
        clientY = e.clientY;
    if (e.touches) {
        if (!e.touches.length) {
            return {
                x: 0,
                y: 0
            };
        }
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: clientX,
        y: clientY
    };
}

function downHandler(e, type) {
    var pos = getPosition(e);
    downX = pos.x;
    downY = pos.y;
    addEvent(document, type, moveHandler);
}

function moveHandler(ev) {
    if (!map) {
        return;
    }

    ev = ev || window.event;

    var pos = getPosition(ev);
    var left = map.style.left + pos.x - downX;
    var top = map.style.top + pos.y - downY;

    map.attr({
        left: left,
        top: top
    });

    downX = pos.x;
    downY = pos.y;
}

function upHandler(type) {
    removeEvent(document, type, moveHandler);
}

addEvent(window, 'load', function () {
    var root = init();
    // ======================================滚动缩放
    addEvent(root, 'mousewheel', onMouseWheel);
    addEvent(root, 'DOMMouseScroll', onMouseWheel);

    // =======================================拖动地图
    addEvent(root, 'mousedown', function (ev) {
        downHandler(ev, 'mousemove');
    });
    addEvent(root, 'mouseup', function () {
        upHandler('mousemove');
    });
    addEvent(root, 'touchstart', function (ev) {
        downHandler(ev, 'touchmove');
    });
    addEvent(root, 'touchend', function () {
        upHandler('touchmove');
    });

    // ===========================================搜索标签
    var search = null; // 搜索的标签编号
    addEvent(document.getElementById('serach'), 'click', function () {
        if (!map) {
            return;
        }

        var input = document.getElementById('serachInput')
        var id = input.value;
        if (search !== id) {
            if (search) {
                getTag(search).tag.attr('scale', 1);
            }

            var tagObj = getTag(id, false);
            if (tagObj) {
                tagObj.tag.attr('scale', 2);
                search = id;
            } else {
                search = null;
                layui.layer.alert('未搜索到对应信息!');
            }
        }

        input.value = '';
    });
});