import * as localforage from 'localforage';

export default {
    ...localforage,
    async getItem<T>(key: string): Promise<T> {
        const data = await localforage.getItem<T>(key);
        if (data == null) {
            return Promise.reject();
        }

        return data;
    }
};
