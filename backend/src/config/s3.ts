import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Configure AWS SDK
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION || 'us-east-1'
});
const upload: multer.Multer = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      cb(null, `uploads/${file.fieldname}/${uniqueSuffix}.${fileExtension}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.fieldname === 'photos') {
      // Only allow image files for photos
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        const error: Error = new Error('Only image files are allowed for photos');
        cb(null, false);
        return cb(error);
      }
    } else if (file.fieldname === 'videos') {
      // Only allow video files for videos
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        const error: Error = new Error('Only video files are allowed for videos');
        cb(null, false);
        return cb(error);
      }
    } else {
      const error: Error = new Error('Invalid field name');
      cb(null, false);
      return cb(error);
    }
  }
});

export { s3Client, upload };
