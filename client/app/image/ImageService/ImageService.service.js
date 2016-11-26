'use strict';
const angular = require('angular');

var NProgress = require('nprogress');

export function ImageService($http, $q, Auth) {
	'ngInject';

	function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	}

	this.ram = {};

	this.upload = {};

	this.upload.dataURL2Blob = function(dataURL, fileType){
		var binary = window.atob(dataURL.replace(/^data:image\/\w+;base64,/, ''));
		var array = [];
		for(var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)]);
	}.bind(this);

	this.upload.toDataURL = function(canvas){
		var fileType = 'image/png';
		var dataURL = canvas.toDataURL(fileType);
		return dataURL;
	};

	this.upload.canvasToBlob = function(canvas){
		var fileType = 'image/png';
		var dataURL = this.upload.toDataURL(canvas);
		var blob = this.upload.dataURL2Blob(dataURL, fileType);
		return blob;
	}.bind(this);

	this.upload.blobToFile = function(blob, fileName){
		var file = new File([blob], fileName);
		return file;
	}.bind(this);
	
	this.upload.itemToFile = function(item, thumbGUID){
		var canvas = window.document.createElement('canvas');
		
		var maxWidth = 500;
		var maxHeight = 500;
		var ratio = 0;
		var width = item.width;
		var height = item.height;
		if(width > height){
            ratio = maxWidth / width;   // get ratio for scaling image
            canvas.width = maxWidth;
            canvas.height = height * ratio;  // Scale height based on ratio
            height = height * ratio;    // Reset height to match scaled image
            width = width * ratio;    // Reset width to match scaled image
        }

        if(height >= width){
            ratio = maxHeight / height; // get ratio for scaling image
            canvas.height = maxHeight;//$(this).css("height", maxHeight);   // Set new height
            canvas.width = width * ratio;//$(this).css("width", width * ratio);    // Scale width based on ratio
            height = height * ratio;    // Reset height to match scaled image
            width = width * ratio;    // Reset width to match scaled image
        }

		var ctx = canvas.getContext('2d');
		ctx.drawImage(item.file.image, 0,0, canvas.width, canvas.height);
		var blob = this.upload.canvasToBlob(canvas);
		var file = this.upload.blobToFile(blob, 'image.png' );

		var blobURL = (window.URL || window.webkitURL).createObjectURL(file);

		return {
			file, blobURL
		};
	}.bind(this);

	
	this.upload.begin = function(item){

		return $q.resolve()

			.then(function(){
				item.progress = 0.3;
				item.stage = 'signS3';

				var fileGUID = guid();
				var thumbGUID = guid();

				item.thumb = this.upload.itemToFile(item, thumbGUID);

				item.file.GUID = fileGUID + '.' + item.file.file.name.split('.').pop();
				item.thumb.GUID = thumbGUID + '.png' ;

				return this.http.signS3({
					fileName: item.file.GUID,
					fileType: item.file.file.type,
					thumbName: item.thumb.GUID,
					thumbType: item.thumb.file.type
				});

			}.bind(this))
			.then(function(response){

				item.progress = 0.6;
				item.stage = 'uploadS3';
				item.file.signData = response.data[0];
				item.thumb.signData = response.data[1];
				

				return $q.all([
					(function(){
						return this.http.uploadS3({
							file: item.file.file,
							signedRequest: item.file.signData.signedRequest,
							item: item
						}).then(function(){
							item.progress += 0.1;
						}.bind(this));
					}.bind(this)()),
					(function(){
						return this.http.uploadS3({
							file: item.thumb.file,
							signedRequest: item.thumb.signData.signedRequest,
							item: item
						}).then(function(){
							item.progress += 0.1;
						}.bind(this));
					}.bind(this))(),
				]);

				// return this.http.uploadS3({
				// 	file: item.file,
				// 	signedRequest: response.data.signedRequest,
				// 	item: item
				// });
				
			}.bind(this))
			.then(function(){

				item.progress = 0.9;
				item.stage = 'saveURL';
			
				return this.http.make({
					_user: Auth.getCurrentUserSync()._id,
					
					fileKey: item.file.GUID,
					fileURL: item.file.signData.url,
					
					thumbKey: item.thumb.GUID,
					thumbURL: item.thumb.signData.url,
					
					width: item.width,
					height: item.height,
					active: true
				});
				
			}.bind(this))
			.then(function(response){
				item.progress = 1.0;
				item.server = response.data;
				item.stage = 'done';
				
			}.bind(this));

	}.bind(this);




	// AngularJS will instantiate a singleton by calling "new" on this function

	this.http = {};
	this.http.make = function(data){
		return $http({
			url: '/api/images/',
			method: 'POST',
			data: data
		});
	};
	this.http.signS3 = function(data){
		//requre, fileName, fileType
		return $http({
			url: '/api/images/signS3',
			method: 'POST',
			data: data
		});
	};
	this.http.uploadS3 = function({ file, signedRequest, item }){
		return $q(function(resolve, reject){

			const xhr = new XMLHttpRequest();
			xhr.open('PUT', signedRequest);
			xhr.onreadystatechange = () => {
				if(xhr.readyState === 4){
					if(xhr.status === 200){

						resolve(item);
					} else{
						
						reject(item);

						console.error('Cannot upload file');
					}
				}
			};
			xhr.onprogress = (oEvent) => {
				if (oEvent.lengthComputable) {
					var percentComplete = oEvent.loaded / oEvent.total;
					console.log('percentage', percentComplete);
					item.progress = percentComplete;
				} else {
					console.log('unknown length');
				}
			};

			xhr.send(file);

		});
	};
	this.http.update = function(data){
		return $http({
			url: `/api/images/${ data._id }`,
			method: 'PUT',
			data: data
		});
	};
	this.http.remove = function(data){
		return $http({
			url: `/api/images/${ data._id }`,
			method: 'DELETE',
		});
	}

	this.http.my = function(){
		return $http({
			url: '/api/images/my',
			method: 'GET'
		});
	};
	this.http.list = function(){
		return $http({
			url: '/api/images/',
			method: 'GET'
		});
	};


}

export default angular.module('pvApp.imageService', [])
  .service('Images', ImageService)
  .name;
