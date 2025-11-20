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
}
