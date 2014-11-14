declare module "promise-observer" {
import Promise = require('bluebird');
export interface Observer<T> {
    <U>(listener: (t: T) => U): LinkedObserver<U>;
    <U>(listener: (t: T) => Promise<U>): LinkedObserver<U>;
    next(predicate?: (t: T) => boolean): Promise<T>;
    remove<U>(o: Observer<U>): void;
}
export interface LinkedObserver<T> extends Observer<T> {
    unlink(): void;
}
export function create<T>(provide: (emit: (t: T) => Promise<void>) => void): Observer<T>;
}
