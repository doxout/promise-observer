var observer = require('../lib');
var Promise = require('bluebird');
var t = require('blue-tape');

t.test('basic', function(t) {
    var start, values = [];
    var onNumber = observer.create(function(emit) { start = emit; })
    var onIncrementedNumber = onNumber(function(val) {
        return Promise.delay(1).thenReturn(val + 1);
    })
    var o3 = onNumber(function(val) {
        return onIncrementedNumber.next().thenReturn(val + 2);
    });
    var push = values.push.bind(values);
    onIncrementedNumber(push);
    o3(push);
    return start(0).then(function() {
        t.deepEqual(values, [1,2], 'values should be there and in correct order');
    });
});
function any() { return true; }

t.test('two nexts', function twoNexts(t) {
    var start;
    function derived(val) {
        console.log("Derived started")
        return Promise.delay(1).thenReturn(val + 1).tap(function() {
            console.log("Derived complete");
        });
    }
    function plus1(val) { return val + 1; }
    var onNumber = observer.create(function(emit) { start = emit; }, {emitTimeout: 25})
    var derived = onNumber(derived);
    var third = onNumber(function waiter() {
        console.log("Third started");
        return derived.next(any).then(function() {
            console.log("Third got derived");
        });
    });
    var fourth = onNumber(function waiter2() {
        console.log("Fourth started");
        return derived.next(any).then(function() {
            console.log("Fourth got derived");
        });
    });
    return Promise.join(start(0), third.next(), fourth.next());
});

t.test('timeouts', function timeouts(t) {
    var start;
    var onNumber = observer.create(function(emit) { start = emit; }, {emitTimeout: 20})
    function slow() {
        onNumber(function slow(val) { return Promise.delay(100); });
    }

    function fast() {
        onNumber(function fast(val) { return Promise.delay(1); });
    }
    fast(onNumber);
    slow(onNumber);
    return start(0).catch(function(e) {
        t.ok(e.timeoutListener.indexOf('slow') >= 0, 'should point to slow fn')
    });
});

t.test('cycles', function(t) {
    var start;
    var onNumber = observer.create(function(emit) { start = emit; }, {emitTimeout: 20})
    var on2 = onNumber(function(val) {
        return Promise.delay(1).thenReturn(val + 1);
    });
    var on3 = on2(function(val) {
        return Promise.delay(1).then(function() {
            return start(val+1);
        });
    });
    return start(0).catch(function(e) {
        t.ok(e, "should have timeout error");
        setTimeout(process.exit, 10);
    });
})
