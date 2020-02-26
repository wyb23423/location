# 莱恩微定位

### pixi-action修改

pixi-action没有提供运动时每一帧的钩子,而项目中需要这个钩子，所以做如下修改后将其重编译一下。

-------------------------------------

##### 1. 修改pixi-action的Animation.prototype.update方法
```js
// 其他代码

// do some update
this._ended = this.action.update(this.sprite, delta, deltaMS);
this.emit('update', this.sprite); // 添加

// 其他代码
```
##### 2. 修改pixi-action中webpack.config.js的loaders配置
```js
{
    test: /\.js$/,
    // exclude: /node_modules/, // 去掉这行。由于PIXI使用了es6语法，UglifyJsPlugin压缩时会报错
    loader: 'babel-loader?presets[]=es2015&presets[]=stage-0'
}
```

### config.json说明

---------------------------
    {
        "APP_KEY": "83a75157d56ffe85317ed7ba1e8120ff", // fengmap 对应app_id
        "APP_NAME": "hunjingguanchang", // fengmap 对应app_name
        "SECOND_COUNT": 5, // 实时监控时每秒收到数据的数量(单个标签)
        "PROXY_TARGET": "http://127.0.0.1/", // 调试服务器地址, 最后的 / 必须
        "CHARTS_TARGET": "http://127.0.0.1:3000", // 表格服务器地址
        // 对定位数据的调整
        "adjust": {
            "x": 0,
            "y": 0
        },
        // 系统中使用的socket地址
        "websoket": {
            "position": "ws://#{ip}:8082/realtime/position", // 定位
            "sundries": "ws://#{ip}:8081/sundries" // 报警及其他杂项
        }
    }
