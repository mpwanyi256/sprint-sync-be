import crypto from 'crypto';

export interface TokenPair {
  accessKey: string;
  refreshKey: string;
}

export class TokenFactory {
  private static readonly TOKEN_LENGTH = 64;
  private static readonly ENCODING = 'hex';

  static createAccessTokenKey(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString(this.ENCODING);
  }

  static createRefreshTokenKey(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString(this.ENCODING);
  }

  static createTokenPair(): TokenPair {
    return {
      accessKey: this.createAccessTokenKey(),
      refreshKey: this.createRefreshTokenKey(),
    };
  }

  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const expectedLength = this.TOKEN_LENGTH * 2;
    const hexPattern = /^[a-f0-9]+$/i;

    return token.length === expectedLength && hexPattern.test(token);
  }
}
