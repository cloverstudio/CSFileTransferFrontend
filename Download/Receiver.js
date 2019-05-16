import "babel-polyfill";
import {CSDownload} from './CSDownload'

export default class Receiver {
  constructor(id){
    this.id = id;
    this.isStarted = false;
    this.isAborted = false;
    this.repeatCount = CSDownload.getOptions().repeatCount;
  }
  
  async get(chunk, singleFile){
    this.singleFile = singleFile;
    let { name, chunkNumber, sizeOfChunk } = chunk;

    this.controller = new AbortController();
    const signal = this.controller.signal;

    await fetch(CSDownload.getOptions().url + "file" + "?fileName=" + name + "&chunkSize=" + sizeOfChunk + "&chunkNumber=" + chunkNumber, {method: 'GET', signal})
      .then(response => {
        return response.json();
      })
      .then((response) => {
        
        this.repeatCount = CSDownload.getOptions().repeatCount;
        let { b64, fileName, chunkSize, chunkNumber } = response;

        this.singleFile.chunksRecieved++;
        const percentage = (this.singleFile.chunksRecieved / this.singleFile.numberOfChunks * 100);
        this.singleFile.eventEmitter.trigger('progress', percentage);

        this.singleFile.allRecievedChunks[chunkNumber - 1] = atob(b64);
        this.singleFile.length += this.singleFile.allRecievedChunks[chunkNumber - 1].length;
        this.singleFile.chunksDownloaded[chunkNumber] = true;
        b64 = undefined;

        if(percentage >= 100){
          this.singleFile.isFinished = true;
          this.singleFile.concatChunks();
        }
        this.isStarted = false;
        CSDownload.startRecievers();
      })
      .catch(e => {
        if(this.isAborted){
          this.singleFile.chunksList.push(chunk);
          this.isAborted = false;
        } else {

          if(CSDownload.getOptions().repeat){

            this.repeatCount--;

            if( this.repeatCount >= 0){
              setTimeout(()=>{
                this.get(chunk, this.singleFile);
              }, 2000);
            } else {
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