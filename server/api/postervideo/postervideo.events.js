/**
 * Postervideo model events
 */

'use strict';

import {EventEmitter} from 'events';
import Postervideo from './postervideo.model';
var PostervideoEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PostervideoEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Postervideo.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PostervideoEvents.emit(event + ':' + doc._id, doc);
    PostervideoEvents.emit(event, doc);
  };
}

export default PostervideoEvents;
