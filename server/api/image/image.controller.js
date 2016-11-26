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
          return null;
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


function handleS3DelteFile(){
  return function(entity){
    return new Promise(function(resolve, reject){

      if (entity){
        var S3_BUCKET = process.env.S3_BUCKET;
        var s3 = new aws.S3();
        
        var ans = [false, false];

        var fileParams = {
          Bucket: S3_BUCKET,
          Key: entity.fileKey
        };

        s3.deleteObject(fileParams, function (err, data) {
          if (data) {
            console.log('S3 File deleted successfully');
            
            ans[0] = true;

            if (ans[0] && ans[1]){
              resolve(entity);
            }

          } else {
            console.log(err);
            reject(err);
          }
        });

        var tumbParams = {
          Bucket: S3_BUCKET,
          Key: entity.thumbKey
        };

        s3.deleteObject(tumbParams, function (err, data) {
          if (data) {
            console.log('S3 Thumb deleted successfully');
            
            ans[1] = true;

            if (ans[0] && ans[1]){
              resolve(entity);
            }
          
          } else {
            console.log(err);
            reject(err);
          }
        });

      }else{
        console.error('cannot find mongo file');
        reject('no entity');
      }

    });
  }
}


export function signS3(req, res){

  var S3_BUCKET = process.env.S3_BUCKET;

  const s3File = new aws.S3();
  const s3Thumb = new aws.S3();
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;

  const thumbName = req.body.thumbName;
  const thumbType = req.body.thumbType;

  const fileS3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };
  const thumbS3Params = {
    Bucket: S3_BUCKET,
    Key: thumbName,
    Expires: 60,
    ContentType: thumbType,
    ACL: 'public-read'
  };

  var returnArr = [null, null];

  s3File.getSignedUrl('putObject', fileS3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }

    returnArr[0] = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };

    if (returnArr[0] !== null && returnArr[1] !== null){
      res.status(200).json(returnArr);
    }

    
    // res.write(JSON.stringify(returnData));
    // res.end();
  });

  s3Thumb.getSignedUrl('putObject', thumbS3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    
    returnArr[1] = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${thumbName}`
    };

    if (returnArr[0] !== null && returnArr[1] !== null){
      res.status(200).json(returnArr);
    }
    
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
    .then(handleS3DelteFile())
    .then(removeEntity(res))
    .catch(handleError(res));
}
