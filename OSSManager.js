const oss = require('qiniu');
const axios = require('axios');
const fs = require('fs');

class OSSManager {
  /* 
   * SDK 教程 https://developer.qiniu.com/kodo/1289/nodejs#6
   * API 教程 https://developer.qiniu.com/kodo/3939/overview-of-the-api
   * stream 教程 https://nodejs.org/api/stream.html
   */
  constructor(accessKey, secretKey, bucket) {
    // 定义鉴权对象 mac
    this.mac = new oss.auth.digest.Mac(accessKey, secretKey);

    // 定义存储空间名称
    this.bucket = bucket;

    // 创建 config 对象，指定机房
    this.config = new oss.conf.Config();
    this.config.zone = oss.zone.Zone_z2;  // 华东 z0，华北 z1，华南 z2，北美 na0

    // 创建文件管理对象
    this.bucketManager = new oss.rs.BucketManager(this.mac, this.config);
  }

  /**
   * 所有的 fileName 在 SDK 文档中等同于 key，也就是文件唯一标识符
   * @param { String } fileName 
   */

  /* 文件上传 */
  remoteFileUpload(fileName, localFilePath) {
    // 定义上传凭证
    const options = {
      scope: this.bucket + ":" + fileName  // 同名文件上传覆盖
    };
    const putPolicy = new oss.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);

    // 定义文件上传对象，文件上传可选参数
    const formUploader = new oss.form_up.FormUploader(this.config);
    const putExtra = new oss.form_up.PutExtra();

    // 上传具体方法
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, fileName, localFilePath, putExtra,
        this._callbackWithPromise(resolve, reject));
    });
  }

  /* 文件删除 */
  remoteFileDelete(fileName) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, fileName,
        this._callbackWithPromise(resolve, reject));
    });
  }

  /* 文件下载 */
  async remoteFileDownload(fileName, downloadFilePath) {
    try {
      const downloadLink = await this._generateDownloadLink(fileName);

      // 发送请求，返回可读流
      const response = await axios.get(downloadLink, {
        params: {
          timestamp: new Date().getTime()
        },
        responseType: 'stream',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      // 创建可写流，使用 pipe() 传输
      const writeData = fs.createWriteStream(downloadFilePath);
      response.data.pipe(writeData);

      return new Promise((resolve, reject) => {
        writeData.on('finish', resolve);
        writeData.on('error', reject);
      })
    } catch (error) {
      throw new Error(error);
    }
  }

  /* 生成下载链接 */
  async _generateDownloadLink(fileName) {
    // 获取空间域名
    try {
      const domainNamePromise = this.privateDomainName ? Promise.resolve([this.privateDomainName]) : this._domainNameWithBucket();
      const result = await domainNamePromise;

      // 域名过期返回 []
      if (Array.isArray(result) && result.length) {
        // 域名请求
        const privateBucketDomain = `http://${result[0]}`;

        // 私有文件链接获取
        const deadline = parseInt(Date.now() / 1000) + 3600;  // 1 小时过期，私有授权签名
        const downloadLink = this.bucketManager.privateDownloadUrl(privateBucketDomain, fileName, deadline);
        return downloadLink;
      } else {
        throw new Error('域名过期');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /* 获取 bucket 空间域名 */
  _domainNameWithBucket() {
    // 定义 URL 请求
    const reqURL = `http://uc.qiniuapi.com/v2/domains?tbl=${this.bucket}`;

    // 生成身份验证令牌
    const token = oss.util.generateAccessToken(this.mac, reqURL);

    return new Promise((resolve, reject) => {
      oss.rpc.postWithoutForm(reqURL, token, this._callbackWithPromise(resolve, reject));
    });
  }

  /* 封装回调函数返回 */
  _callbackWithPromise(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      // 抛出错误
      if (respErr) {
        throw new Error(respErr);
      }

      if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody
        });
      }
    };
  }
}

module.exports = OSSManager;