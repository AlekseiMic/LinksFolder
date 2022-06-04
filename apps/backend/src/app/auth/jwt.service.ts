import { Injectable } from "@nestjs/common";
import { sign, SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {

  private privateKey = 'very_secret_key';

  private defaultOptions: SignOptions = {
    algorithm: 'RS256'
  };

  create(payload: Record<string, any>) {
    return sign(payload, this.privateKey, this.defaultOptions);
  }
}
