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
