import { ProjectGenerator, ProjectConfig } from '../src';

const config: ProjectConfig = {
  projectName: 'task-manager-api',
  apiType: 'graphql',
  database: 'postgresql',
  authentication: true,
  models: [
    {
      name: 'Project',
      timestamps: true,
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string', required: false },
        { name: 'color', type: 'string', required: false },
        { name: 'ownerId', type: 'string', required: true },
        { name: 'archived', type: 'boolean', required: true, default: 'false' },
      ],
    },
    {
      name: 'Task',
      timestamps: true,
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string', required: false },
        { name: 'status', type: 'string', required: true, default: '"TODO"' },
        { name: 'priority', type: 'string', required: true, default: '"MEDIUM"' },
        { name: 'dueDate', type: 'date', required: false },
        { name: 'projectId', type: 'string', required: true },
        { name: 'assigneeId', type: 'string', required: false },
        { name: 'completed', type: 'boolean', required: true, default: 'false' },
      ],
    },
    {
      name: 'Tag',
      timestamps: true,
      fields: [
        { name: 'name', type: 'string', required: true, unique: true },
        { name: 'color', type: 'string', required: false },
      ],
    },
    {
      name: 'Comment',
      timestamps: true,
      fields: [
        { name: 'content', type: 'string', required: true },
        { name: 'taskId', type: 'string', required: true },
        { name: 'authorId', type: 'string', required: true },
      ],
    },
  ],
};

async function main() {
  await ProjectGenerator.generate(config, './generated/task-manager-api');
  console.log('✓ Task Manager API generated successfully!');
}

main().catch(console.error);
