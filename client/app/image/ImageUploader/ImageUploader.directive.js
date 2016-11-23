'use strict';
const angular = require('angular');

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

				newArr.push({
					blobURL: url,
					stage: 'selected',
					file: item
				});
			});

			ngModel.$setViewValue(newArr);

			

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
  .name;
