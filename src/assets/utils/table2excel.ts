/**
 * 导出tabel为excel
 */

const uri: string = 'data:application/vnd.ms-excel;base64,';

function base64(s: string) {
    return window.btoa(unescape(encodeURIComponent(s)));
}

function format(table: string) {
    return `<html><head><meta charset="UTF-8"></head><body><table  border="1">${table}</table></body></html>`;
}

export default function table2Excel(table: HTMLTableElement) {
    window.open(uri + base64(format(table.innerHTML)), 'block');
}
