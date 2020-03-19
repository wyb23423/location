type Target<T> = {
    id: string;
    dataset: T;
    [x: string]: any;
}

type WxTouch = {
    identifier: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
}

declare interface BaseEvent<
    T extends object = Record<string, any>,
    C extends object = T,
    M extends object = Record<string, any>,
    D extends object = Record<string, any>
    > {
    type: string;
    detail: D;
    target: Target<T>;
    currentTarget: Target<C>;
    timeStamp: number;
    mark: M;
}

declare interface WxTouchEvent extends BaseEvent {
    touches: WxTouch[]
}

declare interface CanvasTouch extends BaseEvent {
    identifier: number;
    currentTarget: never;
    x: number;
    y: number;
}