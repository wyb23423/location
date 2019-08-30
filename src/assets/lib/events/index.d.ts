type CallBack = (...args: any[]) => void;

export type EvtName = string | symbol | number;

export default class Events {
    // tslint:disable-next-line:ban-types
    public static mixTo(target: object | Function): void;

    public on(evt: EvtName, handler: CallBack): Events;
    public once(evt: EvtName, handler: CallBack): Events;
    public off(evt: EvtName, handler?: CallBack): Events;
    public emit(evt: EvtName, ...args: any[]): Events;
    public trigger(evt: EvtName, ...args: any[]): Events;
}
