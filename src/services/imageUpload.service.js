const multer = require('multer');
var path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/country');
      },
    filename: function (req, file, cb) {
        cb(null,  new Date().getTime() + '-' + file.originalname);
    }
});

const uploadImg = multer({storage: storage}).single('image');

module.exports = {
    uploadImg
}