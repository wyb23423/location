import { getAndCreateStore } from '../lib/localstore';
import HTTP from '../lib/http';

/**
 * 导出tabel为excel
 */
export function table2Excel(table: string) {
    const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">${table}</table></body></html>`;
    const s = window.btoa(unescape(encodeURIComponent(html)));
    window.open('data:application/vnd.ms-excel;base64,' + s, 'block');
}

/**
 * 下载图片
 */
export function download(url: Blob | string, name: string = 'heatmap.png') {
    const oA = document.createElement('a');
    oA.download = name; // 设置下载的文件名，默认是'下载'
    oA.href = typeof url === 'string' ? url : URL.createObjectURL(url);
    document.body.appendChild(oA);
    oA.click();
    oA.remove(); // 下载之后把创建的元素删除

    URL.revokeObjectURL(oA.href);
}

/**
 * 从服务器慢加载数据
 */
export function load(url: string, key: string, name: string) {
    const store = getAndCreateStore(name);
    const http = new HTTP(false, false);

    if (!localStorage.getItem(name)) {
        let isEnd = false; // 是否数据请求完毕
        let errorCount: number = 0; // 连续请求失败的次数, 用于中断慢加载
        async function _load(currentPage: number = 1) {
            try {
                const res = await http.get(url, { pageSize: 1000, currentPage });

                const data = res.pagedData;
                data.datas.forEach((v: any) => store.setItem(v[key], v));

                errorCount = 0;
                isEnd = currentPage++ * 1000 >= data.totalCount;
            } catch (e) {
                errorCount++;
            }

            if (errorCount >= 10) {
                return localStorage.removeItem(name);
            }

            isEnd ? localStorage.setItem(name, '1') : _load(currentPage);
        }

        _load();
    }

    return store;
}
