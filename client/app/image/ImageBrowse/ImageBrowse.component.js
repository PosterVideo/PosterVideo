'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './ImageBrowse.routes';

export class ImageBrowseComponent {

  constructor(Image, Auth, $scope) {
    'ngInject';
    this.message = 'Hello';
    this.Image = Image;
    this.Auth = Auth;

    this.newFiles = [];

    
  }
  uploadRemain(){
    this.Image.upload.scan(this.newFiles);
  }

  $onInit(){

    this.Image.http.my(this.Auth.getCurrentUserSync()._id)
      .then(function(response){

        this.myImgs = response.data;

      }.bind(this));

  }

}

export default angular.module('pvApp.imageBrowse', [uiRouter])
  .config(routes)
  .component('imageBrowse', {
    template: require('./ImageBrowse.html'),
    controller: ImageBrowseComponent,
    controllerAs: '$ctrl'
  })
  .name;
