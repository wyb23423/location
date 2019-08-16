/**
 * 从服务器慢加载数据
 */

import localforage, { localforageGetItem } from './localforage';
import { get } from '../utils/http';

const stores: Map<string, LocalForage> = new Map();

export function load(url: string, key: string, name: string) {
    const store = getAndCreateStore(name);
    let isEnd = false;

    function _load(currentPage: number = 1) {
        get(url, { pageSize: 1000, currentPage })
            .then(res => {
                const data = res.pagedData;
                data.datas.forEach((v: any) => store.setItem(v[key], v));
                isEnd = currentPage++ * 1000 >= data.totalCount;
            })
            .catch(console.log)
            .finally(() => isEnd || _load(currentPage));
    }
    _load();

    return store;
}

export function getStore(name: string) {
    return stores.has(name) ? stores.get(name) : null;
}


function getAndCreateStore(name: string): LocalForage {
    if (stores.has(name)) {
        return stores.get(name)!;
    }

    const store = localforage.createInstance({});
    store.getItem = <T>(key: string): Promise<T> => {
        return localforageGetItem<T>(key, store);
    };
    stores.set(name, store);

    return store;
}
