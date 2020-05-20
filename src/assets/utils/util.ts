import { BASE_URL } from '@/constant';

export * from './await';

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

// 将字符转成utf-8编码
export function encodeUtf8(text: string) {
    return new Uint8Array(text.length).map((el, idx) => text.charCodeAt(idx));
}

export function getIp() {
    let ip: string = location.hostname;
    if (process.env.NODE_ENV !== 'production') {
        const res = BASE_URL.match(/^https?:\/\/([\w\d\.]+)(:\d+)?\/$/);
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
/**
 * 获取配置文件数据
 * @param key
 * @param defaultValue
 */
export function getConfig<T>(key: string, defaultValue: T) {
    const config = sessionStorage.getItem('config');

    if (!config) {
        console.error('配置不存在');
        return defaultValue;
    }

    let res = JSON.parse(config);
    const keys = [];
    for (const k of key.split('.')) {
        keys.push(k);
        res = res[k];
        if (res == null) {
            console.warn(`config.${keys.join('.')} is ${res === undefined ? 'undefined' : 'null'}`);
            return defaultValue;
        }
    }

    return <T>res;
}
