import { ProjectGenerator, ProjectConfig } from '../src';

const config: ProjectConfig = {
  projectName: 'ecommerce-api',
  apiType: 'both', // REST et GraphQL
  database: 'postgresql',
  authentication: true,
  models: [
    {
      name: 'Product',
      timestamps: true,
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string', required: true },
        { name: 'price', type: 'float', required: true },
        { name: 'stock', type: 'number', required: true },
        { name: 'category', type: 'string', required: true },
        { name: 'image', type: 'string', required: false },
      ],
    },
    {
      name: 'Order',
      timestamps: true,
      fields: [
        { name: 'userId', type: 'string', required: true },
        { name: 'total', type: 'float', required: true },
        { name: 'status', type: 'string', required: true, default: '"PENDING"' },
        { name: 'shippingAddress', type: 'string', required: true },
      ],
    },
    {
      name: 'OrderItem',
      timestamps: false,
      fields: [
        { name: 'orderId', type: 'string', required: true },
        { name: 'productId', type: 'string', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price', type: 'float', required: true },
      ],
    },
    {
      name: 'Review',
      timestamps: true,
      fields: [
        { name: 'productId', type: 'string', required: true },
        { name: 'userId', type: 'string', required: true },
        { name: 'rating', type: 'number', required: true },
        { name: 'comment', type: 'string', required: false },
      ],
    },
  ],
};

async function main() {
  await ProjectGenerator.generate(config, './generated/ecommerce-api');
  console.log('✓ E-commerce API generated successfully!');
}

main().catch(console.error);
