/**
 * 发送请求
 */
import { isThisType } from '../utils/util';
import { Message } from 'element-ui';

/**
 * 发送get请求
 */
export async function get(
    url: string | RequestParams,
    params: any = {},
    headers: any = {},
    controller?: AbortController
): Promise<ResponseData> {
    const req = parseArgs(url, true, params, headers, controller);
    if (typeof req === 'string') {
        console.error(req);

        return Promise.reject(req);
    }

    const init: RequestInit = {
        headers: req.headers,
        credentials: 'include',
        method: 'GET'
    };

    controller = req.controller || new AbortController();
    init.signal = controller.signal;

    return parseRes(await fetch(req.url, init));
}

export async function post(
    url: string | RequestParams,
    params: any = {},
    headers: any = {},
    controller?: AbortController
): Promise<ResponseData> {
    const req = parseArgs(url, false, params, headers, controller);
    if (typeof req === 'string') {
        console.error(req);

        return Promise.reject(req);
    }

    const init: RequestInit = {
        headers: req.headers,
        body: req.params,
        credentials: 'include',
        method: 'POST'
    };
    if (req.controller) {
        init.signal = req.controller.signal;
    }

    return parseRes(await fetch(req.url, init));

}

async function parseRes(res: Response) {
    if (isSuccess(res.status)) {
        const data: ResponseData = await res.json();
        const codeSuccess = isSuccess(data.code);
        if (codeSuccess && data.success) {
            data.pagedData = data.pagedData || {
                pageSize: 0,
                currentPage: 1,
                datas: [],
                totalCount: 0
            };
            data.pagedData.datas = data.pagedData.datas || [];

            return data;
        } else {
            if (!codeSuccess) {
                Message.error({
                    message: data.message,
                    showClose: true
                });
            } else {
                console.error(data.message);
            }

            return Promise.reject(data);
        }
    } else {
        console.error(`${res.status}: ${res.statusText}`);

        return Promise.reject(res);
    }
}

function parseArgs(
    url: string | RequestParams,
    isGet: boolean,
    params: any = {},
    headers: any = {},
    controller?: AbortController
) {
    if (typeof url !== 'string') {
        if (!isThisType(url, 'object')) {
            return '参数类型错误';
        }

        params = url.body || url.data || url.params || {};
        headers = url.headers || {};
        controller = url.controller;
        url = url.url;
    }

    if (!(headers instanceof Headers || isThisType(headers, 'object'))) {
        return '请求头必须为Headers对象或纯对象';
    }

    if (isGet) {
        if (!isThisType(params, 'object')) {
            return '请求参数必须为纯对象';
        }

        const start = url.includes('?') ? '&' : '?';
        url = Object.entries(params).reduce((a, [k, v], i) => a + `${i ? '&' : start}${k}=${v}`, url);
    } else {
        const contentType = getHead(headers, 'Content-Type');
        if (!contentType) {
            params = json2FormData(params);
        } else if (contentType.includes('application/json')) {
            if (isThisType(params, 'object')) {
                params = JSON.stringify(params);
            }
        }
    }


    return { url, params, headers, controller };
}

function isSuccess(status: number) {
    return status >= 200 && status < 300;
}


function getHead(headers: any, name: string) {
    if (headers instanceof Headers) {
        return headers.get(name);
    }

    return headers[name];
}

function json2FormData(parmas: any) {
    if (parmas instanceof FormData) {
        return parmas;
    }

    const data = new FormData();
    for (const [k, v] of Object.entries(parmas)) {
        data.append(k, <Blob | string>v);
    }

    return data;
}
