import { SchemaModel } from "../parser/types";

export class RestApiGenerator {
  /**
   * Generate Express.js controller for the given model
   */
  static generateController(model: SchemaModel): string {
    const modelName = model.name;
    const modelLower = modelName.toLowerCase();

    return `import { Request, Response, NextFunction } from 'express';
    import { ${modelName}UseCases } from '../../application/use-cases/${modelName}UseCases';
    import { Create${modelName}Schema, Update${modelName}Schema } from '../../application/dto/${modelLower}.dto';

    /**
     * ${modelName} Controller
     * Handles HTTP requests for ${modelName} resource
     */
    export class ${modelName}Controller {
    constructor(private useCases: ${modelName}UseCases) {}

    /**
     * GET /${modelLower}s
     * Get all ${modelLower}s
     */
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const items = await this.useCases.getAll();
        res.json(items);
        } catch (error) {
        next(error);
        }
    };

    /**
     * GET /${modelLower}s/:id
     * Get a ${modelLower} by ID
     */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { id } = req.params;
        const item = await this.useCases.getById(id);
        res.json(item);
        } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            next(error);
        }
        }
    };

    /**
     * POST /${modelLower}s
     * Create a new ${modelLower}
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
        // Validate input with Zod
        const validation = Create${modelName}Schema.safeParse(req.body);
        
        if (!validation.success) {
            return res.status(400).json({ 
            error: 'Validation failed',
            details: validation.error.message 
            });
        }
        
        const item = await this.useCases.create(validation.data);
        res.status(201).json(item);
        } catch (error) {
        next(error);
        }
    };

    /**
     * PUT /${modelLower}s/:id
     * Update a ${modelLower}
     */
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { id } = req.params;
        
        // Validate input with Zod
        const validation = Update${modelName}Schema.safeParse(req.body);
        
        if (!validation.success) {
            return res.status(400).json({ 
            error: 'Validation failed',
            details: validation.error.message 
            });
        }
        
        const item = await this.useCases.update(id, validation.data);
        res.json(item);
        } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            next(error);
        }
        }
    };

    /**
     * DELETE /${modelLower}s/:id
     * Delete a ${modelLower}
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { id } = req.params;
        await this.useCases.delete(id);
        res.status(204).send();
        } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            next(error);
        }
        }
    };
    }`;
  }

  /**
   * Generate Express.js routes for the given model
   */
  static generateRoutes(model: SchemaModel): string {
    const modelName = model.name;
    const modelLower = modelName.toLowerCase();
    const routePath = `${modelLower}s`;

    return `import { Router } from 'express';
    import { ${modelName}Controller } from '../controllers/${modelName}Controller';

    /**
     * ${modelName} Routes
     * Defines HTTP routes for ${modelName} resource
     */
    export function create${modelName}Routes(controller: ${modelName}Controller): Router {
    const router = Router();

    // GET /${routePath} - Get all ${modelLower}s
    router.get('/${routePath}', controller.getAll);

    // GET /${routePath}/:id - Get a ${modelLower} by ID
    router.get('/${routePath}/:id', controller.getById);

    // POST /${routePath} - Create a new ${modelLower}
    router.post('/${routePath}', controller.create);

    // PUT /${routePath}/:id - Update a ${modelLower}
    router.put('/${routePath}/:id', controller.update);

    // DELETE /${routePath}/:id - Delete a ${modelLower}
    router.delete('/${routePath}/:id', controller.delete);

    return router;
    }`;
  }

  /**
   * Generate main Express.js application file
   */
  static generateExpressApp(models: SchemaModel[], withAuth: boolean): string {
    const imports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { create${
            m.name
          }Routes } from '../../../presentation/rest/routes/${m.name.toLowerCase()}.routes';`
      )
      .join("\n");

    const controllerImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name}Controller } from '../../../presentation/rest/controllers/${m.name}Controller';`
      )
      .join("\n");

    const useCaseImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name}UseCases } from '../../../application/use-cases/${m.name}UseCases';`
      )
      .join("\n");

    const repoImplImports = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map(
        (m) =>
          `import { ${m.name}RepositoryImpl } from '../../database/repositories/${m.name}RepositoryImpl';`
      )
      .join("\n");

    const setupCode = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map((m) => {
        const modelLower = m.name.toLowerCase();
        return `    // Setup for ${m.name}
            const ${modelLower}Repository = new ${m.name}RepositoryImpl(prisma);
            const ${modelLower}UseCases = new ${m.name}UseCases(${modelLower}Repository);
            const ${modelLower}Controller = new ${m.name}Controller(${modelLower}UseCases);`;
      })
      .join("\n\n");

    const routeSetup = models
      .filter((m) => m.name !== "User" || !withAuth)
      .map((m) => {
        const modelLower = m.name.toLowerCase();
        return `    app.use('/api', create${m.name}Routes(${modelLower}Controller));`;
      })
      .join("\n");

    const authImports = withAuth
      ? `
    import { createAuthRoutes } from '../../../presentation/rest/routes/auth.routes';
    import { AuthController } from '../../../presentation/rest/controllers/AuthController';
    import { AuthService } from '../../../application/services/AuthService';`
      : "";

    const authSetup = withAuth
      ? `
    // Setup for Auth
    const authService = new AuthService(prisma);
    const authController = new AuthController(authService);`
      : "";

    const authRoute = withAuth
      ? `app.use('/api/auth', createAuthRoutes(authController));`
      : "";

    return `import express, { Request, Response, NextFunction } from 'express';
            import helmet from 'helmet';
            import cors from 'cors';
            import { PrismaClient } from '@prisma/client';
            ${imports}
            ${controllerImports}
            ${useCaseImports}
            ${repoImplImports}
            ${authImports}

            /**
             * Express Application Setup
             */
            export function creatApp() {
                const app = express();
                const prisma = new PrismaClient();

                // Middleware
                app.use(helmet());
                app.use(cors());
                app.use(express.json());
                app.use(express.urlencoded({ extended: true }));

                // Request Logging Middleware
                app.use((req: Request, res: Response, next: NextFunction) => {
                    console.log(\`\${req.method} \${req.url}\`);
                    next();
                });

                // Health check endpoint
                app.get('/health', (req: Request, res: Response) => {
                    res.json({
                        status: 'OK',
                        timestamp: new Date().toISOString()
                    });
                });

                ${setupCode}

                ${authSetup}

                // Routes
                ${routeSetup}

                ${authRoute}

                // 404 handler
                app.use((req: Request, res: Response) => {
                    res.status(404).json({ error: 'Route not found' });
                });

                // Error handler
                app.use((err, any, req: Request, res: Response, next: NextFunction) => {
                    console.error('Error:', err);
                    res.status(500).json({
                        error: 'Internal Server Error',
                        message: process.env.NODE_ENV === 'development' ? err.message : undefined
                    });
                });

                return { app, prisma };
            }

        export const { app, prisma } = creatApp();
    `;
  }

  static generateValidationMiddleware(): string {
    return `import { Request, Response, NextFunction } from 'express';
    import { ZodSchema } from 'zod';

    /**
     * Generic validation middleware using Zod
     */
    export const validateBody = (schema: ZodSchema) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const validation = schema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: validation.error.message 
                });
            }

            // Replace body with validated data
            req.body = validation.data;
            next();
        };
    };

    /**
     * Validate query parameters
     */
    export const validateQuery = (schema: ZodSchema) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const validation = schema.safeParse(req.query);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Invalid query parameters',
                    details: validation.error.message
                });
            }

            req.query = validation.data as any;
            next();
        }
    }
    `;
  }

  /**
   * Generate error handling middleware
   */
  static generateErrorMiddleware(): string {
    return `import { Request, Response, NextFunction } from 'express';

        /**
         * Custom error class
         */
        export class AppError extends Error {
        constructor(
            public statusCode: number,
            public message: string,
            public isOperational = true
        ) {
            super(message);
            Object.setPrototypeOf(this, AppError.prototype);
        }
        }

        /**
         * Error handling middleware
         */
        export const errorHandler = (
        err: Error | AppError,
        req: Request,
        res: Response,
        next: NextFunction
        ) => {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({
            error: err.message
            });
        }

        // Log unexpected errors
        console.error('Unexpected error:', err);

        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
        };

        /**
         * Async handler wrapper
         */
        export const asyncHandler = (fn: Function) => {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        };`;
  }
}
