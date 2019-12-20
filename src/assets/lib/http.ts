/**
 * 发送请求
 */
import { Message, MessageBox } from 'element-ui';

interface HTTPConfig {
    showMessage: boolean;
    retry: boolean;
    timeoutTime: number;
    maxRetryCount: number;
}
type RequestConfig = Omit<RequestParams, 'body' | 'data' | 'params'> & { params?: string | FormData } & HTTPConfig;

export default class HTTP {

    /**
     * 项目请求模块
     * 以下配置可在发送请求前设置, 设置后在下次设置前都会是设置的值
     * 对已发送出的请求, 配置值是其发送时的值
     *
     * @param showMessage // 是否显示弹出后端返回的错误信息。默认: true
     * @param retry // 是否超时重试。默认: true
     * @param timeoutTime // 使用的超时时间, 单位毫秒。默认: 60000
     * @param maxRetryCount // 超时重试的最大次数。默认: 5
     */
    constructor(
        public showMessage: boolean = true,
        public retry: boolean = true,
        public timeoutTime: number = 60000,
        public maxRetryCount: number = 5
    ) {
        //
    }

    /**
     * 发送一个http请求
     * @param params.data 放入请求体中提交的数据
     * @param params.body 同params.data
     * @param params.params 放在url中提交的数据
     */
    public request(params: RequestParams & { method?: string }) {
        const body = params.data || params.body;
        params.data = params.body = void 0;

        const req = this.parseArgs(params, true);
        req.params = this.resolveBody(params.headers || {}, body);

        return this.doFetch(req, params.method || 'GET', 0);
    }

    /**
     * 发送一个http get请求
     * @description 请求参数都会添加在url上
     */
    public get(
        url: string | RequestParams,
        params: Record<string, any> = {},
        headers: Record<string, any> | Headers = {},
        controller?: AbortController
    ): Promise<ResponseData> {
        const req = this.parseArgs(url, true, params, headers, controller);
        return this.doFetch(req, 'GET', 0);
    }

    /**
     * 发送一个http post请求
     * @description 请求参数都会以请求体的方式发送给
     */
    public post(
        url: string | RequestParams,
        params: Record<string, any> = {},
        headers: Record<string, any> | Headers = {},
        controller?: AbortController
    ): Promise<ResponseData> {
        const req = this.parseArgs(url, false, params, headers, controller);
        return this.doFetch(req, 'POST', 0);
    }

    /**
     * 超时回调
     * @param req 请求相关数据
     * @param method 请求方法
     * @param retryCount 已重试次数
     */
    public timeout(req: RequestConfig, method: string, retryCount: number) {
        if (this.retry && retryCount++ <= this.maxRetryCount) {
            MessageBox.confirm('请求服务器超时, 是否重试?')
                .then(this.doFetch.bind(this, req, method, retryCount))
                .catch(console.log);
        }

        console.error(`request timeover ${method} ${req.url}`);
    }

    /**
     * 响应拦截器, 可通过重写完成不同的响应拦截器
     * @param res 响应对象
     */
    public async parseRes(res: Response) {
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

    /**
     * 请求前拦截器
     */
    public beforeFetch(req: RequestConfig): RequestConfig {
        return req;
    }

    /**
     * 判断请求状态码是否在成功范围内
     */
    public isSuccess(status: number) {
        return status >= 200 && status < 300;
    }

    // 解析请求参数
    private parseArgs(
        url: string | RequestParams,
        isGet: boolean,
        params: Record<string, any> = {},
        headers: Record<string, any> | Headers = {},
        controller?: AbortController
    ) {
        if (typeof url !== 'string') {
            params = url.body || url.data || url.params || {};
            headers = url.headers || {};
            controller = url.controller;
            url = url.url;
        }

        let reqBody: string | FormData | undefined = void 0;
        if (isGet) {
            const [path, s] = url.split('?');
            const searchParams = new URLSearchParams(s);
            Object.entries(params).forEach(([k, v]) => searchParams.append(k, v));
            url = path + '?' + searchParams.toString();
        } else {
            reqBody = this.resolveBody(headers, params);
        }

        return this.beforeFetch({
            ...this,
            url, headers, controller,
            params: reqBody
        });
    }

    private resolveBody(headers: Record<string, any> | Headers, data: Record<string, any> = {}) {
        const contentType = this.getHead(headers, 'Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return JSON.stringify(data);
        }

        return this.json2FormData(data);
    }

    // 发送请求
    private doFetch(req: RequestConfig, method: string, retryCount: number) {
        req.controller = req.controller || new AbortController();
        const init: RequestInit = {
            method,
            headers: req.headers,
            body: req.params,
            credentials: 'include',
            signal: req.controller.signal
        };

        const timer = setTimeout(() => {
            this.timeout(req, method, retryCount);
            req.controller && req.controller.abort();
        }, this.timeoutTime);

        return fetch(req.url, init)
            .finally(() => clearTimeout(timer))
            .then(this.parseRes.bind(this));
    }

    private getHead(headers: any, name: string) {
        if (headers instanceof Headers) {
            return headers.get(name);
        }

        return headers[name];
    }

    private json2FormData(parmas: Record<string, any>) {
        if (parmas instanceof FormData) {
            return parmas;
        }

        const data = new FormData();
        for (const [k, v] of Object.entries(parmas)) {
            data.append(k, v instanceof Blob ? v : v + '');
        }

        return data;
    }
}
