# promise-observer

An observer implementation with promise support.

Its meant to behave similarly to typical synchronous
[Java / NET observers](https://msdn.microsoft.com/en-us/library/ff648108.aspx),
where once you notify your subscribers you are able to wait for their update
functions to execute before proceeding

# Example

Given a blog post creator:

```typescript
import po = require('promise-observer')
function BlogPostCreator() {
    this.onCreated = po.create(emit => this.emit = emit);
}
BlogPostCreator.prototype.create = function(blogPost) {
    actuallyCreateBlogpost()
        .then(post => this.emit(post))
        // wait for all attached events to complete before commiting.
        .then(commitTransaction);
}
```

a categorizer can attach to its events


```typescript
onPostCategorized = blogPostCreator.onCreated(post =>
  categorize(post).then(saveCategory).thenReturn(post));
```

an indexer can add search terms to the index for that post

```typescript
onPostIndexed = blogPostCreator.onCreated(post =>
  index(post).then(saveIndex).thenReturn(post));
```

Then, the email notification system can wait for the post to be
categorized and indexed before sending a notification to all subscribers:

```typescript
onPostNotification = blogPostCreator.onCreated(post => {
  var categorized = onPostCategorized.next(categorizedPost => categorizedPost.id == post.id);
  var indexed = onPostIndexed.next(indexedPost => indexedPost.id == post.id);
  return Promise.join(categorized, indexed, _ => sendEmailNotification(post))
});
```

# API


### po.create(emit):Observable

`po.create(emit: (val:T) => Promise<void>):Observable<T>`

Creates a new observable. The observable exposes its emit function through the
revealing constructor pattern. Use the emit function to notify all subscribers
of new events.

The emit function returns a promise that resolves when all subscribers and
their dependents finish processing the event.


### Observable<T>

```typescript
interface Observable<T> {
    <U>(listener: (t: T) => U): LinkedObservable<U>;
    <U>(listener: (t: T) => Promise<U>): LinkedObservable<U>;
    next(predicate?: (t: T) => boolean): Promise<T>;
    remove<U>(o: Observable<U>): void;
}
```

#### observable(listener):LinkedObservable

Creates a listener for the observable. A listener is a mapping function that returns
either a new value or a promise.

Returns a linked observable  that emits whenever the returned  promises or values
resolve.

#### observable.next(predicate?):Promise

Waits for the next event that satisfies the specified predicate. Returns a
promise for the value contained in that event.

The predicate is optional.

#### observable.remove(linkedObservable)

Removes a listener (linked observable).

### linkedObservable.unlink()

Same as `parentObservable.remove(linkedObservable)`

# Building

    npm install
    npm run build

# License

MIT

