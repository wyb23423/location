
/**
 * 轮询等待条件达成
 * @param condition 等待的条件
 * @param timeout 超时时间
 */
export function loopAwait(
    condition: () => boolean,
    timeout: number = 1000
): Promise<void> {
    const start: number = Date.now();

    const loop = (resolve: () => void, reject: (reason?: any) => void) => {
        if (condition()) {
            resolve();
        } else if (Date.now() - start > timeout) {
            reject('timeout');
        } else {
            requestAnimationFrame(() => loop(resolve, reject));
        }
    };

    return new Promise(loop);
}

/**
 * 获取一定范围内的随机数
 */
export function randomNum(min: number, max: number, isInt: boolean = true) {
    if (Number.isNaN(min) || Number.isNaN(max)) {
        console.error('min及max必须是数字');

        return 0;
    }

    if (min > max) {
        [max, min] = [min, max];
    }

    let num = min + Math.random() * (max - min);
    if (isInt) {
        num = Math.round(num);
    }

    return num;
}

/**
 * 获取随机颜色
 */
export function randomColor(hasAlpha: boolean = false) {
    const color = new Array(3).fill(0).map(v => randomNum(0, 255));
    color.push(hasAlpha ? Math.random() : 1);

    return `rgba(${color.join(',')})`;
}

/**
 * 判断一个变量是否是某种类型
 */
export function isThisType(obj: any, type: string) {
    type = type.replace(/^\w/, (w: string) => w.toLocaleUpperCase());

    return Object.prototype.toString.call(obj) === `[object ${type}]`;
}

/**
 * 创建可以返回递增数的函数
 */
export function incrementalFactory() {
    let num: number = 0;

    return () => num++;
}

/**
 * 将对象数据根据给定的key分组
 * @param isArr 对象的值是否是数组
 */
export function arr2obj(arr: IJson[], key: string, isArr: boolean = true) {
    const group: IJson = {};
    arr.forEach((v: any) => {
        const k: string = v[key];
        if (isArr) {
            (group[k] || (group[k] = [])).push(v);
        } else {
            group[k] = v;
        }
    });

    return group;
}

/**
 * 空函数
 */
export function none(a?: any, b?: any, c?: any, d?: any) {
    //
}

/**
 * 计算文本宽度
 */
export const getTextWidth = (() => {
    const w = new Map();

    return (
        text: string,
        ctx: CanvasRenderingContext2D,
        font: string = ''
    ) => {
        const key = text + font;
        if (w.has(key)) {
            return w.get(key);
        }

        if (font && ctx.font !== font) {
            ctx.font = font;
        }

        const width: number = ctx.measureText(text).width;
        if (w.size >= 500) {
            w.clear();
        }

        w.set(key, width);

        return width;
    };
})();

// 获取点击点
export function getPosition(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    } else if (e instanceof TouchEvent) {
        if (!e.touches.length) {
            return {
                x: 0,
                y: 0
            };
        }
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }

    console.error('事件对象错误: 事件对象必须是MouseEvent或TouchEvent');

    return { x: 0, y: 0 };
}
