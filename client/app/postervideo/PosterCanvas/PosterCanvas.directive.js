'use strict';
const angular = require('angular');

const Hammer = require('hammerjs');


import 'angularjs-color-picker/dist/angularjs-color-picker.min.css';
import 'angularjs-color-picker/dist/themes/angularjs-color-picker-bootstrap.min.css';
import 'tinycolor2/dist/tinycolor-min.js';
import 'angularjs-color-picker/dist/angularjs-color-picker.min.js';


export default angular.module('pvApp.posterCanvas', ['color.picker'])


.directive('download', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel){
			ngModel.$render = function() {
				element.attr('href', ngModel.$viewValue);
			};
		}
	};
})

.directive('canvasVideo', function(){
	return {
		restrict: 'E',
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel){

			ngModel.$render = function() {
				element.html(`<video style="width:100%" controls autoplay src="${ngModel.$viewValue}"></video>`);
			};
		}
	};
})

.directive('fileSelector', function(){
	


	return {
		// template: require('./PosterCanvas.html'),
		restrict: 'A',
		require: 'ngModel',
		scope: {
			fileType: '=fileType',
			// 'elem': '=elem',
			// 'bg': '=bg',
		},
		link: function(scope, element, attrs, ngModel) {


			function read() {
				var file = this.files[0];
				if (!file){
					return;
				}

				var url = (window.URL || window.webkitURL).createObjectURL(file);


				if (scope.fileType === 'background'){
					var image = new Image();
					
					image.onload = function(){
						ngModel.$setViewValue({
							img: image,
							yes: true,
							xPos: 0,
							yPos: 0,
							width: image.width,
							height: image.height
						});
					};
					image.src = url;

				}

				if (scope.fileType === 'logo'){
					var image = new Image();
					image.onload = function(){
						ngModel.$setViewValue({
							img: image,
							yes: true,
							xPos: 100,
							yPos: 100,
							width: image.width,
							height: image.height,
							scale: 20
						});
					};
					image.src = url;
				}

				if (scope.fileType === 'song'){
					var reader = new FileReader();
					reader.readAsArrayBuffer(file);
					reader.onload = function(e) {
						ngModel.$setViewValue({
							filename: file.name,
							song: e.target.result
						});
					};
				}

			}

			// ngModel.$render = function() {
			// 	element.html(ngModel.$viewValue || '');
			// };

			element.on('change', function() {
				scope.$apply(read.bind(this));
			});

		}
	};
})

.directive('posterCanvas', function(PosterVideo) {
	

	return {
		template: require('./PosterCanvas.html'),
		restrict: 'EA',
		scope: {
			'scene': '=scene',
			'noPan': '=noPan',
			'move': '=move',
			'step': '=step',
			'canvas': '=canvas'
		},
		link: function(scope, element, attrs) {

			var $pvCanvas = element.children();
			
			var canvas = $pvCanvas[0];
			var ctx = canvas.getContext('2d');

			if (scope.canvas){
				scope.canvas.canvas = canvas;
				scope.canvas.ctx = ctx;
				scope.canvas.updateStep = function(step){
					scope.step = step;
				};

				scope.canvas.render = render;
			}
			
			if (!scope.noPan){
				var canvasTrackPad = new Hammer(canvas, {});
		        canvasTrackPad.get('pan').set({ direction: Hammer.DIRECTION_ALL });
				
				var tempLayer = {};
				canvasTrackPad.on('panstart', function(ev){
		          // canvasService.detectCurrentLayer({ ctx, canvasInfo: scope.canvasInfo, x:ev.srcEvent.offsetX, y: ev.srcEvent.offsetY, callback: setCurrentLayer  });
		     
		          var disLayer = scope.move || scope.scene.elem.arr[scope.scene.elem.nowIndex];
		          tempLayer = {};

		          if (tempLayer._xPos !== disLayer.xPos){
		            tempLayer._xPos = disLayer.xPos;
		          }
		          if (tempLayer._yPos !== disLayer.yPos){
		            tempLayer._yPos = disLayer.yPos;
		          }

		        });
		        canvasTrackPad.on('pan', function(ev){
		          var disLayer = scope.move || scope.scene.elem.arr[scope.scene.elem.nowIndex];
		          
		          tempLayer._xPos = tempLayer._xPos || parseFloat(disLayer.xPos,10);
		          disLayer.xPos = ev.deltaX + parseFloat(tempLayer._xPos,10);

		          tempLayer._yPos = tempLayer._yPos || parseFloat(disLayer.yPos,10);
		          disLayer.yPos = ev.deltaY + parseFloat(tempLayer._yPos,10);

		          if (ev.isFinal){
		            tempLayer._xPos = disLayer.xPos;
		            tempLayer._yPos = disLayer.yPos;
		          }
		          scope.$apply();
		        });
	       }
			
			var rFID = 0;

			var jsonCache = '';
			
			// var pass = true;
			// setTimeout(function(){
			// 	pass = false;
			// },10000);

			function render(){

				var currentJSON = JSON.stringify(scope.scene) + scope.step;
				if (currentJSON !== jsonCache){
					jsonCache = currentJSON;
				}else{
					return;
				}

				PosterVideo.canvas.draw(ctx, {
					cmd: scope.scene.elem.arr,
					bg: scope.scene.bg,
					logo: scope.scene.logo,
					overcast: scope.scene.overcast,
					border: scope.scene.border,
					step: parseInt(scope.step, 10)
				});
			}

			rFID = window.requestAnimationFrame(function loop(){

				render();

				rFID = window.requestAnimationFrame(loop);
			});

			scope.$on('$destroy', function(){
				window.cancelAnimationFrame(rFID);
			});

		}
	};
})
.name;
