class StorageProvider {
  async upload() {
    throw new Error('upload not implemented');
  }

  async delete() {
    throw new Error('delete not implemented');
  }
}

module.exports = StorageProvider;