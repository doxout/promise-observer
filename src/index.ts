import Promise = require('bluebird');

module observer {
    export interface Observer<T> {
            <U>(listener:(t:T) => U):LinkedObserver<U>
            <U>(listener:(t:T) => Promise<U>):LinkedObserver<U>
            next(predicate?:(t:T) => boolean):Promise<T>
            remove<U>(o:Observer<U>):void;
    }
    export interface LinkedObserver<T> extends Observer<T> {
        unlink():void;
    }
}

import Observer = observer.Observer;
import LinkedObserver = observer.LinkedObserver;

function composePromise<T, U, V>(f1:(u:U) => Promise<V>, f2:(t:T) => Promise<U>):(t:T) => Promise<V>
function composePromise<T, U, V>(f1:(u:U) => Promise<V>, f2:(t:T) => U):(t:T) => Promise<V> {
    return function (x) {
        var p = f2(x);
        if (p != null && typeof (<any>p).then === 'function')
            return (<Promise<U>><any>p).then(f1);
        return f1(p);
    }
}

function apply<T, U>(f:(t:T) => U, t:T): () => U {
    return function() {
        return f(t);
    }
}

interface Subscription<T, U> {
    emit(t:T):U;
    emit(t:T):Promise<U>;
    target:Observer<U>
}

function observer<T>(provide:(emit:(t:T) => Promise<void>) => void):Observer<T> {

    var subscriptions:Array<Subscription<T, any>> = [];

    function emit(t:T):Promise<void> {
        var all = subscriptions.map(s => s.emit(t));
        return Promise.all(all).thenReturn()
    }
    function next(predicate:(t:T) => boolean):Promise<T> {
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
    function subscribe<U>(listener:(t:T) => Promise<U>):LinkedObserver<U> {
        var notify:(u:U) => Promise<void>;
        var obs = <LinkedObserver<U>>observer<U>(emit2 => notify = emit2);
        subscriptions.push({
            emit: composePromise(notify, listener),
            target: obs
        });
        obs.unlink = apply(remove, obs);
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



export = observer;
