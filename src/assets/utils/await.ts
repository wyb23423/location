/**
 * 空函数
 */
export function none(a?: any, b?: any, c?: any, d?: any) {
    //
}

/**
 * 优雅处理async/awiat的错误
 * 通过函数返回相同结构数据
 */
export async function awaitWrap<T, U = any>(promise: Promise<T>) {
    try {
        const res = await promise;
        return ({ err: null, value: res });
    } catch (e) {
        return ({ err: <U>e, value: null });
    }
}

/**
 * 优雅处理async/awiat的错误
 * 通过装饰器捕获错误, 适用于类方法可用一个try/catch整个包起来的情况
 * @param errorCall 错误处理函数
 */
export function Async<U = any>(errorCall: (e: U) => any = none) {
    return (target: any, calleeName: string, descriptor: PropertyDescriptor) => {
        const oriFunc = descriptor.value;
        descriptor.value = async function(this, ...args: any[]) {
            try {
                return await oriFunc.apply(this, args);
            } catch (err) {
                return errorCall(err);
            }
        };
    };
}

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


