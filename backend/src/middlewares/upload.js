const multer = require('multer')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '../uploads')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + path.extname(file.originalname)
        cb(null, uniqueName)
    }
})
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg'
    ]
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error('Invalid image format'),
            false
        )
    }
    cb(null, true)
}
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})

module.exports = upload