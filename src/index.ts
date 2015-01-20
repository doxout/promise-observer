import Promise = require('bluebird');
import helpers = require('./helpers');

export interface Observer<T> {
        <U>(listener:(t:T) => U):LinkedObserver<U>
        <U>(listener:(t:T) => Promise<U>):LinkedObserver<U>
        next(predicate?:(t:T) => boolean):Promise<T>
        remove<U>(o:Observer<U>):void;
}

export interface LinkedObserver<T> extends Observer<T> {
    unlink():void;
}

interface Subscription<T, U> {
    emit(t:T):U;
    emit(t:T):Promise<U>;
    target:Observer<U>
}

export interface Options {
    emitTimeout?: number;
}
export function create<T>(provide:(emit:(t:T) => Promise<void>) => void, opts?:Options) {

    opts = opts || {};
    var subscriptions:Array<Subscription<T, any>> = [];

    function emit(t:T) {
        var results:any[] = [];
        for (var k = 0; k < subscriptions.length; ++k)
            results.push(subscriptions[k].emit(t))
        var wait = helpers.waitAll(results);
        if (opts.emitTimeout != null)
            wait = wait.timeout(opts.emitTimeout);
        return wait;
    }
    function next(predicate:(t:T) => boolean) {
        return new Promise<T>((resolve:(t:T) => void) => {
            var sub = subscribe(item => {
                if (predicate == null || predicate(item)) {
                    remove(sub);
                    resolve(item);
                }
            });
        });
    }
    function subscribe<U>(listener:(t:T) => U):LinkedObserver<U>
    function subscribe<U>(listener:(t:T) => Promise<U>) {
        var notify:(u:U) => Promise<void>;
        var obs = <LinkedObserver<U>>create<U>(emit2 => notify = emit2);
        subscriptions.push({
            emit: helpers.composePromise(notify, listener),
            target: obs
        });
        obs.unlink = helpers.apply(remove, obs);
        return obs;
    }
    function remove<U>(target:LinkedObserver<U>) {
        for (var k = 0; k < subscriptions.length; ++k)
            if (subscriptions[k].target == target)
                return subscriptions.splice(k, 1);
    }
    var self = <Observer<T>>subscribe;
    self.next = next;
    self.remove = remove;
    provide(emit);
    return self;
}

