'use strict';
const angular = require('angular');

export function ImageServiceService($http, $q, Auth) {
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

	this.upload = {};
	this.upload.scan = function(arr){
		
		console.log(arr);

		angular.forEach(arr, function(item){
			if (item.stage === 'selected'){
				item.stage = 'signS3';
				this.upload.begin(item);
			}
		}.bind(this));

	}.bind(this);
	this.upload.begin = function(item){

		item.guidName = guid() + '.' + item.file.name.split('.').pop();

		return this.http.signS3({
			fileName: item.guidName,
			fileType: item.file.type,
		})
			.then(function(response){

				item.signData = response.data;
				console.log(response.data);

				return this.http.uploadS3({
					file: item.file,
					signedRequest: response.data.signedRequest,
					item: item
				});

			}.bind(this))
			.then(function(response){
				
				console.log(response.data);

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
			method: 'UPDATE',
			data: data
		});
	};
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
  .service('Image', ImageServiceService)
  .name;
