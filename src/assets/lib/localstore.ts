/**
 * 本地缓存"数据库"
 */

import localforage, { localforageGetItem } from './localforage';

const stores: Map<string, LocalForage> = new Map();

/**
 * 获取数据
 */
export function getItem<T>(store: string, key: string) {
    const db = stores.get(store);
    if (db) {
        return db.getItem<T>(key);
    }

    return Promise.reject(`标识为${store}的缓存数据不存在`);
}

/**
 * 设置数据
 */
export function setItem<T>(store: string, key: string, value: T) {
    const db = stores.get(store);
    if (db) {
        return db.setItem<T>(key, value);
    }

    return Promise.reject(`标识为${store}的缓存数据不存在`);
}

/**
 * 创建并获取数据库
 */
export function getAndCreateStore(name: string): LocalForage {
    if (stores.has(name)) {
        return stores.get(name)!;
    }

    const obj = localforage.createInstance({ storeName: name });
    const store = new Proxy(obj, {
        get(t: LocalForage, k: keyof LocalForage) {
            if (k === 'getItem') {
                return <T>(key: string): Promise<T> => localforageGetItem<T>(key, t);
            }

            const val = t[k];
            return typeof val === 'function' ? val.bind(t) : val;
        }
    });
    stores.set(name, store);

    return store;
}
