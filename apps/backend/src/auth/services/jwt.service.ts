import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private defaultOptions: SignOptions;

  constructor(@Inject(ConfigService) private config: ConfigService) {
    this.defaultOptions = {
      algorithm: 'HS512',
      expiresIn: this.config.get('JWTTTL') || 60*15,
      notBefore: 0,
    };
  }

  create(payload: Record<string, any>) {
    return sign(
      payload,
      this.config.getOrThrow('SECRETKEY'),
      this.defaultOptions
    );
  }

}
