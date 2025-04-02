import multer from "multer"

// req: from user as json data
// file: from user (main use of multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
      // if another file with same name is sent from user then ocerwrite but mostly this file willl be for very short period of time on local server (disk). after that will be deleted so not much issue
    }
})

export const upload = multer({ storage, })
//export const upload = multer({ storage: storage })