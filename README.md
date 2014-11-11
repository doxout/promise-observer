# promise-observer

An observer / event emitter implementation with promise support

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


### po.create(emit):Observer

`po.create(emit: (val:T) => Promise<void>):Observer<T>`

Creates a new observer. The observer exposes its emit function through the
revealing constructor pattern. Use the emit function to notify all subscribers
of new events.

The emit function returns a promise that resolves when all subscribers and
their dependents finish processing the event.


### Observer<T>

```typescript
interface Observer<T> {
    <U>(listener: (t: T) => U): LinkedObserver<U>;
    <U>(listener: (t: T) => Promise<U>): LinkedObserver<U>;
    next(predicate?: (t: T) => boolean): Promise<T>;
    remove<U>(o: Observer<U>): void;
}
```

#### observer(listener):LinkedObserver

Creates a listener for the observer. A listener is a mapping function that returns
either a new value or a promise.

Returns a linked observer that emits whenever the returned promises or values
resolve.

#### observer.next(predicate?):Promise

Waits for the next event that satisfies the specified predicate. Returns a
promise for the value contained in that event.

The predicate is optional.

#### observer.remove(linkedObserver)

Removes a listener (linked observer).

### linkedObserver.unlink()

Same as `parentObserver.remove(linkedObserver)`


# License

MIT

