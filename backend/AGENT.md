# Backend Agent Rules

- Preserve the `Controller -> Service -> Repository -> Prisma` dependency flow.
- Keep strict TypeScript compatibility and do not use `any`.
- Validate request bodies with DTOs and reject unknown properties.
- Do not expose Prisma models directly from controllers.
- Keep access token validation before permission checks.
- Keep OTP codes and password hashes out of logs and responses.
- Do not add speculative models, endpoints, or dependencies.
- Never edit generated Prisma files manually.
- Use regular spaces in Persian text and never use Unicode zero-width non-joiner.
- Run build, lint, and tests after relevant changes.
