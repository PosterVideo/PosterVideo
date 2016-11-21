var spawn = require('child_process').spawn;
var Stream = require('stream');


var ffmpeg = {

	make: function stream({ music, output, done, progress }){
		var args = [];

		args = args.concat([
			
			'-y',

			'-r', '1/0.95', 

			'-f', 'image2pipe',
			'-i', 'pipe:0',
			
			

		]); 

		if (typeof music !== 'undefined'){
			args = args.concat([
				'-i', music,
			]);
		}

		args = args.concat([

			'-c:v', 'libx264', 
			'-c:a', 'aac',

			'-r', '5',
			
			'-shortest',

			'-pix_fmt', 'yuv420p', 

			output
			
			// '-f', 'h264',
			// 'pipe:1'
		]); 

		var child  = spawn('ffmpeg', args);
		var isDone = false;
		var iii = 0;
	 	child.stderr.on('data', function(data){

	 		if (progress){
	 			iii++;
	 			progress(iii++ / 100);
	 		}

	 		if (!isDone && data.indexOf('Qavg:') !== -1 || data.indexOf('] kb/s:') !== -1){
	 			isDone = !isDone;
	 			done();
	 			child.kill();
	 		}
	 	});

	    // child.stdout.pipe(res);

		child.stderr.pipe(process.stdout);

		var passThrough = new Stream.PassThrough();
 		passThrough.pipe(child.stdin);

		return {
			stream: function ({ buffer, close, next }){
				passThrough.write(buffer, function(){

					if (close){
						passThrough.end();
					}else{
						if (next){
							next();
						}
					}

				});
			},
			close: function(){
				child.kill();
			}

		}

	}

	

};

export default ffmpeg;