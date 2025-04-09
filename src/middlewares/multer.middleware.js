import multer from "multer"

// req: from user as json data
// file: from user (main use of multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")  // here we will save our file locally
    },
    filename: function (req, file, cb) {
      //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
      // if another file with same name is sent from user then ocerwrite but mostly this file willl be for very short period of time on local server (disk). after that will be deleted so not much issue
    }
})

export const upload = multer({ storage, })
//export const upload = multer({ storage: storage })
// One of the options is storage, where you tell multer: "Hey, use my custom storage method."
// If you don't provide storage, multer will use default settings (which saves files to memory, not disk).