/**
 * 发送请求
 */
import { isThisType } from './util';
import { Message } from 'element-ui';

interface RequestParams {
    url: string;
    params?: any;
    body?: any;
    data?: any;
    headers?: any;
}

export interface ResponseData {
    code: number;
    message: string;
    pagedData: any;
    resultMap: any;
    success: boolean;
}

/**
 * 发送get请求
 */
export async function get(
    url: string | RequestParams,
    params: any = {},
    headers: any = {}
) {
    const req = parseArgs(url, true, params, headers);
    if (typeof req === 'string') {
        return Promise.reject(req);
    }

    const res = await fetch(req.url, {
        headers: req.headers,
        credentials: 'include',
        method: 'GET'
    });

    return parseRes(res);
}

export async function post(
    url: string | RequestParams,
    params: any = {},
    headers: any = {}
) {
    const req = parseArgs(url, false, params, headers);
    if (typeof req === 'string') {
        console.error(req);

        return Promise.reject(req);
    }

    try {
        console.log(req.url);
        const res = await fetch(req.url, {
            headers: req.headers,
            body: req.params,
            credentials: 'include',
            method: 'POST'
        });
        return parseRes(res);
    } catch (e) {
        console.error(e);

        return Promise.reject(e);
    }
}

async function parseRes(res: Response) {
    if (isSuccess(res.status)) {
        const data: ResponseData = await res.json();
        const codeSuccess = isSuccess(data.code);
        if (codeSuccess && data.success) {
            return data;
        } else {
            if (!codeSuccess) {
                Message.error(data.message);
            } else {
                console.error(data.message);
            }

            return Promise.reject(data);
        }
    } else {
        console.error(`${res.status}: 请求失败`);

        return Promise.reject(res);
    }
}

function parseArgs(
    url: string | RequestParams,
    isGet: boolean,
    params: any = {},
    headers: any = {}
) {
    if (typeof url !== 'string') {
        if (!isThisType(url, 'object')) {
            return '参数类型错误';
        }

        params = url.body || url.data || url.params || {};
        headers = url.headers || {};
        url = url.url;
    }

    if (!(headers instanceof Headers || isThisType(headers, 'object'))) {
        return '请求头必须为Headers对象或纯对象';
    }

    if (isGet) {
        if (!isThisType(params, 'object')) {
            return '请求参数必须为纯对象';
        }

        url = Object.entries(params).reduce((a, [k, v], i) => a + `${i ? '&' : '?'}${k}=${v}`, url);
    }

    if (isThisType(params, 'object')) {
        params = JSON.stringify(params);
    }

    return { url, params, headers };
}

function isSuccess(status: number) {
    return status >= 200 && status < 300;
}
