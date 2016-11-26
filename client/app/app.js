'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import 'ng-sortable/dist/ng-sortable.min.js';
import 'ng-sortable/dist/ng-sortable.min.css';
// import 'ng-sortable/dist/ng-sortable.style.min.css';


import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
// import ngValidationMatch from 'angular-validation-match';

import uiSelect from 'ui-select';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';


import posterEdit from './postervideo/PosterEdit/PosterEdit.component';
import posterService from './postervideo/PosterService/PosterService.service';
import posterCanvas from './postervideo/PosterCanvas/PosterCanvas.directive';

import imageBrowse from './image/ImageBrowse/ImageBrowse.component';
import imageService from './image/ImageService/ImageService.service';
import imageUploader from './image/ImageUploader/ImageUploader.directive';


// import posterExplore from './postervideo/explore/explore.component';


import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.scss';


angular.module('pvApp', [
    uiSelect, 
    
    ngCookies, ngResource, ngSanitize, 'btford.socket-io', uiRouter,
    
    'as.sortable',
    
    imageBrowse,
    imageService,
    imageUploader,

    posterService,
    posterEdit,
    posterCanvas,
    
    // posterExplore,
    
    uiBootstrap, _Auth, account, admin, navbar, footer, main, constants, socket, util

  ])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['pvApp'], {
      strictDi: true
    });
  });
