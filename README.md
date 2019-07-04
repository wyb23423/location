# 莱恩微定位

### 注意事项

+ 修改pixi-action的Animation.prototype.update方法:

```js
// 其他代码

// do some update
this._ended = this.action.update(this.sprite, delta, deltaMS);
this.emit('update', this.sprite); // 添加

// 其他代码
```
