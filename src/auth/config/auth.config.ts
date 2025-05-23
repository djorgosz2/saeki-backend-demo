import { registerAs } from '@nestjs/config';
import ms from 'ms';

export type AuthConfig = {
  jwt: {
    secret?: string;
    expiresIn?: ms.StringValue;
  };
};

export default registerAs<AuthConfig>('auth', () => {
  return {
    jwt: {
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN as ms.StringValue,
    },
  };
});
