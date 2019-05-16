import "babel-polyfill";
import EventEmitter from './EventEmitter'
import {CSDownload} from './CSDownload'

export default class SingleFile{
  constructor(file, size, options){
    this.fileName = file;
    this.fileSize = size;
    this.options = options;
    this.createChunksList();
    this.chunksDownloaded = {};
    this.isPaused = false;
    this.isFinished = false;
    this.chunksRecieved = 0;
    this.eventEmitter = new EventEmitter();
    this.allRecievedChunks = [];
    this.length = 0;
  }

  createChunksList(){
    this.chunksList = [];
    this.numberOfChunks = Math.ceil(this.fileSize / this.options.chunkSize);
    for(let i = 0; i < this.numberOfChunks; i++){
      const chunkNumber = i + 1;
      const sizeOfChunk = this.options.chunkSize;
      const name = this.fileName;
      this.chunksList.push({
        name,
        chunkNumber,
        sizeOfChunk
      })
    }

    console.log(this.chunksList);
  }

  getNextChunk(){
    let nextChunk = this.chunksList.shift();
    if (!nextChunk) {
      return undefined;
    }
    while (this.chunksDownloaded[nextChunk.chunkNumber]){
      nextChunk = this.chunksList.shift();
      if (!nextChunk) {
        return undefined;
      }
    }
    return nextChunk;
  }

  pause(){
    this.isPaused = true;
    CSDownload.getRecievers().forEach(reciever => {
      if (reciever.singleFile.isPaused){
        reciever.controller.abort();
        reciever.isStarted = false;
        reciever.isAborted = true;
      }
    })
    CSDownload.startRecievers();
  }

  continue() {
    if(!this.isFinished){
      this.createChunksList();
      this.isPaused = false;
      CSDownload.startRecievers();
    }
  }

  async concatChunks(){

    CSDownload.startRecievers();
    let blob = this.dataURIToBlob();

    let url = URL.createObjectURL(blob);

    blob = undefined;

    let a = document.createElement('a');
    document.body.appendChild(a);
    a.download = this.fileName;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    url = undefined;
  }

  dataURIToBlob() {

    let arr = new Uint8Array(this.length);

    let counter = 0;
    this.allRecievedChunks.forEach((chunk, index) => {
      
      for (let i = 0; i < chunk.length; i++) {
        arr[counter] = chunk.charCodeAt(i);
        counter++;
      }
      const progress = ((index + 1) / this.allRecievedChunks.length * 100);
      this.eventEmitter.trigger("mergeProgress", progress);
      chunk = undefined;
    })
    this.allRecievedChunks = undefined;

    return new Blob([arr], {});
  }
}