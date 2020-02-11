import * as localforage from 'localforage';

const forage = Object.create(Object.getPrototypeOf(localforage));
Object.assign(forage, localforage, {
    getItem<T>(key: string): Promise<T> {
        return localforageGetItem<T>(key, localforage);
    }
});
export default <LocalForage>forage;

// ==================
export async function localforageGetItem<T>(key: string, storge: LocalForage): Promise<T> {
    const data = await storge.getItem<T>(key);
    if (data == null) {
        return Promise.reject();
    }

    return data;
}
