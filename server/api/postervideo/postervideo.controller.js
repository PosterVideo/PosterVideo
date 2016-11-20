/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/postervideos              ->  index
 * POST    /api/postervideos              ->  create
 * GET     /api/postervideos/:id          ->  show
 * PUT     /api/postervideos/:id          ->  upsert
 * PATCH   /api/postervideos/:id          ->  patch
 * DELETE  /api/postervideos/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Postervideo from './postervideo.model';

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




export function search(req, res) {
  var myQ = Postervideo.find({
    $text: { $search: req.body.query }
  });

  if(req.body.populate === true){
    myQ = myQ
            .populate('arha')
            .populate({
              path: '_user',
              select: 'name _id',
            })
  }

  return myQ.limit(1000)
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}





export function my(req, res) {
  return Postervideo.find({
    _user: req.user._id
  })
    .populate('arha')
    .populate({
      path: '_user',
      select: 'name _id',
    })
    .sort('-createdAt')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}





// Gets a list of Postervideos
export function index(req, res) {
  // return Postervideo.find().exec()
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));

  return Postervideo.find({})
    .populate('arha')
    .populate({
      path: '_user',
      select: 'name _id',
    })
    .sort('-createdAt')
    .limit(100)
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Postervideo from the DB
export function show(req, res) {
  return Postervideo.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Postervideo in the DB
export function create(req, res) {
  return Postervideo.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Postervideo in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Postervideo.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Postervideo in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Postervideo.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Postervideo from the DB
export function destroy(req, res) {
  return Postervideo.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
