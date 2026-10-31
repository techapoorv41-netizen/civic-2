const { v2: cloudinary } = require('cloudinary');
const StorageProvider = require('./StorageProvider');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryStorage extends StorageProvider {
  upload({ buffer, key }) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { public_id: key.replace(/\.[^.]+$/, ''), resource_type: 'image' },
          (err, r) => (err ? reject(err) : resolve({ key: r.public_id, url: r.secure_url }))
        )
        .end(buffer);
    });
  }

  delete({ key }) {
    return cloudinary.uploader.destroy(key);
  }
}

module.exports = CloudinaryStorage;