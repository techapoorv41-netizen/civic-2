const fs = require('fs');
const path = require('path');
const env = require('../../config/env');
const StorageProvider = require('./StorageProvider');

class LocalStorage extends StorageProvider {
  async upload({ buffer, key }) {
    const full = path.join('uploads', key);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, buffer);
    return { key, url: `${env.PUBLIC_URL}/uploads/${key}` };
  }

  async delete({ key }) {
    await fs.promises.rm(path.join('uploads', key), { force: true });
  }
}

module.exports = LocalStorage;