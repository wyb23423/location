import Vue from 'vue';
import Events from './assets/lib/events';

declare module 'vue/types/vue' {
    interface Vue {
        $http: HTTP;
        $worker: VueWorker;
        $event: Events;
    }
}

type HTTPMethod = (
    url: string | RequestParams,
    params?: any,
    headers?: any,
    controller?: AbortController
) => Promise<ResponseData>;

interface HTTP {
    get: HTTPMethod;
    post: HTTPMethod;
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
