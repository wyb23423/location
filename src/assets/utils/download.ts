import { getAndCreateStore } from '../lib/localstore';
import { get } from '../lib/http';

/**
 * 导出tabel为excel
 */

const uri: string = 'data:application/vnd.ms-excel;base64,';

function base64(s: string) {
    return window.btoa(unescape(encodeURIComponent(s)));
}

function format(table: string) {
    return `<html><head><meta charset="UTF-8"></head><body><table border="1">${table}</table></body></html>`;
}

export function table2Excel(table: string) {
    window.open(uri + base64(format(table)), 'block');
}

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
