import { ProjectGenerator, ProjectConfig } from '../src';

const config: ProjectConfig = {
  projectName: 'blog-api',
  apiType: 'rest',
  database: 'sqlite',
  authentication: true,
  models: [
    {
      name: 'Post',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'published', type: 'boolean', required: true, default: 'false' },
        { name: 'authorId', type: 'string', required: true },
      ],
    },
    {
      name: 'Comment',
      timestamps: true,
      fields: [
        { name: 'content', type: 'string', required: true },
        { name: 'postId', type: 'string', required: true },
        { name: 'authorId', type: 'string', required: true },
      ],
    },
  ],
};

async function main() {
  await ProjectGenerator.generate(config, './generated/blog-api');
  console.log('✓ Blog API generated successfully!');
}

main().catch(console.error);
