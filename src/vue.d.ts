import Vue from 'vue';
import Events from './assets/lib/events';

declare module 'vue/types/vue' {
    interface Vue {
        $http: HTTP;
        $worker: VueWorker;
        $event: Events;
        $async<T, U = any>(promise: Promise<T>): Promise<{ err: null; value: T; } | { err: U; value: null; }>;
    }
}

type HTTPMethod = (
    url: string | RequestParams,
    params?: Record<string, any>,
    headers?: Record<string, any> | Headers,
    controller?: AbortController
) => Promise<ResponseData>;

interface HTTP {
    get: HTTPMethod;
    post: HTTPMethod;
    isTimeover: boolean;
    showMessage: boolean;
    retry: boolean;
    timeoutTime: number;
    maxRetryCount: number;
}

interface VueWorker {
    run<T>(fn: (...args: any[]) => T, args?: any[]): Promise<T>;
    create(actions?: Action[]): WorkerObj;
}

interface Action {
    message: string;
    func(...args: any[]): any;
}

interface WorkerObj {
    postMessage<T = any>(message: string, args?: any[]): Promise<T>;
    postAll(args?: Array<string | Args>): Promise<any[]>;
    register(actions: Action | Action[]): void;
    unregister(message: string | string[]): void;
}

interface Args {
    message: string;
    args: any[];
}
