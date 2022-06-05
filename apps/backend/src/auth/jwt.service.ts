import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign, SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  @Inject(ConfigService)
  private config: ConfigService;

  private defaultOptions: SignOptions = {
    algorithm: 'RS256'
  };

  create(payload: Record<string, any>) {
    console.log(this.config.getOrThrow('SECRETKEY'));
    return sign(payload, this.config.getOrThrow('SECRETKEY'), this.defaultOptions);
  }
}
