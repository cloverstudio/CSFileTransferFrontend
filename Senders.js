class Sender{
  constructor(id, csupload){
    this.id = id;
    this.isStarted = false;
    this.csupload = csupload;
    this.isAborted = false;
    this.repeatCounter = 5;
  }

  async send(chunk, singleFile){
    this.singleFile = singleFile;
    let slice = singleFile.file.slice(chunk.startByte, chunk.endByte, chunk.fileType);
    let encodedSlice = await this.getBase64(slice);
    const delimiter = ";base64,";
    encodedSlice = encodedSlice.substring(encodedSlice.indexOf(delimiter) + delimiter.length);
    
    this.uploadChunk(encodedSlice, chunk, singleFile);
  }

  getBase64(slice) {
		return new Promise( (resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(slice);

			reader.onloadend = () => resolve(reader.result);

			reader.onerror = (error) => reject(error);
		});
  }

  uploadChunk(encodedSlice, chunk, singleFile){
    this.controller = new AbortController();
    const signal = this.controller.signal;
    let fd = new FormData();
		fd.append('slice', encodedSlice);
		fd.append('fileName', chunk.fileName);
		fd.append('chunkNumber', chunk.chunkNumber);
		fd.append('fileType', chunk.fileType);
    fd.append('numberOfChunks', chunk.numberOfChunks); 

    fetch(this.csupload.options.url, {
      method: 'POST',
      body: fd,
      signal
    })
      .then((response) => {
        console.log("sent chunk", chunk.chunkNumber, "from sender", this.id, chunk.fileName);

        this.repeatCounter = 5;

        singleFile.chunksSent++;
        const percentage = (singleFile.chunksSent / chunk.numberOfChunks * 100);
        singleFile.eventEmitter.trigger('progress', percentage);

        this.isStarted = false;
        this.csupload.startSenders();

      })
      .catch((e) => {
        if(this.isAborted){
          //console.log("aborted from sender", this.id,"chunk:", chunk.chunkNumber)
          singleFile.chunksList.push(chunk);
          this.isAborted = false;
        } else {
          if(this.csupload.options.repeat){
            this.repeatCounter--;
            if( this.repeatCounter >= 0){
              setTimeout(()=>{
                console.log("Trying to send again chunk number", chunk.chunkNumber, "from sender", this.id);
                this.send(chunk, singleFile);
              }, 2000);
            } else {
              console.log("Can't connect to server.");
              singleFile.chunksList.push(chunk);
              singleFile.pause();
            }
          } else {
            singleFile.eventEmitter.trigger('error', e);
            singleFile.chunksList.push(chunk);
            singleFile.pause();
          }
        }
      })
  }
}