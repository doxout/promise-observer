var observer = require('../lib');
var Promise = require('bluebird');
var t = require('blue-tape');

t.test('basic', function(t) {
    var start, values = [];
    var onNumber = observer(function(emit) { start = emit; })
    var onIncrementedNumber = onNumber(function(val) {
        return Promise.delay(1).thenReturn(val + 1);
    })
    var o3 = onNumber(function(val) {
        return onIncrementedNumber.next().thenReturn(val + 2);
    })
    onIncrementedNumber(function(val) {
        values.push(val);
    });
    o3(function(val) {
        values.push(val);
    });
    return start(0).then(function() {
        t.deepEqual(values, [1,2], 'values should be there and in correct order');
    });
});

