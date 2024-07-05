function checkFileCount(req, res, next) {
    const files = req.files || [];
    if (files.length > 3) {
        return res.status(400).json({
            success: false,
            message: 'You can upload up to 3 images only'
        });
    }
    next();
}

module.exports = checkFileCount;
