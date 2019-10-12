/**
 * 发送请求
 */
import { Message, MessageBox } from 'element-ui';

export default class HTTP {
    public isTimeover: boolean = false;

    private url: string = '';
    private params?: string | FormData;
    private headers: Record<string, any> | Headers = {};
    private controller!: AbortController;
    private retryCount: number = 0;

    constructor(
        private showMessage: boolean = true,
        private retry: boolean = true
    ) {
        //
    }

    public get(
        url: string | RequestParams,
        params: Record<string, Blob | string | number> = {},
        headers: Record<string, any> | Headers = {},
        controller?: AbortController
    ): Promise<ResponseData> {
        this.retryCount = 0;
        this.parseArgs(url, true, params, headers, controller);

        return this.doFetch('GET');
    }

    public post(
        url: string | RequestParams,
        params: Record<string, Blob | string | number> = {},
        headers: Record<string, any> | Headers = {},
        controller?: AbortController
    ): Promise<ResponseData> {
        this.retryCount = 0;
        this.parseArgs(url, false, params, headers, controller);

        return this.doFetch('POST');
    }

    protected timeoutCall(method: 'POST' | 'GET') {
        if (this.retry && this.retryCount++ <= 5) {
            MessageBox.confirm('请求服务器超时, 是否重试?')
                .then(this.doFetch.bind(this, method))
                .catch(console.log);
        }

        console.error(`request timeover ${method} ${this.url}`);
    }

    /**
     * 请求超时的处理函数
     */
    private timeout(method: 'POST' | 'GET') {
        this.isTimeover = false;

        return setTimeout(() => {
            this.timeoutCall(method);

            this.isTimeover = true;
            this.controller.abort();
        }, 60000);
    }

    // 解析请求参数
    private parseArgs(
        url: string | RequestParams,
        isGet: boolean,
        params: Record<string, Blob | string | number>,
        headers: Record<string, any> | Headers,
        controller?: AbortController
    ) {
        if (typeof url !== 'string') {
            params = url.body || url.data || url.params || {};
            headers = url.headers || {};
            controller = url.controller;
            url = url.url;
        }

        if (isGet) {
            const start = url.includes('?') ? '&' : '?';
            url = Object.entries(params).reduce((a, [k, v], i) => `${a}${i ? '&' : start}${k}=${v}`, url);
            this.params = void 0;
        } else {
            const contentType = this.getHead(headers, 'Content-Type');
            if (contentType && contentType.includes('application/json')) {
                this.params = JSON.stringify(params);
            } else {
                this.params = this.json2FormData(params);
            }
        }

        this.url = url;
        this.headers = headers;
        this.controller = controller || new AbortController();
    }

    // 发送请求
    private doFetch(method: 'POST' | 'GET') {
        const init: RequestInit = {
            method,
            headers: this.headers,
            body: this.params,
            credentials: 'include',
            signal: this.controller.signal
        };

        const timer = this.timeout(method);

        return fetch(this.url, init)
            .finally(() => clearTimeout(timer))
            .then(this.parseRes.bind(this));
    }

    // 解析响应
    private async parseRes(res: Response) {
        if (this.isSuccess(res.status)) {
            let data: ResponseData;
            try {
                data = await res.json();
            } catch (e) {
                console.log(await res.text());
                return Promise.reject(e);
            }

            const codeSuccess = this.isSuccess(data.code);
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
                if (!codeSuccess && this.showMessage) {
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

    private getHead(headers: any, name: string) {
        if (headers instanceof Headers) {
            return headers.get(name);
        }

        return headers[name];
    }

    private json2FormData(parmas: Record<string, Blob | string | number>) {
        if (parmas instanceof FormData) {
            return parmas;
        }

        const data = new FormData();
        for (const [k, v] of Object.entries(parmas)) {
            data.append(k, typeof v === 'number' ? v + '' : v);
        }

        return data;
    }

    private isSuccess(status: number) {
        return status >= 200 && status < 300;
    }
}
