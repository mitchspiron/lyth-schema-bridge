import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateAllExamples() {
  console.log('# Generating all examples...\n');

  const examples = [
    { name: 'Basic Blog', script: 'npm run example:basic' },
    { name: 'Advanced E-commerce', script: 'npm run example:advanced' },
    { name: 'Task Manager', script: 'npm run example:task-manager' },
  ];

  for (const example of examples) {
    console.log(`# Generating ${example.name}...`);
    try {
      await execAsync(example.script);
      console.log(`✓ ${example.name} generated\n`);
    } catch (error) {
      console.error(`✗ Failed to generate ${example.name}:`, error);
    }
  }

  console.log('✓ All examples generated!');
}

generateAllExamples().catch(console.error);
