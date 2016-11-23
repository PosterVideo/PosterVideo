'use strict';

import * as auth from '../../auth/auth.service';
import Image from './image.model';

var express = require('express');
var controller = require('./image.controller');


var router = express.Router();

// router.get('/', controller.index);
// router.get('/:id', controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.upsert);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);


router.post('/signS3', auth.isAuthenticated(), controller.signS3);

router.get('/my', auth.isAuthenticated(), controller.my);

// router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.belongsToMe(Image), controller.upsert);
router.patch('/:id', auth.belongsToMe(Image), controller.patch);
router.delete('/:id', auth.belongsToMe(Image), controller.destroy);



module.exports = router;
