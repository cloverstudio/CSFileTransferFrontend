var CSUpload = (function() {

	var createDefaultOptions = function(){
		options = {
			'chunkSize': 1024 * 1024 * 1,
			'concurrentRequests': 1,
			'repeat': true,
			'repeatCount': 5
		}
	}

	var prepareSenders = function(){
		for (let i = 0; i < numberOfSenders; i++){
			var sender = new Sender(i+1, CSUpload);
			senders.push(sender);
		}
	}

	var swapFiles = function(position){
		let tempFile = singleFiles[0];
		singleFiles[0] = singleFiles[position];
		singleFiles[position] = tempFile;
		let removed = singleFiles.shift();
		singleFiles.push(removed);
	}


	var singleFiles = [];
	var senders = [];
	createDefaultOptions();	

  return { 

		getSenders: function(){
			return senders;
		},

		getOptions: function(){
			return options;
		},

		startSenders: function(){
			senders.forEach((sender) => {
				if(!sender.isStarted){
					singleFiles.every((file, position) =>{
						if(!file.isPaused && file.chunksUploaded){
							const chunk = file.getNextChunk();
							if(chunk){
								sender.send(chunk, file);
								sender.isStarted = true;
								swapFiles(position);
								return false;
							} 
							return true;
						} 
						return true;
					})
				}
			})
		},
		
		config: function(userOptions) {
			
			for (let [key, value] of Object.entries(userOptions)) {
				options[key] = value;
			}
			
			if(!options.url) {
				throw new Error("Enter Url");
			}
			numberOfSenders = options.concurrentRequests;
			prepareSenders();
		},

		upload: function(file, replaceUrl){
			if(replaceUrl){
				let newOptions = JSON.parse(JSON.stringify(options));
				newOptions.url = replaceUrl;
				let singleFile = new SingleFile(file, newOptions, this);
				singleFiles.push(singleFile);
				return singleFile;
			} else {
				let singleFile = new SingleFile(file, options, this);
				singleFiles.push(singleFile);
				return singleFile;
			}
		}
  };
})();
