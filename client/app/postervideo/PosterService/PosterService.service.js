'use strict';
const angular = require('angular');



export function PosterVideoService($http) {
	'ngInject';
	// AngularJS will instantiate a singleton by calling "new" on this function

	var conMod = {};
	conMod.isActive = function(container, key){
		return container.nowIndex === key;
	};
	conMod.syncActive = function(container){
		container.nowIndex = conMod.getActiveIndex(container);
	}.bind(this);
	conMod.getActiveIndex = function(container){
		var ans = 0;
		container.arr.forEach(function(item, key){
			if(item.active){
				ans = key;
			}
		});
		return ans;
	};
	conMod.setActive = function(container, arrItem, key){
		container.arr.forEach(function(item){
			item.active = false;
		});
		arrItem.active = true;
		container.nowIndex = key;
	};
	conMod.delete = function(arr, item, container){
		
		if (!window.confirm('Delete?')){ return; }

		if (arr.indexOf(item) === (arr.length - 1)){
			item.active = false;
			arr[arr.indexOf(item) - 1].active = true;
			conMod.syncActive(container);
		}

		arr.splice( arr.indexOf(item), 1 );

	};
	conMod.copy = function(arr, item, container){
		var newItem = {};

		angular.copy(item, newItem);
		item.active = true;
		newItem.active = false;
		arr.splice(arr.indexOf(item), 0, newItem);
		
		conMod.syncActive(container);
	};


	this.scene = angular.copy(conMod);

	this.elem = angular.copy(conMod);
	this.elem.resolveActiveItem = function(scene){
		var elem = scene.arr[scene.nowIndex].elem;
		return elem.arr[elem.nowIndex];
	};

	// this.elem.copy = function(arr, item, container){
	// 	var newItem = {};

	// 	angular.copy(item, newItem);
	// 	item.active = true;
	// 	newItem.active = false;
	// 	arr.splice(arr.indexOf(item), 0, newItem);
		
	// 	conMod.syncActive(container);
	// }.bind(this);
	// this.elem.delete = function(arr, item, container){
	// 	if (arr.indexOf(item) === (arr.length - 1)){
	// 		item.active = false;
	// 		arr[arr.indexOf(item) - 1].active = true;
	// 		conMod.syncActive(container);
	// 	}

	// 	arr.splice( arr.indexOf(item), 1 );
	// }.bind(this);

	this.ram = {};
	this.ram.image2ram = function (ram){
		angular.forEach(ram.scene.arr, function(scene){

			if (scene.logo && scene.logo.url){
				let newImage = new Image();
				newImage.setAttribute('crossOrigin', 'anonymous');
				newImage.src = scene.logo.url;
				newImage.onload = function(){
					scene.logo.img = newImage;
					scene.logo.refresh = Math.random();
				};
				newImage.onerror = function(){
					delete scene.logo.img;
					delete scene.logo.url;
				};
			}

			if (scene.bg && scene.bg.url){
				let newImage = new Image();
				newImage.setAttribute('crossOrigin', 'anonymous');
				newImage.src = scene.bg.url;
				newImage.onload = function(){
					scene.bg.img = newImage;
					scene.bg.refresh = Math.random();
				};
				newImage.onerror = function(){
					delete scene.bg.img;
					delete scene.bg.url;
				};
			}

		});
	};


	var gradientCache;
	this.canvas = {};
	this.canvas.bg = function(ctx, data){

		if (data.bg && data.bg.yes && data.bg.img && data.bg.img.src){
			ctx.drawImage(data.bg.img, Math.abs(data.bg.img.width - ctx.canvas.width) / 2 - parseInt(data.bg.xPos, 10) , 0, data.bg.img.height, data.bg.img.height, 0, 0, ctx.canvas.width,  ctx.canvas.height  );
		}else{
			
			var lingrad = gradientCache || ( gradientCache = (function(){

				var grad = ctx.createLinearGradient(1080,1080,0,0);
				grad.addColorStop(0, '#dfdfdf');
				grad.addColorStop(1, '#fdfdfd');

				return grad;
			}()) );
			

			ctx.fillStyle = lingrad;
			ctx.fillRect(0,0,1080,1080);

			// ctx.fillStyle = '#dfdfdf';
			// ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
		}
	};
	this.canvas.logo = function(ctx, data){
		if (data.logo && data.logo.yes && (parseInt(data.logo.scale, 10) > 0) && data.logo.img && data.logo.img.src){
			var scale = data.logo.scale / 100;
			ctx.drawImage(data.logo.img, data.logo.xPos, data.logo.yPos, data.logo.width * scale, data.logo.height * scale);
		}
	};
	this.canvas.overcast = function(ctx, data){
		if (data.overcast && data.overcast.yes){
			ctx.save();
		
			ctx.fillStyle = data.overcast.color || 'rgba(255,255,255,0.5)';
			ctx.fillRect(data.overcast.xPos - 0.5, data.overcast.yPos - 0.5, data.overcast.width, data.overcast.height);

			ctx.restore();
		}
	};
	this.canvas.border = function(ctx, data){
		if (data.border && data.border.yes){
			
			ctx.lineWidth = data.border.lineWidth;
			ctx.strokeStyle = data.border.color || 'rgba(255,255,255,0.5)';
			ctx.strokeRect(data.border.xPos - 0.5,data.border.yPos - 0.5, data.border.width, data.border.height);
		}
	};
	this.canvas.draw = function(ctx, data){

		ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

		this.canvas.bg(ctx, data);
		this.canvas.overcast(ctx, data);
		this.canvas.border(ctx, data);

		this.canvas.logo(ctx, data);

		data.cmd.forEach(function(item, key){
			
			if (typeof data.step !== 'undefined' && key > data.step){ return; }

			if (item.type === 'text'){
				ctx.save();
				ctx.textAlign = item.rCenter;
				ctx.fillStyle = item.fontColor;
				ctx.textBaseline = 'middle';

				ctx.font = item.fontSize + 'px ' + item.fontStyle || 'Arial';
				
				//var metrics = ctx.measureText(item.text);
				ctx.translate(item.xPos, item.yPos);

				ctx.rotate(item.rDeg * Math.PI / 180);
				ctx.fillText(item.text, 0, 0);
				//debugger;
				ctx.restore();
			
			}
		});

	}.bind(this);














	this.http = {};

	this.http.put = function(data){
		return $http({
			method: 'PUT',
			url: `/api/postervideos/${data._id}`,
			data: data
		});
	};

	this.http.show = function(id){
		return $http({
			method: 'GET',
			url: `/api/postervideos/${id}`,
		});
	};

	this.http.delete = function(id){
		return $http({
			method: 'DELETE',
			url: `/api/postervideos/${id}`,
		});
	};


	this.http.list = function(){
		return $http({
			method: 'GET',
			url: '/api/postervideos'
		});
	};

	this.http.my = function(){
		return $http({
			method: 'GET',
			url: '/api/postervideos/my'
		});
	};

	this.http.search = function(data){
		return $http({
			method: 'POST',
			url: '/api/postervideos/search',
			data: data
		});
	};

	this.http.create = function(data){
		return $http({
			method: 'POST',
			url: '/api/postervideos',
			data: data
		});
	};


}

export default angular.module('pvApp.posterVideoService', [])
  .service('PosterVideo', PosterVideoService)
  .name;
