'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './ImageBrowse.routes';

export class ImageBrowseComponent {

  constructor(Images, Auth, $scope, $q) {
    'ngInject';
    this.message = 'Hello';
    this.Image = Images;
    this.Auth = Auth;
    this.$q = $q;

    this.newFiles = [];
    
  }

  uploadRemain(){
    var arr = this.newFiles;
    var work = [];
    angular.forEach(arr, function(item, key){
      if (item.stage === 'selected'){
        setTimeout(function(){
          work.push(this.Image.upload.begin(item));

          if (key === arr.length - 1){
            this.$q.all(work)
              .then(function(){
                this.newFiles = [];
                this.$onInit();
              }.bind(this));
          }

        }.bind(this), 500 * key);
      }
    }.bind(this));
    
  }

  update(item){
    this.Image.http.update(item);
  }

  cancelUpload(item){
    this.newFiles.splice( this.newFiles.indexOf(item), 1 );
  }

  remove(item){
    this.Image.http.remove(item);
    this.myImgs.splice( this.myImgs.indexOf(item), 1 );
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
