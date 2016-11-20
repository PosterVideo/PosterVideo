'use strict';

import * as auth from '../../auth/auth.service';
import Postervideo from './postervideo.model';


var express = require('express');
var controller = require('./postervideo.controller');


var router = express.Router();


router.get('/search', controller.search);
router.get('/my', auth.isAuthenticated(), controller.my);


router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.belongsToMe(Postervideo), controller.upsert);
router.patch('/:id', auth.belongsToMe(Postervideo), controller.patch);
router.delete('/:id', auth.belongsToMe(Postervideo), controller.destroy);

module.exports = router;
