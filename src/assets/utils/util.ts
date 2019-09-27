import { BASE_URL } from '@/constant';

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

// 将字符转成utf-8编码
export function encodeUtf8(text: string) {
    return new Uint16Array(text.length).map((el, idx) => text.charCodeAt(idx));
}

export function getIp() {
    let ip: string = location.hostname;
    if (process.env.NODE_ENV !== 'production') {
        const res = BASE_URL.match(/^http:\/\/([\w\d\.]+)(:\d+)?\/$/);
        if (res) {
            ip = res[1];
        } else {
            return console.error('域名解析失败');
        }
    }

    return ip;
}

export function hexadecimalRuleFactory(length: number, name: string) {
    return {
        pattern: new RegExp(`^[0-9A-Fa-f]{1,${length}}$`), // /^[0-9A-Fa-f]{1,4}$/,
        message:
            `${name} is not a hexadecimal string less than ${length} in length`
    };
}

/**
 * base64转blob
 */
export function base642blob(base64: string) {
    if (base64.startsWith('data:') && base64.includes('base64')) {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    return new Blob();
}
