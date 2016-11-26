'use strict';

import mongoose, {Schema} from 'mongoose';

var ImageSchema = new mongoose.Schema({
  stage: String,
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  
  isLogo: {
    type: Boolean,
    default: false
  },

  fileKey: String,
  fileURL: String,
  
  thumbKey: String,
  thumbURL: String,

  width: Number,
  height: Number,
  active: {
  	type: Boolean,
  	default: false
  }

},{
  timestamps: true
});

export default mongoose.model('Image', ImageSchema);
