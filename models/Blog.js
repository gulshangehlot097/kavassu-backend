const { Model } = require('objection');
class Blog extends Model {
  static get tableName() {
    return 'blogs';
  }
}

module.exports = Blog;
