class CSUpload {
	constructor() {
		this.singleFiles = [];
		this.senders = [];
		this.createDefaultOptions();
	}

	createDefaultOptions(){
		this.options = {
			'chunkSize': 1024 * 1024 * 1,
			'concurrentRequests': 1,
			'repeat': true
		}
	}

	config(options) {
		for (let [key, value] of Object.entries(options)) {
			this.options[key] = value;
		}
		this.checkChunkSize();
		if(!this.options.url) {
			throw new Error("Enter Url");
		}
		this.numberOfSenders = this.options.concurrentRequests;
		this.prepareSenders();
	}

	checkChunkSize(){
		if (this.options.chunkSize % 6 !== 0) {
			this.options.chunkSize += 6 - this.options.chunkSize % 6;
		}
	}

	prepareSenders(){
		for (let i = 0; i < this.numberOfSenders; i++){
			let sender = new Sender(i+1, this);
			this.senders.push(sender);
		}
	}

	upload(file){
		let singleFile = new SingleFile(file, this.options, this);
		this.singleFiles.push(singleFile);
		return singleFile;
	}

	startSenders(){
		this.senders.forEach((sender) => {
			if(!sender.isStarted){
				this.singleFiles.every((file, position) =>{
					if(!file.isPaused && file.chunksUploaded){
						const chunk = file.getNextChunk();
						if(chunk){
							sender.send(chunk, file);
							sender.isStarted = true;
							this.swapFiles(position);
							return false;
						} 
						return true;
					} 
					return true;
				})
			}
		})
	}

	swapFiles(position){
		let tempFile = this.singleFiles[0];
		this.singleFiles[0] = this.singleFiles[position];
		this.singleFiles[position] = tempFile;
		let removed = this.singleFiles.shift();
		this.singleFiles.push(removed);
	}
}
