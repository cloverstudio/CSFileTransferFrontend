# cs-file-transfer-upload frontend

#### Description:
Module allows uploading multiple files in chunks. Use it if you need to pause your uploads.
For backend you can use values from req.body like this:
```Javascript
let { slice, fileName, chunkNumber, numberOfChunks, size } = req.body;
```
Slice is base 64 encoded. You can also use npm module https://www.npmjs.com/package/cs-file-transfer-upload-backend

#### How to use:

#### Install:

`npm i cs-file-transfer-upload`

#### Import CSUpload to your main file:
```Javascript
import {CSUpload} from './node_modules/cs-file-transfer-upload/CSUpload'
```

#### Configure CSUpload:
```Javascript
CSUpload.config({
	'chunkSize': 5 * 1024 * 1024,	// size of a chunk in bytes, default is 1 * 1024 * 1024
	'concurrentRequests': 3,       // number of chunks sent at the same time (max value depends on browser), default is 1
	'url': 'http://localhost:3000/',	// server
	'repeat': true,	// if error happens retry, default is true
    	'repeatCount': 5	// if error happens retry 5 more times
})
```
#### Upload file:
```Javascript
singleFile = CSUpload.upload(file)	
// upload function returns singleFile object, a file currently uploading
// you can also add another argument, url that overrides the previously set url
```

#### singleFile functions:
```Javascript
singleFile.pause()	// pauses upload of a file
singleFile.continue()	// continues upload of a file
```

#### Progress listener:
```Javascript
singleFile.eventEmitter.on('progress', (progress)=>{
	// do something
})
```

#### Error listener:
```Javascript
singleFile.eventEmitter.on('error', (message)=>{
	// do something
})
```

#### Use webpack to bundle your files:
`webpack main.js`
