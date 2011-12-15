var util = require('util'),
    events = require('events');

function ProgressEvent() {
    if(false === (this instanceof ProgressEvent)) {
        return new ProgressEvent();
    }

    events.EventEmitter.call(this);
}
util.inherits(ProgressEvent, events.EventEmitter);

ProgressEvent.prototype.download = function(percentage) {
    var self = this;  
    self.emit('progress', percentage);    
}

exports.ProgressEvent = ProgressEvent;