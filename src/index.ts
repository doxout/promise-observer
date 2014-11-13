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

export function create<T>(provide:(emit:(t:T) => Promise<void>) => void) {

    var subscriptions:Array<Subscription<T, any>> = [];

    function emit(t:T) {
        var count = subscriptions.length;
        var results = new Array(count);
        for (var k = 0; k < count; ++k)
            results[k] = subscriptions[k].emit(t);
        return helpers.waitAll(results);
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
    function remove<U>(target:Observer<U>) {
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

