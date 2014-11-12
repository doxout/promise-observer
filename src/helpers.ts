import Promise = require('bluebird')

export function composePromise<T, U, V>(f1:(u:U) => Promise<V>, f2:(t:T) => Promise<U>):(t:T) => Promise<V>
export function composePromise<T, U, V>(f1:(u:U) => Promise<V>, f2:(t:T) => U):(t:T) => Promise<V> {
    return function comp(x) {
        var p = f2(x);
        if (p != null && typeof (<any>p).then === 'function')
            return (<Promise<U>><any>p).then(f1);
        return f1(p);
    }
}

export function apply<T, U>(f:(t:T) => U, t:T): () => U {
    return function() {
        return f(t);
    }
}

export function waitAll(promises:Promise<any>[]):Promise<void> {
    var n = promises.length;
    if (n === 0) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
        var count = () => { if (--n === 0) resolve(void 0) };
        for (var k = 0; k < n; ++k)
            Promise.resolve(promises[k]).then(count);
    });
}

