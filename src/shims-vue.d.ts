import Vue from 'vue';

declare module '*.vue' {
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    $http: { get: HTTPMethod; post: HTTPMethod };
  }
}

type HTTPMethod = (url: string | RequestParams, params?: any, headers?: any) => Promise<ResponseData>;
