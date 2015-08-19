declare module 'promise-observer/helpers' {
	import Promise = require('bluebird');
	export function composePromise<T, U, V>(f1: (u: U) => Promise<V>, f2: (t: T) => Promise<U>): (t: T) => Promise<V>;
	export function apply<T, U>(f: (t: T) => U, t: T): () => U;
	export function waitAll(promises: Promise<any>[]): Promise<void>;

}
declare module 'promise-observer/index' {
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
	export interface Options {
	    emitTimeout?: number;
	}
	export interface TimeoutError extends Error {
	    timedoutListener: string;
	}
	export function create<T>(provide: (emit: (t: T) => Promise<void>) => void, opts?: Options): Observer<T>;

}
declare module 'promise-observer' {
	import main = require('promise-observer/index');
	export = main;
}
