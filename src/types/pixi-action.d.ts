/**
 * pixi-action类型声明
 */

import { Sprite, utils } from 'pixi.js';

declare module 'pixi.js' {
    export const actionManager: ActionManager;
    export const action: ActionModule;
}

interface ActionManager {
    actions: { [is: string]: Animation };

    update(delta?: number): void;
    runAction(sprite: Sprite, action: Action): Animation;
    cancelAction(animation: Animation): void;
}

interface ActionModule {
    MoveTo: ActionConstructor<BaseAction>;
    MoveBy: ActionConstructor<BaseAction>;
    ScaleTo: ActionConstructor<BaseAction>;
    ScaleBy: ActionConstructor<BaseAction>;
    RotateTo: ActionConstructor<RotateAction>;
    RotateBy: ActionConstructor<RotateAction>;
    FadeIn: ActionConstructor<FadeAlphaAction>;
    FadeOut: ActionConstructor<FadeAlphaAction>;
    PivotTo: ActionConstructor<BaseAction>;
    PivotBy: ActionConstructor<BaseAction>;
    SkewTo: ActionConstructor<BaseAction>;
    SkewBy: ActionConstructor<BaseAction>;
    Blink: ActionConstructor<BlinkAction>;
    TintTo: ActionConstructor<TintAction>;
    TintBy: ActionConstructor<TintAction>;
    AlphaTo: ActionConstructor<FadeAlphaAction>;
    AlphaBy: ActionConstructor<FadeAlphaAction>;
    Repeat: ActionConstructor<RepeatAction>;
    Sequence: ActionConstructor<SequenceSpawnAction>;
    Spawn: ActionConstructor<SequenceSpawnAction>;
    DelayTime: ActionConstructor<Action>;
    CallFunc: ActionConstructor<CallFuncAction>;
}

interface Animation extends utils.EventEmitter {
    isEnded(): boolean;
    update(delta: number, deltaMS: number): void;
}
type AnimationConstructor = new (sprite: Sprite, action: Action) => Animation;
declare const Animation: AnimationConstructor;

interface Action {
    time: number;
    reset(): void;
    update(sprite: Sprite, delta: number, deltaMS: number): boolean;
}

interface BaseAction extends Action {
    x: number;
    y: number;
}

interface RotateAction extends Action {
    rotation: number;
}

interface FadeAlphaAction extends Action {
    alpha: number;
}

interface BlinkAction extends Action {
    count: number;
}

interface TintAction extends Action {
    tint: number;
}

interface RepeatAction extends Action {
    action: Action;
}

interface SequenceSpawnAction extends Action {
    action: Action[];
}

interface CallFuncAction extends Action {
    // tslint:disable-next-line:ban-types
    func: Function;
}

interface ActionConstructor<T> {
    new(argA: number, argB?: number, argC?: number): T;
    new(action: Action, time: number): RepeatAction;
    new(actions: Action[]): SequenceSpawnAction;
    // tslint:disable-next-line:ban-types
    new(func: Function): CallFuncAction;
}



