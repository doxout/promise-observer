# promise-observer

An observer / event emitter implementation with promise support

# Example

Given a blog post creator:

```
function BlogPostCreator {
    onBlogPostCreated = new PromiseObserver(emit => this.emit = emit);
}

BlogPostCreator.prototype.create = function(blogPost) {
    actuallyCreateBlogpost()
        .then(post => this.emit(post))
        // wait for all attached events to complete before commiting.
        .then(commitTransaction);
}
```

an AutomatedCategorizer can attach to its events


```
onPostCategorized = blogPostCreator.onBlogPostCreated(post =>
  autoCategorizePost(post).then(saveCategory).thenReturn(post));
```

a SearchIndexer can add search terms to the index for that post

onPostIndexed = blogPostCreator.onBlogPostCreated(post =>
  indexSearchWords(post).then(saveIndex).thenReturn(post));


Then, the email notification system can wait for the post to be
categorized and indexed before sending a notification to all subscribers:

```
onEmailNotificationSent = blogPostCreator.onBlogPostCreated(post => {
  var categorized = onPostCategorized.next(categorizedPost => categorizedPost.id == post.id);
  var indexed = onPostIndexed.next(indexedPost => indexedPost.id == post.id);
  return Promise.join(categorized, indexed, _ => sendEmailNotification(post))
});
```
# API

`new PromiseObserver<T>(emit: (val:T) => Promise<void>)`


```typescript
interface PromiseObserver<T> {
    subscribe<U>(f: (T) => Promise<U>):PromiseObserver<U>
    next(f?: (T) => boolean):Promise<T>
}
```

# License

MIT

