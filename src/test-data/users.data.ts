export type UserCredentials = { username: string; password: string };

export type UserRoles = {
  valid: UserCredentials;
  invalidUsername: UserCredentials;
  invalidPassword: UserCredentials;
};

const usersByEnv: Record<string, UserRoles> = {
  local: {
    valid: { username: 'student', password: 'Password123' },
    invalidUsername: { username: 'incorrectUser', password: 'Password123' },
    invalidPassword: { username: 'student', password: 'incorrectPassword' },
  },
  staging: {
    valid: {
      username: process.env.STANDARD_USER!,
      password: process.env.STANDARD_PASSWORD!,
    },
    invalidUsername: {
      username: process.env.INVALID_USER!,
      password: process.env.STANDARD_PASSWORD!,
    },
    invalidPassword: {
      username: process.env.STANDARD_USER!,
      password: process.env.INVALID_PASSWORD!,
    },
  },
};

const env = process.env.TEST_ENV || 'local';
export const users: UserRoles = usersByEnv[env] ?? usersByEnv.local;
