import "babel-polyfill";
import EventEmitter from './eventEmitter'
import {CSUpload} from './CSUpload'
export default class SingleFile{
  
  constructor(file, options){
    this.file = file;
    this.options = options;
    this.chunkSize = options.chunkSize;
    this.url = options.url;
    this.NumberOfChunks = Math.ceil(this.file.size / this.chunkSize);
    this.eventEmitter = new EventEmitter();
    this.createChunkList();
    this.chunksSent = 0;
    this.getSentChunks();
    this.isPaused = false;
    this.repeatCount = options.repeatCount;
    this.isFinished = false;
  }

  createChunkList(){
    let startByte = 0;
    this.chunksList = [];

    while(startByte < this.file.size){
      let endByte = startByte + this.chunkSize;
      if (endByte > this.file.size){
        endByte = this.file.size;
      }
      const fileName = this.file.name;
      const numberOfChunks = this.NumberOfChunks;
      const chunkNumber = this.chunksList.length + 1;
      const fileType = this.file.type;
      const size = this.chunkSize;
      this.chunksList.push(
      {
        startByte,
        endByte,
        fileName,
        numberOfChunks,
        chunkNumber,
        fileType,
        size
      });
      startByte = endByte;
    }
  }

  getNextChunk(){
    let nextChunk = this.chunksList.shift();
    if (!nextChunk) {
      return undefined;
    }
    while (this.chunksUploaded.chunks[nextChunk.chunkNumber-1]){
      nextChunk = this.chunksList.shift();
      if (!nextChunk) {
        return undefined;
      }
    }
    return nextChunk;

  }

  async getSentChunks(){
    
    await fetch(`${this.url}?fileName=${this.file.name}&numberOfChunks=${this.NumberOfChunks}&size=${this.chunkSize}`, {method:"GET"})
        .then((response) => response.json())
        .then((response) =>  {
          this.chunksUploaded = response;
          this.chunksSent = this.chunksUploaded.length;
          CSUpload.startSenders();
          console.log(response);
        })
        .catch( (e) => {
          if(this.options.repeat){
            this.repeatCount--;
            if( this.repeatCount >= 0){
              setTimeout(()=>{
                console.log("Trying to connect to server");
                this.getSentChunks();
              }, 2000);
            } else {
              throw new Error("Can't connect to server.");
            }
          } else {
            this.eventEmitter.trigger("error", e);
          }
        })
  }

  pause(){
    this.isPaused = true;
    
    CSUpload.getSenders().forEach(sender => {
      if(sender.singleFile.isPaused){
        sender.controller.abort();
        sender.isStarted = false;
        sender.isAborted = true;
      }
    });
    CSUpload.startSenders();
    
  }

  async continue(){
    if(!this.isFinished){
      this.createChunkList();
      this.isPaused = false;
      this.getSentChunks();
    }
  }
  
}