import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  
  constructor(Auth, PosterVideo, $state){
    'ngInject';

    this.Auth = Auth;
    this.PV = PosterVideo;
    this.loading = true;
    this.$state = $state;

  }

  $onInit(){
    
    this.Auth.isLoggedIn()
      .then(function(role){

        if (!!!role){
          this.loading = false;
          return ;
        }

        this.loading = true;

        this.PV.http.my().then(function(response){
          this.loading = false;
          
          this.myPVs = response.data;

          this.myPVs.forEach(function(item, key){

            if (item.json !== ''){
              item.ram = JSON.parse(item.json);
              this.PV.ram.image2ram(item.ram);
            }
          
          }.bind(this));

        }.bind(this)).catch(function(){
          this.loading = false;
        }.bind(this));

      }.bind(this));

  }

  remove(pv){
    
    if (!window.confirm('Delete?')){ return; }

    this.loading = true;

    return this.PV.http.delete(pv._id).then(function(response){
      this.loading = false;
        
      this.myPVs.splice( this.myPVs.indexOf(pv), 1 );

    }.bind(this)).catch(function(){
      this.loading = false;
    }.bind(this));

  }

  goEdit(pv){
    this.$state.go('posterEdit', { id: pv._id })
  }

  makeNewOne(myPV){
    var uid = this.Auth.getCurrentUserSync()._id;

    if (this.loading) { return; }
    this.loading = true;


    return this.PV.http.create({
      _user: uid,
      title: 'New Poster Video...',
      info: '',
      json: (myPV && myPV.json) ? myPV.json : '',
      active: true

    }).then(function(response){

      this.loading = false;
      this.$state.go('posterEdit', { id: response.data._id });

    }.bind(this)).catch(function(){
      this.loading = false;
    }.bind(this));

  }


  // awesomeThings = [];
  // newThing = '';

  // constructor($http, $scope, socket, Auth) {
  //   'ngInject';

  //   this.$http = $http;
  //   this.socket = socket;

  //   this.Auth = Auth;

  //   $scope.$on('$destroy', function() {
  //     socket.unsyncUpdates('thing');
  //   });
  // }

  // $onInit() {
  //   this.$http.get('/api/things')
  //     .then(response => {
  //       this.awesomeThings = response.data;
  //       this.socket.syncUpdates('thing', this.awesomeThings);
  //     });
  // }

  // addThing() {
  //   if(this.newThing) {
  //     this.$http.post('/api/things', {
  //       name: this.newThing
  //     });
  //     this.newThing = '';
  //   }
  // }

  // deleteThing(thing) {
  //   this.$http.delete(`/api/things/${thing._id}`);
  // }
}

export default angular.module('pvApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
