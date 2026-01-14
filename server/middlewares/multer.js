import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null, 'uploads/')
    },
    filename: function(req,file,callback){
        callback(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if(mimetype && extname) return cb(null, true);
        else cb(new Error('Only image files are allowed'))
    }
})

export default upload