module.exports = {
  projectName: 'my-awesome-api',
  apiType: 'rest', // 'rest' | 'graphql' | 'both'
  database: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  authentication: false,
  models: [
    {
      name: 'Post',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'published', type: 'boolean', required: true, default: 'false' },
        { name: 'authorId', type: 'string', required: true }
      ]
    },
    {
      name: 'Comment',
      timestamps: true,
      fields: [
        { name: 'content', type: 'string', required: true },
        { name: 'postId', type: 'string', required: true },
        { name: 'authorId', type: 'string', required: true }
      ]
    }
  ]
};