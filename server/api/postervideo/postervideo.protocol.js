import ffmpeg from './postervideo.ffmpeg';

import md5 from 'md5';


var mkdirp = require('mkdirp');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

export function register(socket){


	function deleteFolderRecursive(path) {
	  if( fs.existsSync(path) ) {
	    fs.readdirSync(path).forEach(function(file,index){
	      var curPath = path + "/" + file;
	      if(fs.lstatSync(curPath).isDirectory()) { // recurse
	        deleteFolderRecursive(curPath);
	      } else { // delete file
	        fs.unlinkSync(curPath);
	      }
	    });
	    fs.rmdirSync(path);
	  }
	}

	

	function createFolder(folderUrl){
		return new Promise(function(resolve, reject){
			mkdirp(folderUrl, function(err) {
				if (err){
					console.log(err);
					reject(err);
				}else{
					resolve();
				}
			});
		});
	}
	function createTempFolder(tid){
		return createFolder(getTempDir(tid));
	}
	function writeFile(writePath, fileData){
		return new Promise(function(resolve, reject){
			fs.writeFile(writePath, fileData, function(err) {
			    
			    if(err) {
			        console.log(err);
					reject(err);
				}else{
					resolve();
				}
		    
			});
		});
	}


	function getTempMovie(tid){
		return path.join(__dirname + '/./temp/' + md5(tid) + '/' + 'out.mp4');
	}
	function getTempDir(tid){
		return path.join(__dirname + '/./temp/' + md5(tid) + '/' );
	}
	function getSongUrl({ tid, filename }){
		return path.join(__dirname + '/./temp/' + md5(tid) + '/' + md5(filename) + '.' + filename.split('.').pop() );
	}
	

	function writeMusicFile({ tid, filename, song }) {
		return writeFile(getSongUrl({ tid, filename }), song);
	}

	function encodeFiles({ taskData, socket }){
		
		var ffmpegMod = ffmpeg.make({
			music: (typeof taskData.song !== 'undefined') ? getSongUrl(taskData) : undefined,
			output: getTempMovie(taskData.tid),
			done: function(){
				
				if (  fs.existsSync( getTempMovie(taskData.tid) )  ){
					fs.readFile( getTempMovie(taskData.tid), function(err, data){
						if (err) {
							throw err;
						}
				
						socket.emit('pv:done:' + taskData.tid, { buffer: data });
						
						ffmpegMod.close();

						deleteFolderRecursive( getTempDir(taskData.tid) );

					});
				}

			},
			progress: function(iii){
				socket.emit('pv:progress:' + taskData.tid, { progress: iii });
			}
		});

		setTimeout(function(){
			deleteFolderRecursive( getTempDir(taskData.tid) );
			ffmpegMod.close();
		},1000 * 60 * 5);

		socket.on('pv:each:' + taskData.tid, function(eData){
			ffmpegMod.stream({
				buffer: new Buffer(eData.base64, 'base64'),
				close: eData.close,
				next: function(){
					if (!eData.close){
						socket.emit('pv:receive:' + taskData.tid, {});
					}
				},
			});
		});


		setTimeout(function(){
		    socket.emit('pv:receive:' + taskData.tid, {});
		},1000);
	
	}

	function startTask(taskData, socket){

		if (taskData.song){

			createTempFolder(taskData.tid)
			.then(function(){
				return writeMusicFile({
					tid: taskData.tid, 
					filename: taskData.filename, 
					song: taskData.song
				});
			})
			.then(function(){
				return encodeFiles({
					taskData: taskData,
					socket: socket
				});
			});
		
		}else{

			createTempFolder(taskData.tid)
			.then(function(){
				return encodeFiles({
					taskData: taskData,
					socket: socket
				});
			});

		}

	}

	socket.on('pv:task', function(taskData){

		startTask(taskData, socket);

	});


}
