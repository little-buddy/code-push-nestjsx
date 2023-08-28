import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as extractZip from 'extract-zip';
import * as jschardet from 'jschardet';
import { Inject, Provide } from '@midwayjs/core';
import { ILogger } from '@midwayjs/logger';
import { eq, isEmpty } from 'lodash';
import AliYunSdk from 'aliyun-sdk';
import AliYunOssStream from 'aliyun-oss-upload-stream';
import * as COS from 'cos-nodejs-sdk-v5';
import * as AWS from 'aws-sdk';
import * as qiniu from 'qiniu';
import upyun from 'upyun';

import { AppError } from '@/error/index.error';
import { HttpService } from '@midwayjs/axios';
import { createVersionSerial, strNumInc } from '@/utils';
import { QINIU_BUCKET_MANAGER, getUploadTokenQiniu } from '@/utils/qiniu';

let AliYunClient = null;
let TencentYunClient = null;
let AwsClient = null;
let UpClient = null;

@Provide()
export class FileUtil {
  @Inject()
  logger: ILogger;

  @Inject()
  httpService: HttpService;

  detectIsTextFile(filePath: string): boolean {
    const buffer = Buffer.alloc(4096);
    const fd: number = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4096, 0);
    fs.closeSync(fd);
    // detect text
    const rs: jschardet.IDetectedMap = jschardet.detect(buffer);
    this.logger.debug('detectIsTextFile:', filePath, rs);

    return rs.confidence === 1;
  }
  /*
    bit------
    major {3}
    minor {5}
    patch {10}
   */
  parseVersion(versionNo: string): string {
    let version = '0';
    let data = null;
    if ((data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/))) {
      // "1.2.3"
      version = createVersionSerial(data[1], data[2], data[3]);
    } else if ((data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5})$/))) {
      // "1.2"
      version = createVersionSerial(data[1], data[2], '0');
    }
    return version;
  }

  /* min <= version < max */
  validatorVersion(versionNo: string): any[] {
    let flag = true;
    let min = '0';
    let max = 1 + '0'.repeat(18); /* not belong */
    let data: any = null;
    if ((data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/))) {
      // "1.2.3"
      min = createVersionSerial(data[1], data[2], data[3]);
      max = createVersionSerial(data[1], data[2], strNumInc(data[3]));
    } else if (
      (data = versionNo.match(/^([0-9]{1,3}).([0-9]{1,5})(\.\*){0,1}$/))
    ) {
      // "1.2" "1.2.*"
      min = createVersionSerial(data[1], data[2], '0');
      max = createVersionSerial(data[1], strNumInc(data[2]), '0');
    } else if (
      // eslint-disable-next-line no-useless-escape
      (data = versionNo.match(/^\~([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/))
    ) {
      //"~1.2.3"
      min = createVersionSerial(data[1], data[2], data[3]);
      max = createVersionSerial(data[1], strNumInc(data[2]), '0');
    } else if (
      (data = versionNo.match(/^\^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/))
    ) {
      //"^1.2.3"
      min = createVersionSerial(data[1], data[2], data[3]);
      max = createVersionSerial(strNumInc(data[1]), '0', '0');
    } else if (
      (data = versionNo.match(
        /^([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})\s?-\s?([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/
      ))
    ) {
      // "1.2.3 - 1.2.7"
      min = createVersionSerial(data[1], data[2], data[3]);
      max = createVersionSerial(data[4], data[5], strNumInc(data[6]));
    } else if (
      (data = versionNo.match(
        /^>=([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})\s?<([0-9]{1,3}).([0-9]{1,5}).([0-9]{1,10})$/
      ))
    ) {
      // ">=1.2.3 <1.2.7"
      min = createVersionSerial(data[1], data[2], data[3]);
      max = createVersionSerial(data[4], data[5], data[6]);
    } else if (versionNo !== '*') {
      flag = false;
    }
    return [flag, min, max];
  }

  async createFileFromRequest(url: string, filePath: string): Promise<void> {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return;
    }

    this.logger.debug(`createFileFromRequest url:${url}`);
    const response = await this.httpService.get(url, {
      responseType: 'stream',
    });
    const stream = fs.createWriteStream(filePath);
    response.data.pipe(stream);
    await new Promise((resolve, reject) => {
      stream.on('close', resolve);
      stream.on('error', e => reject(e));
    });
  }

  copy(sourceDst: string, targertDst: string) {
    fsExtra.copySync(sourceDst, targertDst);
  }

  move(sourceDst: string, targertDst: string) {
    fsExtra.moveSync(sourceDst, targertDst);
  }

  deleteFolder(folderPath: string) {
    fsExtra.removeSync(folderPath);
  }

  createEmptyFolder(folderPath) {
    const state = fs.statSync(folderPath);
    if (state.isDirectory()) {
      this.deleteFolder(folderPath);
      this.logger.debug(`Delete the original directory ${folderPath} success.`);
    }
    fsExtra.mkdirSync(folderPath);
  }

  async upzipFile(zipFile: string, outputPath: string) {
    try {
      this.logger.debug(`unzipFile check zipFile ${zipFile} fs.R_OK`);
      fs.accessSync(zipFile, fs.constants.R_OK);
      this.logger.debug(`Pass unzipFile file ${zipFile}`);
      await extractZip(zipFile, { dir: outputPath });
      return true;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  // what's meaning with key ?
  uploadFileToStorage(key: string, filePath: string) {
    switch (process.env.STORAGE_TYPE) {
      case 's3':
        this.uploadFileToS3(key, filePath);
        break;
      case 'oss':
        this.uploadFileToOSS(key, filePath);
        break;
      case 'qiniu':
        this.uploadFileToQiniu(key, filePath);
        break;
      case 'upyun':
        this.uploadFileToUpyun(key, filePath);
        break;
      case 'tencentcloud':
        this.uploadFileToUpyun(key, filePath);
        break;
      default:
        this.uploadFiletoLocal(key, filePath);
    }
  }

  uploadFiletoLocal(key: string, filepath: string) {
    const storageDir = process.env.STORAGE_DIR;
    if (!storageDir) {
      throw new AppError('Please set local storageDir');
    }

    if (key.length < 3) {
      this.logger.error(`generate key is too short, key value:${key}`);
      throw new Error('generate key is too short.');
    }

    if (!fs.statSync(filepath).isFile()) {
      throw new AppError(`${filepath} must be file`);
    }

    // check Stroage Dir
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir);
      this.logger.debug(`StorageDir mkdir:${storageDir}`);
    } else if (fs.statSync(storageDir).isFile()) {
      fs.unlinkSync(storageDir);
      fs.mkdirSync(storageDir);
      this.logger.debug(`StorageDir mkdir:${storageDir}`);
    }

    const subDir = key.substring(0, 2).toLowerCase();
    const finalDir = path.join(storageDir, subDir);
    const fileName = path.join(finalDir, key);

    if (fs.existsSync(fileName)) {
      return key;
    }
    if (!fs.existsSync(`${finalDir}`)) {
      fs.mkdirSync(`${finalDir}`);
      this.logger.debug(`uploadFileToLocal mkdir:${finalDir}`);
    }

    fs.copyFileSync(filepath, fileName);
    this.logger.debug(`uploadFileToLocal copy file ${key} success.`);
    return key;
  }

  uploadFileToQiniu(key: string, filePath: string): Promise<string> {
    const bucket = process.env.QINIU_BUCKET_NAME;

    return new Promise((resolve, reject) => {
      QINIU_BUCKET_MANAGER.stat(bucket, key, (respErr, respBody, respInfo) => {
        if (respErr) {
          this.logger.debug('uploadFileToQiniu file stat:' + respErr);
          reject(new AppError(respErr.message));
          return;
        }
        this.logger.debug('uploadFileToQiniu file stat respBody:' + respBody);
        this.logger.debug('uploadFileToQiniu file stat respInfo:' + respInfo);
        if (respInfo.statusCode === 200) {
          resolve(respBody.hash);
          return;
        }

        const formUploader = new qiniu.form_up.FormUploader(
          new qiniu.conf.Config()
        );
        const putExtra = new qiniu.form_up.PutExtra();
        formUploader.putFile(
          getUploadTokenQiniu(key),
          key,
          filePath,
          putExtra,
          (respErr, respBody, respInfo) => {
            if (respErr) {
              this.logger.error('uploadFileToQiniu putFile:' + respErr);
              reject(new AppError(JSON.stringify(respErr.message)));
              return;
            }

            if (respInfo.statusCode !== 200) {
              this.logger.error(
                'Qiniu upload response error:' + respInfo.statusCode
              );
              reject(respBody.error);
            }

            this.logger.debug(
              `uploadFileToQiniu putFile respBody: ${respBody}`
            );
            this.logger.debug(
              `uploadFileToQiniu putFile respInfo: ${respInfo}`
            );
            resolve(respBody.hash);
          }
        );
      });
    });
  }
  // 又拍云
  async uploadFileToUpyun(key: string, filePath: string) {
    if (!UpClient) {
      const serviceName = process.env.UPYUN_SERVICE_NAME;
      const operatorName = process.env.UPYUN_OPERATOR_NAME;
      const operatorPass = process.env.UPYUN_OPERATOR_PASS;
      const service = new upyun.Service(
        serviceName,
        operatorName,
        operatorPass
      );
      UpClient = new upyun.Client(service);
    }

    const storageDir = process.env.UPYUN_STORAGE_DIR;

    if (!storageDir) {
      throw new AppError('Please config the upyun remoteDir!');
    }

    try {
      const result = await UpClient.makeDir(storageDir);
      const remotePath = path.join(storageDir, key);
      this.logger.debug('uploadFileToUpyun remotePath:' + remotePath);
      this.logger.debug('uploadFileToUpyun mkDir result:' + result);

      const data = await UpClient.putFile(
        remotePath,
        fs.createReadStream(filePath)
      );

      this.logger.debug('uploadFileToUpyun putFile response:' + data);
      if (data) {
        return key;
      } else {
        this.logger.debug('uploadFileToUpyun putFile failed!' + data);
        throw new AppError('Upload file to upyun failed!');
      }
    } catch (e) {
      this.logger.debug(`uploadFileToUpyun putFile exception e:, ${e}`);
      throw new AppError(JSON.stringify(e));
    }
  }

  uploadFileToS3(key, filePath) {
    if (!AwsClient) {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
        region: process.env.AWS_REGIN,
      });
      AwsClient = new AWS.S3({
        params: { Bucket: process.env.AWS_BUCKET_NAME },
      });
    }
    return new Promise((resolve, reject) => {
      const data = fs.readFileSync(filePath);
      AwsClient.upload(
        {
          Key: key,
          Body: data,
          ACL: 'public-read',
        },
        (err, response) => {
          if (err) {
            reject(new AppError(JSON.stringify(err)));
          } else {
            resolve(response.ETag);
          }
        }
      );
    });
  }

  uploadFileToOSS(key: string, filePath: string) {
    // config aliyun
    if (!AliYunClient) {
      AliYunClient = true;
      AliYunOssStream(
        new AliYunSdk.OSS({
          accessKeyId: process.env.OSS_ACCESS_KEY_ID,
          secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY,
          endpoint: process.env.OSS_END_POINT,
          apiVersion: '2013-10-15',
        })
      );
    }

    if (process.env.OSS_PREFIX) {
      key = `${process.env.OSS_PREFIX}/${key}`;
    }

    // TODO 总感觉怪怪的
    const uploader = AliYunOssStream.upload({
      Bucket: process.env.OSS_BUCKET_NAME,
      Key: key,
    });

    fs.createReadStream(filePath).pipe(uploader);

    return new Promise((resolve, reject) => {
      uploader.on('error', error => {
        this.logger.debug(`uploadFileToOSS: ${error}`);
        reject(error);
      });

      uploader.on('uploaded', details => {
        this.logger.debug(`uploadFileToOSS: ${details}`);
        resolve(details.ETag);
      });
    });
  }

  uploadFileToTencentCloud(key, filePath) {
    if (!TencentYunClient) {
      TencentYunClient = new COS({
        SecretId: process.env.TXC_ACCESS_KEY_ID,
        SecretKey: process.env.TXC_SECRET_ACCESS_KEY,
      });
    }
    return new Promise((resolve, reject) => {
      TencentYunClient.sliceUploadFile(
        {
          Bucket: process.env.TXC_BUCKET_NAME,
          Region: process.env.TXC_REGION,
          Key: key,
          FilePath: filePath,
        },
        (err, data) => {
          this.logger.debug('uploadFileToTencentCloud', err, data);
          if (err) {
            reject(new AppError(JSON.stringify(err)));
          } else {
            resolve(data.Key);
          }
        }
      );
    });
  }

  diffCollections(collection1, collection2) {
    const diffFiles = [];
    const collection1Only = [];
    const newCollection2 = { ...collection2 };

    if (collection1 instanceof Object) {
      for (const key of Object.keys(collection1)) {
        if (isEmpty(newCollection2[key])) {
          collection1Only.push(key);
        } else {
          if (!eq(collection1[key], newCollection2[key])) {
            diffFiles.push(key);
          }
          delete newCollection2[key];
        }
      }
    }

    return {
      diff: diffFiles,
      collection1Only,
      collection2Only: Object.keys(newCollection2),
    };
  }
}
