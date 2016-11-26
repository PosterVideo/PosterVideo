'use strict';
const angular = require('angular');
var $ = require('jquery');

export default angular.module('pvApp.imageUploader', [])
  
  .directive('imageUploader', function() {

    return {
      // template: require('./ImageUploader.html'),
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {

      	function read() {
			var files = this.files;
			if (!files){
				console.log('no files selected');
				return;
			}

			// console.log(files);

			var newArr = (ngModel.$viewValue || []).concat([]);
			angular.forEach(files, function(item){
				
				var url = (window.URL || window.webkitURL).createObjectURL(item);
				var image = new Image();
				var newObj = {
					file: {
						image: image,
						blobURL: url,
						file: item,
						fileType: item.type
					},
					stage: 'selected',
				};
				image.onload = function(){
					newObj.width = image.width;
					newObj.height = image.height;
					scope.$apply();
				};
				image.src = url;


				
				newArr.push(newObj);
			});

			ngModel.$setViewValue(newArr);

			

		}

		var fileInput = window.document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = 'multiple';
		fileInput.accept = 'image/*';

		$(fileInput).on('change', function(){
			scope.$apply(read.bind(this));
		});

		
		element.on('click', function(){
			$(fileInput).click();
		});

		// ngModel.$render = function() {
		// 	element.html(ngModel.$viewValue || '');
		// };

      	element.on('change', function() {
			scope.$apply(read.bind(this));
		});
      }
    };

  })
  .name;
