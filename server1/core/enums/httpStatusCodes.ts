import { HttpStatusCode } from 'axios';

enum CustomStatusCodes {
  ExternalDependencyError = 520,
}

export const HttpStatusCodes = {
  ...HttpStatusCode,
  ...CustomStatusCodes,
};
