import * as bcrypto from 'bcryptjs';
import * as Crypto from 'crypto';
import * as RandToken from 'rand-token';
import * as fs from 'fs';
import { Inject, Provide } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';
import { forIn, sortBy } from 'lodash';

const randomToken = RandToken.generator({
  chars: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  source: Crypto.randomBytes,
});

@Provide()
export class Security {
  @Inject()
  logger: ILogger;

  md5(str: string) {
    const md5sum = Crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
  }

  passwordHash(password: string) {
    return bcrypto.hashSync(password, bcrypto.genSaltSync(12));
  }

  passwordVerify(password: string, hash: string) {
    return bcrypto.compareSync(password, hash);
  }

  randomToken(num: number) {
    return randomToken.generate(num);
  }

  parseToken(token: string) {
    return {
      identiacal: token.substring(-9, 0),
      token: token.substring(0, 28),
    };
  }

  fileSha256(file: string) {
    return new Promise((resolve, reject) => {
      const rs = fs.createReadStream(file);
      const hash = Crypto.createHash('sha256');
      rs.on('data', hash.update.bind(hash));
      rs.on('error', e => reject(e));
      rs.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });
  }

  stringSha256(contents) {
    const sha256 = Crypto.createHash('sha256');
    sha256.update(contents);
    return sha256.digest('hex');
  }

  packageHash(jsonData) {}

  qetag(buffer) {}

  sha256AllFiles(files) {}

  uploadPackageType(directoryPath) {}

  isHashIgnored(relativePath) {}

  isPackageHashIgnore(relativePath) {}

  calcAllFileSha256(directoryPath) {}

  sortJsonToArr(json) {
    const rs = [];
    forIn(json, (value, key) => {
      rs.push({ path: key, hash: value });
    });
    return sortBy(rs, o => o.path);
  }
}
