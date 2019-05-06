# cs-file-transfer-upload frontend

# Description:
Module allows uploading multiple files in chunks.

# How to use:

# Install:
npm i cs-file-transfer-upload

# Add all dependencies:
"devDependencies": {
    "@babel/core": "^7.4.3",
    "@babel/preset-env": "^7.4.3",
    "babel-loader": "^8.0.5",
    "babel-polyfill": "^6.26.0",
    "webpack": "^4.30.0",
    "webpack-cli": "^3.3.1",
    "webpack-dev-server": "^3.3.1"
}

# Import CSUpload variable in your main file:
import {CSUpload} from './node_modules/cs-file-transfer-upload/CSUpload'


# Configure CSUpload variable:
CSUpload.config({
    'chunkSize': 1024 * 1024 * 1,	//size of a chunk in bytes, default is 1024 * 1024 * 1
    'concurrentRequests': 3,	//number of chunks sent at the same time (max value depends on browser), default is 1
    'url': 'http://localhost:3000/',	//server
    'repeat': true,	//if error happens try again, default is true
    'repeatCount': 5	//if error happens try 5 more times
})

# Upload a file:
singleFile = CSUpload.upload(file, )	//upload function returns singleFile object, a file currently uploading, you can also add another argument, url that overrides the previously set url

# SingleFile functions:
singleFile.pause()	//pauses upload of a file
singleFile.continue()	//continues upload of a file

# Progress listener:
singleFile.eventEmitter.on('progress', (progress)=>{
	//do something
})

# Error listener:
singleFile.eventEmitter.on('error', (message)=>{
      //do something
})

# Use webpack to bundle your files:
webpack main.js
