import * as qiniu from 'qiniu';

const QINIU_BUCKET = process.env.QINIU_BUCKET;
const QINIU_MAC = new qiniu.auth.digest.Mac(
  process.env.QINIU_ACCESS_KEY,
  process.env.QINIU_SECRET_KEY
);
const QINIU_CONFIG = new qiniu.conf.Config();
export const QINIU_BUCKET_MANAGER = new qiniu.rs.BucketManager(
  QINIU_MAC,
  QINIU_CONFIG
);

export const getUploadTokenQiniu = (key: string) => {
  const options = {
    scope: QINIU_BUCKET + ':' + key,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(QINIU_MAC);
};
