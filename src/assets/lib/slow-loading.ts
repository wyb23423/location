/**
 * 从服务器慢加载数据
 */

import localforage, { localforageGetItem } from './localforage';
import { get } from '../utils/http';

const stores: Map<string, LocalForage> = new Map();

export function load(url: string, key: string, name: string) {
    const store = getAndCreateStore(name);

    if (!localStorage.getItem(name)) {
        let isEnd = false;
        function _load(currentPage: number = 1) {
            get(url, { pageSize: 1000, currentPage })
                .then(res => {
                    const data = res.pagedData;
                    data.datas.forEach((v: any) => store.setItem(v[key], v));
                    isEnd = currentPage++ * 1000 >= data.totalCount;
                })
                .catch(console.log)
                .finally(() => isEnd ? localStorage.setItem(name, '1') : _load(currentPage));
        }
        _load();
    }

    return store;
}

export function getItem<T>(store: string, key: string) {
    const db = stores.get(store);
    if (db) {
        return db.getItem<T>(key);
    }

    return Promise.reject(`标识为${store}的缓存数据不存在`);
}

export function setItem<T>(store: string, key: string, value: T) {
    const db = stores.get(store);
    if (db) {
        return db.setItem<T>(key, value);
    }

    return Promise.reject(`标识为${store}的缓存数据不存在`);
}

function getAndCreateStore(name: string): LocalForage {
    if (stores.has(name)) {
        return stores.get(name)!;
    }

    const store = localforage.createInstance({ storeName: name });
    store.getItem = <T>(key: string): Promise<T> => {
        return localforageGetItem<T>(key, store);
    };
    stores.set(name, store);

    return store;
}
