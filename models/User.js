const { Model } = require('objection');
const Post = require('./Post');
const Follow = require('./Follow');
class User extends Model {
  static get tableName() {
    return 'user';
  }

  static get relationMappings() {
    return {
    
      post: {
        relation: Model.HasManyRelation, 
        modelClass: Post,
        join: {
          from: 'user.id',
          to: 'post.userid', 
        },
      },
      followIn: {
        relation: Model.BelongsToOneRelation,
        modelClass: Follow,
        join: {
          from: "user.id",
          to: "follow.followin",
        },
      },

      followUp: {
        relation: Model.BelongsToOneRelation,
        modelClass: Follow,
        join: {
          from: "user.id",
          to: "follow.followup",
        },
      },
    };
  }
}

module.exports = User;