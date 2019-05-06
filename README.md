# cs-file-transfer-upload frontend

<pre>
DESCRIPTION
Module allows uploading multiple files in chunks.<br />

HOW TO USE:

INSTALL:
npm i cs-file-transfer-upload<br />

IMPORT CSUpload VARIABLE IN YOUR MAIN FILE:
import {CSUpload} from './node_modules/cs-file-transfer-upload/CSUpload'<br />

CONFIGURE CSUpload VARIABLE:
CSUpload.config({<br />
	'chunkSize': 1024 * 1024 * 1,	//size of a chunk in bytes, default is 1024 * 1024 * 1<br />
	'concurrentRequests': 3,	//number of chunks sent at the same time (max value depends on browser), default is 1<br />
	'url': 'http://localhost:3000/',	//server<br />
	'repeat': true,	//if error happens try again, default is true<br />
    	'repeatCount': 5	//if error happens try 5 more times<br />
})<br />

UPLOAD FILE:
singleFile = CSUpload.upload(file)	//upload function returns singleFile object, a file currently uploading, you can also add another argument, url that overrides the previously set url<br />

singleFile FUNCTIONS:
singleFile.pause()	//pauses upload of a file<br />
singleFile.continue()	//continues upload of a file<br />

PROGRESS LISTENER:
singleFile.eventEmitter.on('progress', (progress)=>{<br />
	//do something<br />
})<br />

ERROR LISTENER:
singleFile.eventEmitter.on('error', (message)=>{<br />
	//do something<br />
})<br />

USE WEBPACK TO BUNDLE YOUR FILES:
webpack main.js<br />
