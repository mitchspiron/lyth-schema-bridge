import { SchemaModel } from "../parser/types";

export class AuthGenerator {
  /**
   * Generates authentication-related code based on the provided project configuration and options.
   * @param config The project configuration containing models and settings.
   * @param options The generator options such as output directory and overwrite flag.
   */
  static generateAuthModel(): SchemaModel {
    return {
      name: "User",
      fields: [
        { name: "email", type: "string", required: true, unique: true },
        { name: "name", type: "string", required: true },
        { name: "password", type: "string", required: true },
        {
          name: "emailVerified",
          type: "boolean",
          required: true,
          default: false,
        },
        { name: "verificationToken", type: "string", required: false },
        { name: "resetPasswordToken", type: "string", required: false },
        { name: "resetPasswordExpires", type: "date", required: false },
      ],
    };
  }

  /**
   * Generates authentification service
   */
  static generateAuthService(): string {
    return `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

/**
 * Authentication Service
 * Handles user authentication, registration, and password management
 */
export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: false,
        verificationToken
      }
    });

    // TODO: Send verification email
    // await this.sendVerificationEmail(email, verificationToken);

    return { 
      message: 'Registration successful. Please verify your email.',
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      throw new Error('Email not found');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email first');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    // Don't reveal if user exists for security
    if (!user) {
      return { 
        message: 'If your email is registered, you will receive a reset link' 
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // TODO: Send reset password email
    // await this.sendResetPasswordEmail(email, resetToken);

    return { 
      message: 'If your email is registered, you will receive a reset link',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear tokens
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}`;
  }
}
