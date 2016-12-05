'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './PosterEdit.routes';

import NProgress from 'nprogress';

export class PosterEditComponent {
  constructor(PosterVideo, Images, $stateParams, socket, $scope) {
    'ngInject';

    
    this.PV = PosterVideo;
    this.Images = Images;
    
    this.$stateParams = $stateParams;

    this.message = 'Hello';
    this.socket = socket.socket;

    this.$scope = $scope;


    //sync the active scene.
    this.sceneDragCtrl = {
        // accept: function (sourceItemHandleScope, destSortableScope) {return true;},//override to determine drag is allowed or not. default is true.
        // itemMoved: function (event) {//Do what you want
        // },
        orderChanged: function(event) {//Do what you want
          this.PV.scene.syncActive(this.myPV.ram.scene);
        }.bind(this),
        // containment: '#board',//optional param.
        // clone: true, //optional param for clone feature.
        // allowDuplicates: false //optional param allows duplicates to be dropped.
    };

    this.videoUrl = '';
    this.song = {};
    this.canvas = {};
    this.progress = 0;
    this.activeTab = 0;

    // this.socket.on('sample', function(data){
    //   console.log(data);
    // });

    this.fonts = [
        {
          "option": "Serif",
          "value": "serif"
        },
        {
          "option": "Arial",
          "value": "arial"
        },
        {
          "option": "San Serif",
          "value": "sans-serif"
        },
        {
          "option": " Lobster ",
          "value": "'Lobster', cursive"
        },
        {
          "option": " Lobster Two ",
          "value": "'Lobster Two', cursive"
        },
        {
          "option": " Text Me One ",
          "value": "'Text Me One', sans-serif"
        },
        {
          "option": " Josefin Sans ",
          "value": "'Josefin Sans', sans-serif"
        },
        {
          "option": " Cardo ",
          "value": "'Cardo', serif"
        },
        {
          "option": " Shadows Into Light Two ",
          "value": "'Shadows Into Light Two', cursive"
        },
        {
          "option": " Quick Sand ",
          "value": "'Quicksand', sans-serif"
        },
        {
          "option": " Sacramento ",
          "value": "'Sacramento', cursive"
        },
        {
          "option": " Great Vibes ",
          "value": "'Great Vibes', cursive"
        },
        {
          "option": " Sue Ellen Francisco ",
          "value": "'Sue Ellen Francisco', cursive"
        },
        {
          "option": " Bilbo Swash Caps ",
          "value": "'Bilbo Swash Caps', cursive"
        },
        {
          "option": " Grand Hotel ",
          "value": "'Grand Hotel', cursive"
        },
        {
          "option": " La Belle Aurore ",
          "value": "'La Belle Aurore', cursive"
        },
        {
          "option": " Play Ball ",
          "value": "'Playball', cursive"
        },
        {
          "option": " Playfair Display ",
          "value": "'Playfair Display', serif"
        },
        {
          "option": " League Script ",
          "value": "'League Script', cursive"
        },
        {
          "option": " Reem Kufi ",
          "value": "'Reem Kufi', sans-serif"
        },
        {
          "option": " Josefin Slab ",
          "value": "'Josefin Slab', serif"
        },
        {
          "option": " Architects Daughter ",
          "value": "'Architects Daughter', cursive"
        },
        {
          "option": " Tangerine ",
          "value": "'Tangerine', cursive"
        },
        {
          "option": " Nixie One ",
          "value": "'Nixie One', cursive"
        },
        {
          "option": " Allura ",
          "value": "'Allura', cursive"
        },
        {
          "option": " Crafty Girls ",
          "value": "'Crafty Girls', cursive"
        },
        {
          "option": " Bungee Shade ",
          "value": "'Bungee Shade', cursive"
        },
        {
          "option": " Cinzel ",
          "value": "'Cinzel', serif"
        },
        {
          "option": " Cinzel Decorative ",
          "value": "'Cinzel Decorative', cursive"
        }
      ];

  }

  getCanvasData(){
    var canvas = this.canvas.canvas;
    var dataURL = canvas.toDataURL('image/png', 100);
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
  }

  generateID(){
    return Math.random() + '-' + Math.random();
  }

  // startTask(id){
  //   if (this.song.song){
  //     this.socket.emit('pv:task', {
  //       tid: id,
  //       filename: this.song.filename,
  //       song: this.song.song
  //     });
  //   }else{
  //     this.socket.emit('pv:task', {
  //       tid: id
  //     });
  //   }
  // }

 

  generateSlides(){
    var arr = [];
    this.myPV.ram.scene.arr.forEach(function(scene, sceneKey){
      
      scene.elem.arr.forEach(function(elem, elemKey){

        arr.push({
          scene: sceneKey,
          elem: elemKey
        });

      });

    });

    return arr;

  }

  requestVideo(){
    var slides = this.generateSlides();
    this.started = true;

    console.table(slides);

    var id = this.generateID();
    var socket = this.socket;
    var cursor = 0;
    this.progress = 0;
    NProgress.start();

    if (this.song.song){
      this.socket.emit('pv:task', {
        tid: id,
        filename: this.song.filename,
        song: this.song.song
      });
    }else{
      this.socket.emit('pv:task', {
        tid: id
      });
    }

    this.myPV.ram.scene.nowIndex = 0;
    this.canvas.updateStep(0);

    socket.on('pv:receive:'+ id, function(){
      console.log('pv:receive');

      var nowSlide = slides[cursor];

      if (!nowSlide) { return; }

      this.myPV.ram.scene.nowIndex = nowSlide.scene;
      this.canvas.updateStep(nowSlide.elem);
      // this.canvas.render();
      this.progress = (cursor / (slides.length - 1)) * 0.75;
      NProgress.set(this.progress);

      setTimeout(function(){
        socket.emit('pv:each:'+ id, {
          base64: this.getCanvasData(),
          close: (cursor === (slides.length - 1) ),
        });
        
        cursor++;
        
      }.bind(this),500);

    }.bind(this));

    socket.on('pv:progress:'+ id, function(data){
      console.log('pv:progress', data);
      // NProgress.set(data.progress);
    });

    socket.on('pv:done:'+ id, function(data){
      
      var blob = new Blob([data.buffer], {type: 'video/mp4'});
      var downloadUrl = window.URL.createObjectURL(blob);
      
      this.videoUrl = downloadUrl;
      this.progress = 1;

      console.log(downloadUrl);

      NProgress.done();
      this.started = false;

      setTimeout(function(){
        NProgress.done();
      },1000);
    }.bind(this));

  }

  // test(){
  //   // console.log(this.getCanvasData());

  //   var id = this.generateID(); 

  //   if (this.song.song){
  //     this.socket.emit('pv:task', {
  //       tid: id,
  //       filename: this.song.filename,
  //       song: this.song.song
  //     });
  //   }else{
  //     this.socket.emit('pv:task', {
  //       tid: id
  //     });
  //   }
    
  //   var socket = this.socket;


  //   var cursor = 0;
  //   this.progress = 0;

  //   var getNowSceneElemLength = function(){
  //     return this.myPV.ram.scene.arr[this.myPV.ram.scene.nowIndex].elem.arr.length;
  //   }.bind(this);

  //   socket.on('pv:receive:'+ id, function(){
  //     console.log('pv:receive');



  //     this.canvas.updateStep(cursor);
  //     this.canvas.render();
  //     this.progress = cursor / (getNowSceneElemLength() ) * 0.75;

  //     setTimeout(function(){
  //       socket.emit('pv:each:'+ id, {
  //         base64: this.getCanvasData(),
  //         close: (cursor === (getNowSceneElemLength() ) ),
  //       });
      
  //       cursor++;
      
  //     }.bind(this),1000);

  //     NProgress.inc(0.05);
  //   }.bind(this));

  //   NProgress.start();
  //   socket.on('pv:progress:'+ id, function(data){
  //     console.log(data);
  //     NProgress.set(data.progress);
  //   });

  //   socket.on('pv:done:'+ id, function(data){
      
  //     var blob = new Blob([data.buffer], {type: 'video/mp4'});
  //     var downloadUrl = window.URL.createObjectURL(blob);
      
  //     this.videoUrl = downloadUrl;

  //     this.progress = 1;

  //     console.log(downloadUrl);

  //         // $('.newBlobVideo')[0].src = downloadUrl;
  //         // $('.newBlobVideo').show();

  //     NProgress.done();

  //     setTimeout(function(){
  //       NProgress.done();
  //     },1000);
  //   }.bind(this));

  // }

  getDemoRam(){
    return JSON.parse("{\"scene\":{\"nowIndex\":0,\"arr\":[{\"active\":true,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"hsla(0, 0%, 100%, 0.75)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/highspeed-photography-1004250_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":131,\"yPos\":-5,\"width\":4608,\"height\":2592,\"scale\":20,\"refresh\":0.5005753554234347},\"elem\":{\"nowIndex\":3,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"Lok Lok's\",\"active\":false,\"fontStyle\":\"'Bungee Shade', cursive\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":537,\"yPos\":291,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"Life Tips.\",\"fontStyle\":\"'Cinzel Decorative', cursive\",\"fontSize\":\"177\",\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":548,\"yPos\":582,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false},{\"type\":\"text\",\"text\":\"PosterVideo.com\",\"fontStyle\":\"'Playfair Display', serif\",\"fontSize\":\"76\",\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":556,\"yPos\":840,\"rDeg\":0,\"rCenter\":\"center\",\"active\":true},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}},{\"active\":false,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"rgba(255,255,255,0.5)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/rainbow-436171_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":\"0\",\"yPos\":-4,\"width\":1920,\"height\":1280,\"scale\":20,\"refresh\":0.48894171741028836},\"elem\":{\"nowIndex\":3,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"It's important to\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":508,\"yPos\":364,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"have some funz.\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":56,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":521,\"yPos\":548,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}},{\"active\":false,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"rgba(255,255,255,0.5)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/rainbow-436171_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":0,\"yPos\":0,\"width\":1920,\"height\":1280,\"scale\":20,\"refresh\":0.7444488062748063},\"elem\":{\"nowIndex\":2,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"It's fun to\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":508,\"yPos\":364,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"dance.\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":56,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":521,\"yPos\":548,\"rDeg\":0,\"rCenter\":\"center\",\"active\":true},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}},{\"active\":false,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"rgba(255,255,255,0.5)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/rainbow-436171_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":0,\"yPos\":0,\"width\":1920,\"height\":1280,\"scale\":20,\"refresh\":0.04388921284227676},\"elem\":{\"nowIndex\":2,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"It's happy to\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":508,\"yPos\":364,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"give a hug.\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":56,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":521,\"yPos\":548,\"rDeg\":0,\"rCenter\":\"center\",\"active\":true},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}},{\"active\":false,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"rgba(255,255,255,0.5)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/rainbow-436171_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":0,\"yPos\":0,\"width\":1920,\"height\":1280,\"scale\":20,\"refresh\":0.03074245597784353},\"elem\":{\"nowIndex\":2,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"It's my joy to\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":508,\"yPos\":364,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"wish u have a good life.\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":56,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":521,\"yPos\":548,\"rDeg\":0,\"rCenter\":\"center\",\"active\":true},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}},{\"active\":false,\"border\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"lineWidth\":1,\"color\":\"rgba(0,0,0,0.5)\"},\"overcast\":{\"yes\":true,\"xPos\":40,\"yPos\":40,\"width\":1000,\"height\":1000,\"color\":\"rgba(255,255,255,0.5)\"},\"logo\":{\"yes\":true,\"xPos\":100,\"yPos\":100,\"width\":200,\"height\":200,\"scale\":20},\"bg\":{\"url\":\"https://s3-ap-northeast-1.amazonaws.com/postervideo-assets/images/sample-bg/cloud-600224_1920.jpg\",\"img\":{},\"yes\":true,\"xPos\":118,\"yPos\":2,\"width\":1920,\"height\":1279,\"scale\":20,\"refresh\":0.1442038842773421},\"elem\":{\"nowIndex\":1,\"arr\":[{\"type\":\"text\",\"text\":\"\",\"active\":false,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":522,\"yPos\":236,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"Thanks for watching.\",\"active\":true,\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":109,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":542,\"yPos\":393,\"rDeg\":0,\"rCenter\":\"center\"},{\"type\":\"text\",\"text\":\"much love,\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":56,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":521,\"yPos\":548,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false},{\"type\":\"text\",\"text\":\"Lok Lok\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":519,\"yPos\":689,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false},{\"type\":\"text\",\"text\":\"\",\"fontStyle\":\"'Josefin Sans', sans-serif\",\"fontSize\":87,\"fontColor\":\"rgba(0,0,0,1)\",\"xPos\":523,\"yPos\":941,\"rDeg\":0,\"rCenter\":\"center\",\"active\":false}]}}]}}");
  }

  getSampleRam(){

    return {
          scene: {
            nowIndex: 0,
            arr: [
              
              {
                active: true,

                border: {
                  yes: true,
                  xPos: 40,
                  yPos: 40,
                  width: 1000,
                  height: 1000,
                  lineWidth: 1,
                  color: 'rgba(0,0,0,0.5)'
                },
                overcast: {
                  yes: true,
                  xPos: 40,
                  yPos: 40,
                  width: 1000,
                  height: 1000,
                  color: 'rgba(255,255,255,0.5)'
                },
                logo: {
                  yes: true,
                  xPos: 100,
                  yPos: 100,
                  width: 200,
                  height: 200,
                  scale: 20
                },
                bg:{
                  xPos: 0,
                  yPos: 0
                },
                elem: {
                  nowIndex: 0,
                  arr: [
                    {
                      type: 'text',
                      text: 'Dance',
                      active: true,
                      fontStyle: '\'Josefin Sans\', sans-serif',
                      fontSize: 109,
                      fontColor: 'rgba(0,0,0,1)',
                      xPos: 176,
                      yPos: 150,
                      rDeg: 0,
                      rCenter: 'center'
                    },
                    {
                      type: 'text',
                      text: 'Dance Dance',
                      fontStyle: '\'Josefin Sans\', sans-serif',
                      fontSize: 56,
                      fontColor: 'rgba(0,0,0,1)',
                      xPos: 364,
                      yPos: 283,
                      rDeg: 0,
                      rCenter: 'center'
                    },
                    {
                      type: 'text',
                      text: 'Dance Dance dance',
                      fontStyle: '\'Josefin Sans\', sans-serif',
                      fontSize: 87,
                      fontColor: 'rgba(0,0,0,1)',
                      xPos: 674,
                      yPos: 406,
                      rDeg: 0,
                      rCenter: 'center'
                    },
                    
                    
                  ]
                },
              }
              
            ]
          },
        };
  }

  getCheckerJSON(){
    var newPV = angular.copy(this.myPV);
    delete newPV.json;

    return JSON.stringify(newPV);
  }

  ram2json(){
    return JSON.stringify(angular.copy(this.myPV.ram));
  }

  initUpdater(){
    var cache = this.getCheckerJSON();
    
    window.setInterval(function(){
      var newCache = this.getCheckerJSON();
      if (cache !== newCache && !this.started){
        console.log('isDirty');

        this.PV.http.put({
          _id: this.myPV._id,
          info: this.myPV.info,
          title: this.myPV.title,
          json: this.ram2json()
        });

        cache = newCache;
      }

    }.bind(this), 3000);
  }

  

  applyImage(image, target, key){

    if (!key) { return; }

    target[key] = {
      url: image.fileURL,
      img: false,
      yes: true,
      xPos: 0,
      yPos: 0,
      width: 0,
      height: 0,
      scale: 20
    };
    
    var newImage = new Image();
    newImage.setAttribute('crossOrigin', 'anonymous');
    NProgress.start();
    newImage.onprogress = function(e){
      if (e.lengthComputable){
        NProgress.set(e.loaded / e.total);
      }
    };
    newImage.onload = function(){
      target[key].img = newImage;
      target[key].width = newImage.width;
      target[key].height = newImage.height;
      NProgress.done();
    };

    newImage.src = image.fileURL;

    
  }

  refreshImage(input){
    
    this.Images.http.my({
      query: (input === '') ? ' ' : input 
    }).then(function(response){
      this.images = response.data;
    }.bind(this));

  }

  $onInit(){

    this.refreshImage('');

    this.$scope.$watch('$ctrl.activeTab', function(newVal){
      if (parseInt(newVal, 10) === 2 || parseInt(newVal, 10) === 1){
        this.refreshImage('');
      }
    }.bind(this));

    this.PV.http.show(this.$stateParams.id)
      .then(function(response){

        this.myPV = response.data;

        this.initUpdater();

        this.myPV.ram = (this.myPV.json !== '') ? JSON.parse(this.myPV.json) : this.getDemoRam();

        this.PV.ram.image2ram(this.myPV.ram);

        console.log(this.getDemoRam());

      }.bind(this));
  }

}

export default angular.module('pvApp.posterEdit', [uiRouter])
  .config(routes)
  .component('posterEdit', {
    template: require('./PosterEdit.html'),
    controller: PosterEditComponent,
    controllerAs: '$ctrl'
  })
  .filter('propsFilter', function() {
    return function(items, props) {
      var out = [];

      if (angular.isArray(items)) {
        var keys = Object.keys(props);



        items.forEach(function(item) {
          var itemMatches = false;

          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if ((item[prop] || '').toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  })
  .directive('contenteditable', function() {
    return {
      restrict: "A",
      require: "ngModel",
      link: function(scope, element, attrs, ngModel) {

        function read() {
          ngModel.$setViewValue(element.html());
        }

        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };

        element.bind("blur keyup change", function() {
          scope.$apply(read);
        });
      }
    };
  })
  .name;
