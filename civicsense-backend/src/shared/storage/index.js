const env = require('../../config/env');
const LocalStorage = require('./LocalStorage');
const CloudinaryStorage = require('./CloudinaryStorage');

module.exports =
  env.STORAGE_DRIVER === 'cloudinary' ? new CloudinaryStorage() : new LocalStorage();