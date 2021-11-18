const multer = require('multer');
var path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/doc');
      },
    filename: function (req, file, cb) {
        cb(null,  new Date().getTime() + '-' + file.originalname);
    }
});

const uploadFile = multer({storage: storage}).single('file');

module.exports = {
    uploadFile
}