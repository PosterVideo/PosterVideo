'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './explore.routes';

export class ExploreComponent {
  constructor(Auth, PosterVideo, $state) {
    'ngInject';
    this.message = 'Hello';
    this.loading = false;

    this.$state = $state;
    this.Auth = Auth;
    this.PV = PosterVideo;
  }

  $onInit(){

    this.loading = true;

    this.PV.http.list()
      .then(function(response){

        this.ourPV = response.data;

        this.ourPV.forEach(function(item, key){

          if (item.json !== ''){
            item.ram = JSON.parse(item.json);
          }
        
        });
        
        this.loading = false;

      }.bind(this));
  }

  makeNewOne(aPV){
    var uid = this.Auth.getCurrentUserSync()._id;

    if (this.loading) { return; }
    this.loading = true;


    return this.PV.http.create({
      _user: uid,
      title: (aPV && aPV.title) ? ('Remix: ' + aPV.title) : 'Remix Poster Video...',
      info: (aPV && aPV.info) ? aPV.info : '',
      json: (aPV && aPV.json) ? aPV.json : '',
      active: true
    }).then(function(response){

      this.loading = false;
      this.$state.go('posterEdit', { id: response.data._id });

    }.bind(this)).catch(function(){
      this.loading = false;
    }.bind(this));

  }

}

export default angular.module('pvApp.explore', [uiRouter])
  .config(routes)
  .component('explore', {
    template: require('./explore.html'),
    controller: ExploreComponent,
    controllerAs: '$ctrl'
  })
  .name;
