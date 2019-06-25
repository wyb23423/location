import Vue from 'vue';

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
