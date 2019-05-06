# cs-file-transfer-upload frontend

# Description:
<pre>Module allows uploading multiple files in chunks.<br />

# How to use:

# Install:
npm i cs-file-transfer-upload<br />

# Import CSUpload variable in your main file:
import {CSUpload} from './node_modules/cs-file-transfer-upload/CSUpload'<br />

# Configure CSUpload variable:
CSUpload.config({<br />
	'chunkSize': 1024 * 1024 * 1,	//size of a chunk in bytes, default is 1024 * 1024 * 1<br />
	'concurrentRequests': 3,	//number of chunks sent at the same time (max value depends on browser), default is 1<br />
	'url': 'http://localhost:3000/',	//server<br />
	'repeat': true,	//if error happens try again, default is true<br />
    	'repeatCount': 5	//if error happens try 5 more times<br />
})<br />

# Upload a file:
singleFile = CSUpload.upload(file)	//upload function returns singleFile object, a file currently uploading, you can also add another argument, url that overrides the previously set url<br />

# SingleFile functions:
singleFile.pause()	//pauses upload of a file<br />
singleFile.continue()	//continues upload of a file<br />

# Progress listener:
singleFile.eventEmitter.on('progress', (progress)=>{<br />
	//do something<br />
})<br />

# Error listener:
singleFile.eventEmitter.on('error', (message)=>{<br />
	//do something<br />
})<br />

# Use webpack to bundle your files:
webpack main.js<br />
