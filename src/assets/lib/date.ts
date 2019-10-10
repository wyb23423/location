/**
 * 将一个时间段转化为"dd:hh:mm:ss"的形式
 * @param range 时间范围
 * @param progress 需转化的时间占range的比例
 */
export function formatTime(range: number, progress: number) {
    if (!range) {
        return '00:00';
    }
    let time = (range * progress) / 100;

    const DAY_MS: number = 86400000;
    const HOUR_MS: number = 3600000;
    const MINUTE_MS: number = 60000;

    const day = Math.floor(time / DAY_MS);
    time = time % DAY_MS;

    const hour = Math.floor(time / HOUR_MS);
    time = time % HOUR_MS;

    const minute = Math.floor(time / MINUTE_MS);
    time = time % MINUTE_MS;

    const tip: number[] = [minute, Math.round(time / 1000)];
    if (hour > 0) {
        tip.unshift(hour);
    }
    if (day > 0) {
        tip.unshift(day, hour);
    }

    return tip.map((v, i) => (i ? v.toString().padStart(2, '0') : v)).join(':');
}

/**
 * 将一个时间转成特定格式
 * @param value 时间
 * @param fmt 格式
 */
export function formatDate(value: number | Date, fmt: string = 'yyyy/MM/dd hh:mm:ss') {
    if (isNaN(+value)) {
        return value;
    }

    const date = typeof value === 'number' ? new Date(value) : value;

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    const o = [
        'M+', date.getMonth() + 1,
        'd+', date.getDate(),
        'h+', date.getHours(),
        'm+', date.getMinutes(),
        's+', date.getSeconds()
    ];

    for (let i = 0; i < o.length; i++) {
        if (new RegExp(`(${o[i++]})`).test(fmt)) {
            const str = o[i] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : str.padStart(str.length, '0'));
        }
    }
    return fmt;
}
