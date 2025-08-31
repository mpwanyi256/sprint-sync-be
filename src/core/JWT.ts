import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { sign, verify } from 'jsonwebtoken';
import { InternalError, BadTokenError, TokenExpiredError } from './ApiErrors';
import { isDev } from '../config';
import Logger from './Logger';

const asyncReadFile = promisify(readFile);

export class JwtPayload {
  aud: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  prm: string;

  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
    this.prm = param;
  }
}

// Resolves possible paths to look for a key file
function resolveKeyPaths(filename: string): string[] {
  if (isDev || process.env.NODE_ENV === 'test') {
    // Local environment
    return [path.join(__dirname, '../../keys/', filename)];
  } else {
    // Production (e.g. Render) - secret files available at these paths
    return [path.join(process.cwd(), filename), `/etc/secrets/${filename}`];
  }
}

// Attempts to read the key from a list of possible paths
async function readKey(possiblePaths: string[]): Promise<string> {
  for (const keyPath of possiblePaths) {
    try {
      const content = await asyncReadFile(keyPath, 'utf8');
      Logger.info(`Successfully loaded key from: ${keyPath}`);
      return content;
    } catch {
      Logger.warn(`Key not found at: ${keyPath}`);
    }
  }
  Logger.error('Failed to read key from all possible paths.');
  throw new InternalError('Failed to read key');
}

async function readPublicKey(): Promise<string> {
  return readKey(resolveKeyPaths('public.pem'));
}

async function readPrivateKey(): Promise<string> {
  return readKey(resolveKeyPaths('private.pem'));
}

async function encode(payload: JwtPayload): Promise<string> {
  const cert = await readPrivateKey();
  if (!cert) throw new InternalError('Token generation failure');
  // @ts-ignore
  return promisify(sign)({ ...payload }, cert, { algorithm: 'RS256' });
}

/**
 * Validates the JWT token and returns the decoded payload if valid
 */
async function validate(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert)) as JwtPayload;
  } catch (e: any) {
    if (e && e.name === 'TokenExpiredError') {
      throw new TokenExpiredError();
    }
    throw new BadTokenError();
  }
}

/**
 * Decodes the token even if it's expired, as long as the signature is valid
 */
async function decode(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert, {
      ignoreExpiration: true,
    })) as JwtPayload;
  } catch {
    throw new BadTokenError();
  }
}

export default {
  encode,
  validate,
  decode,
};
