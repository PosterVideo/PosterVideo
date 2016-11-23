'use strict';

import mongoose, {Schema} from 'mongoose';

var ImageSchema = new mongoose.Schema({
  stage: String,
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  s3url: String,
  active: {
  	type: Boolean,
  	default: false
  }

});

export default mongoose.model('Image', ImageSchema);
