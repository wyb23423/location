(function(a) {
    var l = {
        url: "",
        isImg: true,
        targetExt: ".png",
        tempFile: "/content/tempfile/",
        error: function(p) {
            alert(p)
        }
    };
    var o = {
        single: "single",
        dialog: "dialog",
        imgdouble: "imgdouble",
        fixedone: "fixedone"
    };
    window.UPLOADTYPE = o;
    var n = function(r, s) {
        var p = this;
        var q = {
            url: l.url,
            text: "选择文件",
            type: "single",
            handleType: "0",
            uploadType: 1,
            subfolder: "",
            more: false,
            debug: true,
            maxWidth: 1960,
            maxHeight: 1000,
            minWidth: 300,
            minHeight: 300,
            background: "white",
            tempFile: l.tempFile,
            auto: true,
            isImg: true,
            fileExts: "jpg;png;gif;bmp;jpeg",
            timeout: 30000,
            onStart: function() {},
            onSuccess: function(t) {},
            onError: function(t) {
                l.error(t)
            },
            onClick: function() {},
            maxSize: 1024 * 1024 * 1024,
            getMaxSize: function() {
                return e(this.maxSize)
            },
            coverParams: {}
        };
        this.elem = r;
        this.opts = a.extend({}, q, s);
        if (this.opts.url.indexOf("ws://") != -1) {
            this.opts.uploadType = 2
        }
    };
    n.prototype = {
        init: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            if (q.type == "dialog") {
                r.initDialog()
            } else {
                r.initBtn()
            }
        },
        initBtn: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var u = d("uploader_text");
            u.text(q.text);
            p.append(u);
            var s = d("uploader_file");
            var t = a('<input  type="file" name="file"  tabindex="10000"/>');
            if (q.more) {
                t.prop("multiple", "multiple")
            }
            s.append(t);
            s.append('<input type="hidden" name="target" class="target" />');
            p.append(s);
            if (p.next().hasClass("uploader_panel") == false) {
                p.after(d("uploader_panel"))
            }
            if (q.type == o.imgdouble || q.type == o.fixedone) {
                r.initImgDouble()
            } else {
                r.bindBtn()
            }
        },
        bindBtn: function() {
            var r = this;
            var p = this.elem;
            var q = this.opts;
            var s = p.find("input[type=file]")[0];
            s.onchange = function() {
                if (this.files.length <= 0) {
                    q.onError("没有获取到上传文件");
                    return
                }
                var u = this.files;
                if (q.more) {
                    var y = [];
                    for (var v = 0; v < u.length; v++) {
                        var t = u[v];
                        var x = new j(t,r,false);
                        y.push(x)
                    }
                    var v = 0;
                    var w = 0;
                    z();
                    var A = setInterval(function() {
                        if (w - v > 2) {
                            return
                        }
                        z()
                    }, 1000);
                    function z() {
                        var B = y[v];
                        B.start();
                        B.onSendSuccess = function() {
                            w++
                        }
                        ;
                        v++;
                        if (v >= u.length) {
                            clearInterval(A)
                        }
                    }
                } else {
                    var t = this.files[0];
                    var x = new j(t,r,r.opts.auto)
                }
            }
        },
        initDialog: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            p.text(q.text);
            p.click(function() {
                r.cover = new c(r)
            })
        },
        initImgDouble: function() {
            var r = this;
            var p = this.elem;
            var q = this.opts;
            p.append('<canvas id="canvasImg" style="display:none;"/>');
            var s = p.find("input[type=file]");
            s.change(function() {
                var u = this.files;
                if (q.more) {
                    var w = -1;
                    var v = 0;
                    var x = setInterval(function() {
                        if (v > w) {
                            var y = u[v];
                            if (b(y.name, q)) {
                                r.bindImgDouble(y, function() {
                                    v++
                                })
                            }
                        }
                        if (v == u.length - 1) {
                            clearInterval(x)
                        }
                        w = v
                    }, 100)
                } else {
                    var t = u[0];
                    if (b(t.name, q) == false) {
                        return false
                    }
                    r.bindImgDouble(t)
                }
            })
        },
        bindImgDouble: function(s, t) {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var u = new FileReader();
            u.onload = function() {
                var v = u.result;
                new g(r,v,function(w) {
                    if (q.onSuccess) {
                        q.onSuccess(w)
                    }
                }
                )
            }
            ;
            u.readAsDataURL(s)
        }
    };
    function g(t, q, s) {
        this.uploader = t;
        this.onSuccess = s;
        this.opts = t.opts;
        this.canvas = document.getElementById("canvasImg");
        this.ctx = this.canvas.getContext("2d");
        var p = this;
        var r = new Image();
        r.onload = function() {
            p.onload()
        }
        ;
        r.src = q;
        this.img = r
    }
    g.prototype = {
        onload: function() {
            var q = this;
            var p = this.opts;
            if (p.type == o.imgdouble) {
                q.doubleHandle()
            } else {
                if (p.type == o.fixedone) {
                    q.fixedHandle()
                }
            }
        },
        fixedHandle: function() {
            var q = this;
            var p = this.opts;
            var r = this.canvas;
            var s = this.ctx;
            var v = this.img;
            r.width = p.maxWidth;
            r.height = p.maxHeight;
            s.fillStyle = p.background;
            s.rect(0, 0, r.width, r.height);
            s.fill();
            var w = v.width;
            var u = v.height;
            if (w > p.maxWidth) {
                u = u * (p.maxWidth / w);
                w = p.maxWidth
            }
            if (u > p.maxHeight) {
                w = w * (p.maxHeight / u);
                u = p.maxHeight
            }
            v.width = w;
            v.height = u;
            var x = (r.width - w) / 2;
            var y = (r.height - u) / 2;
            s.drawImage(v, x, y, w, u);
            var t = r.toDataURL("image/jpeg");
            p.targetExt = ".jpg";
            q.sendData(t, function(z) {
                if (q.onSuccess) {
                    q.onSuccess(z)
                }
            })
        },
        doubleHandle: function() {
            var q = this;
            var v = this.img;
            var r = this.canvas;
            var s = this.ctx;
            var p = this.opts;
            var w = v.width;
            var u = v.height;
            if (w > p.maxWidth) {
                u = u * (p.maxWidth / w);
                w = p.maxWidth
            }
            if (u > p.maxHeight) {
                w = w * (p.maxHeight / u);
                u = p.maxHeight
            }
            var t = q.getDataURL(w, u);
            p.targetExt = ".jpg";
            if (p.handleType != 0) {
                p.subfolder2 = "/big"
            }
            q.sendData(t, function(x) {
                var y = {};
                y.big = x;
                if (w > p.minWidth) {
                    u = u * (p.minWidth / w);
                    w = p.minWidth
                }
                if (u > p.minHeight) {
                    w = w * (p.minHeight / u);
                    u = p.minHeight
                }
                t = q.getDataURL(w, u);
                if (p.handleType != 0) {
                    p.subfolder2 = "/small"
                }
                q.sendData(t, function(z) {
                    y.small = z;
                    if (q.onSuccess) {
                        q.onSuccess(y)
                    }
                })
            })
        },
        getDataURL: function(t, r) {
            var s = this.img;
            var p = this.canvas;
            s.width = p.width = t;
            s.height = p.height = r;
            this.ctx.clearRect(0, 0, t, r);
            this.ctx.drawImage(s, 0, 0, t, r);
            var q = p.toDataURL("image/jpeg");
            return q
        },
        sendData: function(q, r) {
            var p = this;
            var s = new m(p,{
                data: q
            });
            s.onSuccess = function(t) {
                if (r) {
                    r(t)
                }
            }
        }
    };
    function j(r, s, q) {
        var p = this;
        this.uploader = s;
        this.uploadType = s.opts.uploadType;
        this.file = r;
        this.step = 1024 * 256;
        this.loaded = 0;
        this.readed = 0;
        this.enableRead = q || false;
        this.startTime = new Date();
        this.total = r.size;
        this.debug = s.opts.debug;
        this.sending = false;
        if (this.check()) {
            this.init();
            if (this.uploadType == 1) {
                this.step = 1024 * 1024
            }
            if (p.enableRead) {
                p.start()
            }
        }
    }
    j.prototype = {
        check: function() {
            var q = this;
            var p = this.uploader.opts;
            if (this.total > p.maxSize) {
                p.onError("文件大小不能超过：" + p.getMaxSize());
                return false
            }
            return b(q.file.name, p);
            return true
        },
        init: function() {
            var p = this;
            var r = this.uploader.elem.next();
            var q = d("uploader_item");
            this.elem = q;
            q.append('<div class="title"><span class="file-icon"></span> <span class="file-name">' + this.file.name + "</span></div>");
            q.append('<div class="uploader-progress"><progress></progress></div>');
            var t = d("status");
            t.append('<div class="left"><span class="btn-proc">暂停</span></div>');
            var s = d("right");
            s.append('<span id="loaded">0</span>/<span class="total">' + e(this.total) + "</span>");
            s.append("&emsp;");
            s.append('<span class="time-proc">0</span>');
            t.append(s);
            t.append('<div class="clear"></div>');
            q.append(t);
            q.append('<span class="close">&times;</span>');
            r.append(q);
            p.showStatus();
            q.find(".btn-proc").click(function() {
                var u = a(this);
                if (u.text() == "暂停") {
                    u.text("开始");
                    p.stop()
                } else {
                    u.text("暂停");
                    p.containue()
                }
            });
            q.find(".close").click(function() {
                if (window.confirm("关闭将会放弃上传！")) {
                    p.close();
                    q.slideUp("normal", function() {
                        q.remove()
                    })
                }
            })
        },
        start: function() {
            var p = this;
            p.enableRead = true;
            if (p.uploadType == 1) {
                p.startAjax()
            } else {
                p.startScoket()
            }
        },
        startAjax: function() {
            var p = this;
            var q = this.reader = new FileReader();
            q.onload = function(t) {
                p.readed += t.loaded;
                var s = new Blob([q.result]);
                if (p.sending == false) {
                    r(null, null, function(u) {
                        r(s, u)
                    });
                    p.sending = true
                } else {
                    r(s, p.result)
                }
            }
            ;
            p.readBlob();
            function r(u, t, v) {
                var s = new i(p.uploader);
                if (t) {
                    s.send(u, p.result)
                } else {
                    s.sendInfo(p.getFileInfo())
                }
                s.onmessage = function(w) {
                    p.result = w;
                    if (v) {
                        v(w)
                    } else {
                        p.loaded += w.curLength;
                        p.showStatus();
                        if (p.readed >= p.total) {
                            p.sendSuccess()
                        } else {
                            p.readBlob()
                        }
                    }
                }
            }
        },
        startScoket: function() {
            var p = this;
            var q = this.reader = new FileReader();
            var r = new k(p.uploader,this);
            this.socket = r;
            r.onopen = function() {
                q.onload = function(s) {
                    p.readed += s.loaded;
                    p.readedScocket()
                }
                ;
                p.readBlob()
            }
            ;
            r.onmessage = function(s) {
                var t = JSON.parse(s);
                p.result = t;
                if (t.newName.length > 0 && t.status == 1) {
                    p.newName = t.newName || "";
                    p.loaded += t.curLength || 0;
                    p.showStatus();
                    if (p.loaded >= p.total) {
                        p.sendSuccess();
                        if (p.debug) {
                            console.log("总上传：" + p.loaded + ",用时：" + (new Date().getTime() - p.startTime.getTime()) / 1000)
                        }
                    }
                } else {
                    console.error("上传出错：");
                    console.error(t)
                }
            }
        },
        readedScocket: function() {
            var q = this;
            var r = this.reader;
            var p = this.socket;
            s();
            if (q.readed < q.total) {
                if (p.ws.bufferedAmount > 1204 * 1024 * 2) {
                    var t = setInterval(function() {
                        if (p.ws.bufferedAmount <= 1204 * 1024) {
                            clearInterval(t);
                            q.readBlob()
                        }
                    }, 10)
                } else {
                    q.readBlob()
                }
            } else {
                if (q.debug) {
                    console.log("总读取：" + q.readed + ",用时：" + (new Date().getTime() - q.startTime.getTime()) / 1000)
                }
            }
            function s() {
                var u = r.result;
                if (q.sending == false) {
                    p.send(JSON.stringify(q.getFileInfo()));
                    q.sending = true
                }
                p.send(u)
            }
        },
        onSendSuccess: function() {},
        sendSuccess: function() {
            var q = this;
            q.elem.find(".btn-proc").off("click").html('<span style="color:red;">上传成功</span>');
            setTimeout(function() {
                q.elem.slideUp("fast", function() {
                    q.elem.remove()
                }).fadeOut("fast")
            }, 1500);
            q.close();
            var p = q.uploader.opts;
            if (p.onSuccess) {
                p.onSuccess(q.result)
            }
            q.onSendSuccess()
        },
        showStatus: function() {
            var p = this;
            var q = p.elem;
            if (p.enableRead == false) {
                return
            }
            var s = q.find("progress")[0];
            s.value = p.loaded;
            s.max = p.total;
            var r = q.find("#loaded");
            r.text(e(p.loaded));
            var t = q.find(".time-proc");
            var u = (new Date().getTime() - p.startTime.getTime()) / 1000;
            t.text(f(u))
        },
        readBlob: function() {
            var p = this;
            if (p.enableRead == false) {
                return
            }
            var q = this.file.slice(this.readed, this.readed + this.step);
            this.reader.readAsArrayBuffer(q)
        },
        stop: function() {
            var p = this;
            if (p.debug) {
                console.info("中止，loaded:" + p.loaded)
            }
            p.enableRead = false;
            p.reader.abort()
        },
        containue: function() {
            var p = this;
            if (p.debug) {
                console.info("继续,loaded:" + p.loaded)
            }
            p.enableRead = true;
            p.readBlob()
        },
        close: function() {
            var p = this;
            p.stop();
            if (p.uploadType == 2) {
                p.socket.close()
            }
        },
        getFileInfo: function() {
            var q = this;
            var p = this.uploader.opts;
            var r = {
                oldName: q.file.name,
                newName: q.newName,
                size: q.total,
                subfolder: p.subfolder,
                handleType: p.handleType,
                other: "",
            };
            return r
        }
    };
    function m(r, q) {
        this.loader = r;
        var p = {
            data: [],
            isImg: r.opts.isImg,
            uploadType: r.opts.uploadType,
            imgType: "image/jpeg",
            size: 0,
        };
        this.opts = a.extend({}, p, q);
        this.init()
    }
    m.prototype = {
        init: function() {
            var q = this;
            var p = this.opts;
            if (p.isImg) {
                if (p.uploadType == 1) {
                    q.ajaxImg()
                } else {
                    q.socketImg()
                }
            } else {
                console.error("当前类型不是图片")
            }
        },
        ajaxImg: function() {
            var q = this;
            var p = this.loader;
            var r = q.getBlob();
            var s = new i(p);
            s.sendInfo(q.getFileInfo());
            s.onmessage = function(u) {
                var t = new i(p);
                t.send(r, u);
                t.onmessage = function(v) {
                    if (v.curSize >= v.size) {
                        q.onSuccess(v)
                    }
                }
            }
        },
        socketImg: function() {
            var p = this;
            var q = p.getBlob();
            var s = new k(this.loader,undefined,undefined);
            s.onopen = function() {
                s.send(JSON.stringify(p.getFileInfo()));
                s.send(q)
            }
            ;
            var r = 0;
            s.onmessage = function(t) {
                var u = JSON.parse(t);
                r += u.curLength || 0;
                if (r >= q.size) {
                    s.close();
                    p.onSuccess(u)
                }
            }
        },
        getBlob: function() {
            var p = this.opts;
            var t = p.data;
            var s = t.split(",")[1];
            s = window.atob(s);
            var q = new Uint8Array(s.length);
            for (var u = 0; u < s.length; u++) {
                q[u] = s.charCodeAt(u)
            }
            var r = new Blob([q],{
                type: p.imgType
            });
            if (p.size == 0) {
                p.size = r.size
            }
            return r
        },
        getFileInfo: function() {
            var q = this;
            var p = this.loader.opts;
            var r = {
                oldName: "前台处理图片" + p.targetExt,
                size: q.opts.size,
                subfolder: p.subfolder + (p.subfolder2 || ""),
                handleType: p.handleType,
                other: "",
            };
            return r
        },
        onSuccess: function(p) {},
        onError: function() {
            console.error("上传异常空处理")
        },
    };
    function i(r, q) {
        this.uploader = r;
        var p = this.uploader.opts;
        this.onSuccess = q;
        this.debug = p.debug;
        var s = p.url;
        if (s == undefined || s.length <= 0) {
            alert("ajax提交连接地址不能空");
            return
        }
        this.url = s;
        this.xhr = new XMLHttpRequest();
        this.bind()
    }
    i.prototype = {
        bind: function() {
            var p = this;
            var q = this.xhr;
            q.open("post", p.url, true);
            q.onreadystatechange = function() {
                if (q.readyState == 4 && q.status == 200) {
                    var s = q.responseText;
                    var r = JSON.parse(s);
                    this.backData = r;
                    p.onmessage(r)
                } else {
                    if (q.status == 500) {
                        p.onerror("服务器处理出错 ，" + q.responseText, q)
                    }
                }
            }
        },
        onopen: function() {},
        onmessage: function(p) {},
        onclose: function() {
            this.xhr.abort()
        },
        onerror: function(p, q) {
            console.info(q);
            console.error(p)
        },
        sendInfo: function(r) {
            var s = JSON.stringify(r);
            var q = new FormData();
            q.append("fileinfo", s);
            try {
                this.xhr.send(q)
            } catch (p) {
                console.error(p)
            }
        },
        send: function(r, q) {
            var p = this;
            try {
                var t = new FormData();
                t.append("file", r);
                t.append("backinfo", JSON.stringify(q));
                this.xhr.send(t)
            } catch (s) {
                console.error(s)
            }
        }
    };
    function k(u, t, s) {
        var q = this;
        this.uploader = u;
        this.reader = t;
        var p = this.uploader.opts;
        this.onSuccess = s;
        this.debug = p.debug;
        var v = p.url;
        if (v == undefined || v.length <= 0) {
            alert("socket链接地址不能为空");
            return
        }
        try {
            this.url = v;
            this.ws = new WebSocket(v)
        } catch (r) {
            if (q.debug) {
                console.error(r)
            }
            console.error("创建socket链接失败，当前地址：" + v)
        }
        q.bind()
    }
    k.prototype = {
        bind: function() {
            var p = this;
            var q = p.reader;
            var r = p.ws;
            r.onopen = function() {
                if (p.debug) {
                    console.log("connected成功")
                }
                p.onopen();
                if (p.onSuccess) {
                    p.onSuccess()
                }
            }
            ;
            r.onmessage = function(t) {
                var s = t.data;
                p.onmessage(s)
            }
            ;
            r.onclose = function(s) {
                if (q) {
                    q.stop()
                }
                if (p.debug) {
                    console.log("链接中断")
                }
            }
            ;
            r.onerror = function(s) {
                if (q) {
                    q.stop()
                }
                if (p.debug) {
                    console.log("链接发生异常")
                }
                console.error(s)
            }
        },
        onopen: function() {},
        onmessage: function(p) {},
        close: function() {
            var p = this;
            var q = p.ws;
            q.close()
        },
        send: function(q) {
            var p = this;
            var r = p.ws;
            if (r.readyState == WebSocket.OPEN) {
                r.send(q)
            } else {
                if (p.debug) {
                    console.info("当前链接还不是打开状态:" + r.readyState);
                    console.error(r)
                }
            }
        }
    };
    function c(u) {
        var q = this;
        q.uploader = u;
        var s = {
            title: "上传图片",
            itemWidth: 380,
            itemHeight: 380,
            targetWidth: 200,
            targetHeight: 100,
            onYes: function() {},
            onCancel: function() {},
            onClose: function() {
                return true
            }
        };
        this.opts = a.extend({}, s, q.uploader.opts.coverParams);
        var p = this.opts;
        q.initWidth = 0;
        q.initHeight = 0;
        q.scale = 1;
        q.spanBackLeft = 0;
        q.spanBackTop = 0;
        var t = a(d("contentElem"));
        p.width = p.itemWidth + 20 + p.targetWidth + 30 + 20;
        p.height = p.itemHeight + 30 + 35 + 20;
        var r = a.cover({
            width: p.width,
            height: p.height,
            borderRadius: 0,
            clickDestroy: false,
            html: t
        });
        this.elem = t;
        this.cover = r;
        this.init()
    }
    c.prototype = {
        init: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            r.initTop();
            var s = d("uploader_middle");
            p.append(s);
            r.initLeftItem();
            r.initRightItem();
            s.append(d("clear"));
            r.initBottom();
            r.bind()
        },
        bind: function() {
            var r = this;
            var p = this.elem;
            var q = this.opts;
            var t = document.getElementById("canvasSource");
            var v = t.getContext("2d");
            var w = p.find(".imgItem");
            var u = w.find("#canvasUp");
            var s = w.find(".canvasBack");
            var y = false;
            var A = 0
              , B = 0;
            u.mousedown(function(C) {
                y = true;
                A = C.pageX - u.offset().left;
                B = C.pageY - u.offset().top;
                return false
            });
            s.mouseup(function(C) {
                y = false;
                x = false
            }).mousemove(function(E) {
                if (y) {
                    var H = E.pageX - w.offset().left - A;
                    var I = E.pageY - w.offset().top - B;
                    r.setCanvasUpSite(H, I)
                }
                if (x) {
                    var C = E.clientX;
                    var D = E.clientY;
                    var F = C - z;
                    var G = D - oldY;
                    r.spanBackLeft += F;
                    r.spanBackTop += G;
                    v.translate(F, G);
                    r.reShow();
                    z = C;
                    oldY = D
                }
            }).mouseleave(function() {
                y = false;
                x = false
            });
            addMouseWheel(s[0], function(C) {
                var E = C.delta > 0 ? 0.1 : -0.1;
                var F = r.initWidth * r.scale;
                var D = r.initHeight * r.scale;
                if (E < 0) {
                    if (F * D <= (r.initWidth * r.initHeight / 2)) {
                        return
                    }
                } else {
                    if (F * D >= (r.img.width * r.img.height * 1.5)) {
                        return
                    }
                }
                r.scale += E;
                r.reShow();
                return false
            });
            var x = false;
            var z = oldY = 0;
            s.mousedown(function(C) {
                x = true;
                z = C.clientX;
                oldY = C.clientY
            });
            r.bindSquare();
            r.bindDrag()
        },
        bindSquare: function() {
            var r = this;
            var p = this.elem;
            var q = this.opts;
            var y = p.find(".imgItem");
            var t = y.find("#canvasUp");
            var s = t.parent();
            var z = -1
              , E = 0
              , F = 0
              , D = 0
              , A = 0
              , B = 0
              , C = 0;
            var u = y.find(".divSquare");
            u.mousedown(function(H) {
                G(1, H);
                return false
            });
            var v = y.find(".divSquare_lb");
            v.mousedown(function(H) {
                G(2, H);
                return false
            });
            var w = y.find(".divSquare_lt");
            w.mousedown(function(H) {
                G(3, H);
                return false
            });
            var x = y.find(".divSquare_rt");
            x.mousedown(function(H) {
                G(4, H);
                return false
            });
            s.mousemove(function(H) {
                var K = 20;
                var L = H.pageX;
                var M = H.pageY;
                var N = rHeight = rLeft = rTop = 0;
                if (z == 1) {
                    var O = L - E;
                    var P = O * (q.targetHeight / q.targetWidth);
                    N = O + D;
                    rHeight = P + A;
                    rLeft = B;
                    rTop = C
                } else {
                    if (z == 2) {
                        var P = M - F;
                        var O = -P * (q.targetWidth / q.targetHeight);
                        N = D - O;
                        rHeight = A + P;
                        rLeft = B + O;
                        rTop = C
                    } else {
                        if (z == 3) {
                            var O = L - E;
                            var P = O * (q.targetHeight / q.targetWidth);
                            N = D - O;
                            rHeight = A - P;
                            rLeft = B + O;
                            rTop = C + P
                        } else {
                            if (z == 4) {
                                var P = M - F;
                                var O = -P * (q.targetWidth / q.targetHeight);
                                N = D + O;
                                rHeight = A - P;
                                rLeft = B;
                                rTop = C + P
                            } else {
                                return
                            }
                        }
                    }
                }
                var J = s.width() - t.position().left;
                var I = s.height() - t.position().top;
                N = N > J ? J : N;
                rHeight = rHeight > I ? I : rHeight;
                rLeft = rLeft < 0 ? 0 : rLeft;
                rTop = rTop < 0 ? 0 : rTop;
                N = N < q.targetWidth ? q.targetWidth : N;
                rHeight = rHeight < q.targetHeight ? q.targetHeight : rHeight;
                t.css({
                    left: rLeft,
                    top: rTop
                });
                t.attr("width", N).attr("height", rHeight);
                r.showTarget();
                r.setSquareSite();
                return false
            }).mouseup(function(H) {
                z = -1;
                return false
            }).mouseleave(function() {
                z = -1;
                return false
            });
            function G(I, H) {
                z = I;
                E = H.pageX;
                F = H.pageY;
                B = t.position().left;
                C = t.position().top;
                D = t.width();
                A = t.height()
            }
        },
        bindDrag: function() {
            var q = this;
            var p = this.elem.get(0);
            var s = this.elem.parents(".coverInner");
            document.ondragover = function() {
                return false
            }
            ;
            document.ondrop = function() {
                return false
            }
            ;
            p.ondragenter = function(t) {
                return false
            }
            ;
            p.ondragover = function() {
                s.addClass("coverInner-hot");
                return false
            }
            ;
            p.ondrop = function(t) {
                var v = t.dataTransfer.files;
                if (v.length > 0) {
                    var u = v[0];
                    if (r(u) == false) {
                        return false
                    }
                    var w = new FileReader();
                    w.onload = function() {
                        q.showImg(w.result)
                    }
                    ;
                    w.readAsDataURL(u)
                }
                s.removeClass("coverInner-hot");
                return false
            }
            ;
            function r(t) {
                if (!/image\/\w+/.test(t.type)) {
                    error(t.name + "-----不是图片");
                    return false
                }
                return true
            }
        },
        initTop: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var u = d("top");
            var t = d("title");
            t.text(q.title);
            u.append(t);
            var s = d("closeBtn");
            s.append('<a href="javascript:void(0)" title="关闭">×</a>');
            s.click(function() {
                var v = q.onClose();
                if (v) {
                    r.destroy()
                }
            });
            u.append(s);
            p.append(u)
        },
        initLeftItem: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var A = p.find(".uploader_middle");
            var z = d("leftItem");
            A.append(z);
            z.css({
                width: q.itemWidth,
                height: q.itemHeight
            });
            var C = d("uploadItem");
            var B = d("upBtnDiv");
            var s = d("btnDesc");
            s.text("将图片拖入框中即可读取");
            B.append(s);
            B.append(d("uploader"));
            C.append(B);
            var w = d("extention");
            var x = "";
            if (r.uploader.opts.fileExts != "*") {
                x = "*仅支持" + r.uploader.opts.fileExts + ","
            }
            w.text(x + "不超过" + e(r.uploader.opts.maxSize));
            B.append(w);
            z.append(C);
            var y = d("imgItem");
            y.css({
                width: q.itemWidth,
                height: q.itemHeight,
                position: "relative"
            });
            var t = a('<canvas id="canvasSource" width="' + q.itemWidth + '" height="' + q.itemHeight + '"></canvas>');
            t.css({
                position: "absolute"
            });
            y.append(t);
            var u = d("canvasBack");
            u.css({
                width: q.itemWidth,
                height: q.itemHeight
            });
            var v = a('<canvas id="canvasUp" width="' + q.targetWidth + '" height="' + q.targetHeight + '"></canvas>');
            u.append(v);
            u.append(d("divSquare"));
            u.append(d("divSquare_lb"));
            u.append(d("divSquare_lt"));
            u.append(d("divSquare_rt"));
            y.append(u);
            y.hide();
            z.append(y);
            r.initBtn()
        },
        initRightItem: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var t = p.find(".uploader_middle");
            var v = d("rightItem");
            t.append(v);
            var u = d("previewDiv");
            var x = d("targetOneItem");
            var w = d("targetOne");
            var s = a('<canvas id="canvasTarget"><canvas/>');
            s.attr("width", q.targetWidth).attr("height", q.targetHeight);
            w.append(s);
            var y = d("targetText");
            y.text("" + q.targetWidth + "px * " + q.targetHeight + "px");
            x.append(w).append(y);
            u.append(x);
            v.append(u)
        },
        initBottom: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var s = d("uploader_btnDiv");
            p.append(s);
            var u = a('<span class="uploader_yes"/>');
            u.text("确定");
            u.click(function() {
                var v = a(this);
                if (v.text() == "正在提交...") {
                    return
                }
                r.submit();
                v.text("正在提交...")
            });
            var t = a('<span  class="uploader_cancel"/>');
            t.text("取消");
            t.click(function() {
                q.onCancel(r);
                r.destroy()
            });
            s.append(u).append(t)
        },
        initBtn: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var s = p.find(".uploader");
            s.addClass("uploader-default");
            s.append(d("uploader_text").text("选择图片"));
            var t = d("uploader_file");
            var u = a('<form enctype="multipart/form-data"/>');
            u.append('<input  type="file" name="file" tabindex="10000"  />');
            t.append(u);
            t.append('<input type="hidden" name="target" class="target" />');
            s.append(t);
            addMouseWheel(p[0], function(v) {
                try {
                    v.preventDefault()
                } catch (v) {
                    return false
                }
            });
            r.bindRead()
        },
        bindRead: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var s = p.find("input[type=file]");
            s.change(function() {
                var v = a(this).val();
                if (b(v, r.uploader.opts) == false) {
                    return false
                }
                var t = this.files[0];
                var u = new FileReader();
                u.onload = function() {
                    r.showImg(u.result)
                }
                ;
                u.readAsDataURL(t)
            })
        },
        setCanvasUpSite: function(s, v) {
            var p = this;
            var r = a("#canvasUp");
            var q = r.parent();
            var t = q.width() - r.width() - 1;
            var u = q.height() - r.height() - 1;
            s = s > t ? t : s;
            v = v > u ? u : v;
            s = s < 0 ? 0 : s;
            v = v < 0 ? 0 : v;
            s = Math.round(s) + 1;
            v = Math.round(v) + 1;
            r.css({
                left: s,
                top: v
            });
            p.setSquareSite();
            p.showTarget()
        },
        setSquareSite: function() {
            var p = a("#canvasUp");
            a(".divSquare").css({
                left: p.position().left + p.width() - 2,
                top: p.position().top + p.height() - 2
            });
            a(".divSquare_lb").css({
                left: p.position().left - 2,
                top: p.position().top + p.height() - 2
            });
            a(".divSquare_lt").css({
                left: p.position().left - 2,
                top: p.position().top - 2
            });
            a(".divSquare_rt").css({
                left: p.position().left + p.width() - 2,
                top: p.position().top - 2
            })
        },
        showImg: function(s) {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var v = p.find(".leftItem");
            var w = p.find(".uploadItem");
            var u = p.find(".imgItem");
            var t = new Image();
            t.onload = function() {
                w.hide();
                u.show();
                var x = p.find(".uploader_btnDiv");
                if (x.find(".uploader").length == 0) {
                    var y = p.find(".uploader");
                    x.prepend(y.clone(true));
                    y.remove()
                }
                r.imgReadedInit()
            }
            ;
            t.src = s;
            r.img = t;
            r.initWidth = r.initHeight = 0;
            r.scale = 1
        },
        imgReadedInit: function() {
            var r = this;
            var q = this.opts;
            var p = this.elem;
            var v = r.img;
            var w = p.find(".imgItem");
            var s = document.getElementById("canvasSource");
            var u = s.getContext("2d");
            var B = 0
              , y = 0
              , z = 0
              , A = 0;
            if (v.width <= q.targetWidth || v.height <= q.targetHeight) {
                B = v.width;
                y = v.height;
                A = (w.height() - y) / 2 + 1;
                z = (w.width() - B) / 2 + 1
            } else {
                if (v.width > v.height) {
                    B = w.width();
                    var x = B / v.width;
                    y = v.height * x;
                    A = (w.height() - y) / 2 + 1
                } else {
                    y = w.height();
                    var x = y / v.height;
                    B = v.width * x;
                    z = (w.width() - B) / 2 + 1
                }
            }
            u.clearRect(0, 0, s.width, s.height);
            z = Math.round(z);
            A = Math.round(A);
            B = Math.round(B);
            y = Math.round(y);
            if (r.initWidth == 0) {
                r.initWidth = B;
                r.initHeight = y
            }
            r.reShow();
            u.drawImage(v, z, A, B, y);
            setTimeout(function() {
                r.showTarget()
            }, 100);
            var t = a("#canvasUp");
            r.setCanvasUpSite((w.width() - t.width()) / 2, (w.height() - t.height()) / 2)
        },
        reShow: function() {
            var p = this;
            var r = document.getElementById("canvasSource");
            var t = r.getContext("2d");
            var q = p.elem.find(".canvasBack");
            var u = q.width();
            var s = q.height();
            var y = p.initWidth * p.scale;
            var v = p.initHeight * p.scale;
            var w = Math.round((u - y) / 2);
            var x = Math.round((s - v) / 2);
            t.clearRect(-p.spanBackLeft, -p.spanBackTop, u, s);
            t.drawImage(p.img, w, x, y, v);
            p.showTarget()
        },
        showTarget: function() {
            var r = a("#canvasUp");
            var x = r.position().left;
            var y = r.position().top;
            var z = r.width();
            var w = r.height();
            var p = document.getElementById("canvasSource");
            var s = p.getContext("2d");
            var v = s.getImageData(x, y, z, w);
            var u = r[0].getContext("2d");
            u.putImageData(v, 0, 0);
            var q = document.getElementById("canvasTarget");
            var t = q.getContext("2d");
            t.clearRect(0, 0, q.width, q.height);
            t.rect(0, 0, q.width, q.height);
            t.fillStyle = "white";
            t.fill();
            t.drawImage(r[0], 0, 0, q.width, q.height)
        },
        submit: function() {
            var q = this;
            var p = this.uploader.opts;
            var r = document.getElementById("canvasTarget").toDataURL("image/jpeg", 1);
            q.total = r.length;
            p.targetExt = ".jpg";
            var s = new m(q.uploader,{
                data: r
            });
            s.onSuccess = function(t) {
                if (p.onSuccess) {
                    p.onSuccess(t)
                }
                q.destroy();
                q.elem.find(".uploader_yes").text("确定")
            }
        },
        destroy: function() {
            this.cover.destroy()
        }
    };
    function b(w, u) {
        var p = u;
        if (h()) {
            return true
        }
        var q = p.fileExts.toLowerCase().split(";");
        var v = "文件格式不正确，仅支持：" + q.join(",");
        if (w.length <= 0) {
            return false
        }
        if (p.fileExts == "*") {
            return true
        }
        var r = w.substr(w.lastIndexOf(".") + 1).toLowerCase();
        if (r.length <= 0) {
            l.error(v);
            return false
        }
        for (var s = 0; s < q.length; s++) {
            var t = q[s];
            if (t == r) {
                return true
            }
        }
        l.error(v);
        return false
    }
    function h() {
        var p = navigator.userAgent.toLowerCase();
        if (p.match(/MicroMessenger/i) == "micromessenger") {
            return true
        } else {
            return false
        }
    }
    function e(p) {
        if (p >= 1073741824) {
            return (p / 1073741824).toFixed(1) + "G"
        }
        if (p >= 1048576) {
            return (p / 1048576).toFixed(1) + "Mb"
        }
        return (p / 1024).toFixed(1) + "Kb"
    }
    function f(p) {
        if (p > 60) {
            return Math.floor(p / 60) + "m " + Math.round(p % 60) + "s"
        }
        return Math.round(p) + "s"
    }
    function d(p) {
        var q = a("<div />");
        q.addClass(p);
        return q
    }
    a.fn.uploader = function(p) {
        var q = new n(this,p);
        q.init();
        return q
    }
}
)(jQuery);
(function(a) {
    a.addMouseWheel = function(b, c) {
        if (document.mozHidden !== undefined) {
            b.addEventListener("DOMMouseScroll", function(d) {
                d.delta = -(d.detail || 0) / 3;
                c(d)
            })
        } else {
            if (a.addEventListener) {
                b.addEventListener("mousewheel", function(d) {
                    d.delta = d.wheelDelta / 120;
                    c(d)
                })
            } else {
                if (a.attachEvent) {
                    b.attachEvent("onmousewheel", function(d) {
                        d.delta = d.wheelDelta / 120;
                        return c(d)
                    })
                }
            }
        }
    }
}
)(window);
