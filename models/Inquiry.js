const { Model } = require('objection');
class Inquiry extends Model {
  static get tableName() {
    return 'inquiries';
  }
}

module.exports = Inquiry;