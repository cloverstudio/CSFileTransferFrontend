import "babel-polyfill";
import SingleFile from './SingleFile'
import Receiver from './Receiver'


var CSDownload = (function(){

  var createDefaultOptions = function(){
		options = {
			'chunkSize': 1024 * 1024 * 1,
			'concurrentRequests': 1,
			'repeat': true,
			'repeatCount': 5
    }
    
  }

  var prepareRecievers = function(numberOfRecievers){
		for (let i = 0; i < numberOfRecievers; i++){
			var reciever = new Receiver(i+1, CSDownload);
			recievers.push(reciever);
		}
  }
  
  var swapFiles = function(position){
		let tempFile = singleFiles[0];
		singleFiles[0] = singleFiles[position];
		singleFiles[position] = tempFile;
		let removed = singleFiles.shift();
		singleFiles.push(removed);
	}

  var options = {};
  createDefaultOptions();
  var recievers = [];
  var singleFiles = [];
  var fileExists = true;

  return {
    getRecievers: function(){
      return recievers;
    },

    getOptions: function(){
			return options;
    },
    
    startRecievers: function(){
    
      recievers.forEach((reciever) => {
        if(!reciever.isStarted){
          singleFiles.every((file, position) =>{
            if(!file.isPaused){
              const chunk = file.getNextChunk();
              if(chunk){
                reciever.get(chunk, file);
                reciever.isStarted = true;
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

    config: function(userOptions){
      
      for (let [key, value] of Object.entries(userOptions)) {
        options[key] = value;
      }
      
      if(!options.url) {
        throw new Error("Enter Url");
      }
      
      var numberOfRecievers = options.concurrentRequests;
      prepareRecievers(numberOfRecievers);
  
    },

    download: async function(file){
      let fileSize = -1;
      let sf = await fetch(options.url + "files" + "?fileName=" + file, {method: 'GET'})
      .then((response) => {
        
        return response.json();
      })
      .then(response => {
        fileSize = response.size;
        if(fileSize !== -1){
          let sf = new SingleFile(file, fileSize, options, this);
          singleFiles.push(sf);
          this.startRecievers();
          return sf;
        } else {
          fileExists = false;
          throw new Error();
        }
      })
      .catch(e => {
        if(!fileExists) {
          throw new Error("File doesn't exists on server!");
        } else {
          throw new Error("Can't connect to server");
        }
      })
  
      return sf;
    }
  }
})();

export {CSDownload};