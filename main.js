import "babel-polyfill";
import {CSUpload} from './CSUpload'

const handleFiles = function (files) {

  
  CSUpload.config({
    'chunkSize': 1024 * 1024 * 1,
    'concurrentRequests': 3,
    'url': 'http://localhost:3000/upload',
    'repeat': true,
    'repeatCount': 5
  });

  for (let i = 0; i < files.length; i++){
    
    let singleFile = CSUpload.upload(files[i]);
    
    let paragraph = getNewELement("p");
    paragraph.innerText = singleFile.file.name;
    let pause = getNewELement("button");
    pause.innerHTML = "Pause";
    let cont = getNewELement("button");
    cont.innerHTML = "Continue";
    let progressBar = getNewELement("progress");
    progressBar.max = "100";
    progressBar.value = "0";

    pause.addEventListener("click", () => {
      singleFile.pause();
    });

    cont.addEventListener("click", () => {
      singleFile.continue();
    });
    

    singleFile.eventEmitter.on('progress', (progress)=>{
      progressBar.value = progress.toFixed(0);
    })

    singleFile.eventEmitter.on('error', (message)=>{
      console.log("error happend",message)
    })
  }
};

const inputElement = document.getElementById('files');
inputElement.addEventListener(
  'change',
  async function (event) {    
    event.preventDefault();
    handleFiles( event.target.files);
  },
  false
);

const getNewELement = (type) => {
  let element = document.createElement(type);
  document.body.appendChild(element);
  return element;
}

