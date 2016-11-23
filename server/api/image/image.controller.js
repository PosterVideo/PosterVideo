/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/images              ->  index
 * POST    /api/images              ->  create
 * GET     /api/images/:id          ->  show
 * PUT     /api/images/:id          ->  upsert
 * PATCH   /api/images/:id          ->  patch
 * DELETE  /api/images/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Image from './image.model';

const aws = require('aws-sdk');


import config from '../../config/environment';


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}


export function signS3(req, res){

  var S3_BUCKET = process.env.S3_BUCKET;

  const s3 = new aws.S3();
  const fileName = req.body.fileName;//['file-name'];
  const fileType = req.body.fileType;//['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };

    console.log(returnData);

    res.status(200).json(returnData);

    // res.write(JSON.stringify(returnData));
    // res.end();
  });

}

export function my(req, res) {
  return Image.find({
    _user: req.user._id
  })
    .populate({
      path: '_user',
      select: 'name _id',
    })
    .sort('-createdAt')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}














// Gets a list of Images
export function index(req, res) {
  return Image.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Image from the DB
export function show(req, res) {
  return Image.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Image in the DB
export function create(req, res) {
  return Image.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Image in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Image.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Image in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Image.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Image from the DB
export function destroy(req, res) {
  return Image.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
