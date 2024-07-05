const multer = require('multer');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { files: 3 } 
});

// Middleware kiểm tra số lượng tệp
function limitFileCount(req, res, next) {
    if (req.files && req.files.length > 3) {
        console.log('Too many files');
        return res.status(413).json({
            success: false,
            message: 'You can upload up to 3 images only'
        });
    }
    next();
}

module.exports = { upload, limitFileCount };
