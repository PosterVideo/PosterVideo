'use strict';

import mongoose, {Schema} from 'mongoose';

var PostervideoSchema = new mongoose.Schema({
  
  _user: { type: Schema.Types.ObjectId, ref: 'User' },

  title: String,
  info: String,

  arha: [{ type: Schema.Types.ObjectId, ref: 'Postervideo' },],

  json: String,

  active: Boolean,
},{
	timestamps: true
});

PostervideoSchema.index({'title': 'text', 'info': 'text'});

export default mongoose.model('Postervideo', PostervideoSchema);
