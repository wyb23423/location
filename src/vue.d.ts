import Vue from 'vue';

interface RequestParams {
    url: string;
    params?: any;
    body?: any;
    data?: any;
    headers?: any;
}

interface ResponseData {
    code: number;
    message: string;
    pagedData: any;
    resultMap: any;
    success: boolean;
}

type HTTPMethod = (url: string | RequestParams, params?: any, headers?: any) => Promise<ResponseData>;

declare module 'vue/types/vue' {
    interface Vue {
        $http: HTTP;
    }
}

export interface HTTP {
    get: HTTPMethod;
    post: HTTPMethod;
}
