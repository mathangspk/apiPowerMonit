const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verify = require('../verifyToken');
const db = require('../../config/keys').mongoURI;
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Gird = require('gridfs-stream');
const path = require('path');



const conn = mongoose.createConnection(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//init gfs
let gfs;

conn.once('open', () => {
  gfs = Gird(conn.db, mongoose.mongo)
  gfs.collection('uploads');
})

//create storage engine
var storage = new GridFsStorage({
  url: db,
  options: {useUnifiedTopology: true},
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({
  storage,
  limits: {
    files: 5, // allow up to 5 files per request,
    fileSize:  10 * 1024 * 1024 // 5 MB (max file size)
  },
  fileFilter: (req, file, cb) => {
    // allow images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|PNG|JPEG|GIF)$/)) {
      return cb(new Error('Only image are allowed.'), false);
    }
    cb(null, true);
  }
});

//@route Post upload
router.post('/', verify, upload.single('photo'), async (req, res) => {
  try {
    const photo = req.file;

    if (!photo) {
      res.status(400).send({
        status: false,
        data: 'No photo is selected'
      })
    }
    else {
      res.json({ file: req.file })
      let data = [];

      // iterate over all photos
      photo.map(p => data.push({
        name: p.originalname,
        mimetype: p.mimetype,
        size: p.size
      }));
      // send response
      res.send({
        status: true,
        message: 'Photos are uploaded.',
        data: data
      })
    }
  }
  catch (err) {
    res.status(500).json(err.details[0].message)
  }

})


//@route POST many image
router.post('/upload-photos', verify, upload.array('photos', 8), async (req, res) => {
  try {
    const photos = req.files;
    console.log(photos)
    // check if photos are available
    if (!photos) {
      res.status(400).send({
        status: false,
        data: 'No photo is selected.'
      });
    } else {
      let data = [];
      // iterate over all photos
      photos.map(p => data.push({
        filename: p.filename,
        name: p.originalname,
        mimetype: p.mimetype,
        size: p.size
      }));
      
      // send response
      res.send({
        status: true,
        message: 'Photos are uploaded.',
        data: data
      });
    }

  } catch (err) {
    res.status(500).send(err);
  }
});

//@route GET / files
//display all files in JSON

router.get('/images', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    //check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    //File exist
    return res.json(files);
  })
})

//@route GET /files/:filename
// display single file
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    //check if files
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exist'
      });
    }
    //File exist
    return res.json(file);
  })
});

//@route GET /image/:filename
// display single file
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    //check if files
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exist'
      });
    }
    //Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'img/png') {
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(400).json({
        err: 'Not an image'
      })
    }
  })
});

//@route delete 
// files/del/:filename
// Delete chunks from the db
router.delete("/image/:filename", verify, async (req, res) => {
  gfs.remove({ filename: req.params.filename, root: 'uploads' }, (err) => {
    if (err) return res.status(500).json({ success: false })
    return res.json({ success: true });
  })
});


module.exports = router;