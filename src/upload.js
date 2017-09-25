// Utility functions for file upload and analysis.
const fs = require("fs");
const crypto = require("crypto");
const mmm = require("mmmagic");
const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
const sharp = require("sharp");
const S3 = require("aws-sdk/clients/s3");
const config = require("../config");
const File = require("./models/file");

/**
 * Handle file upload
 * 
 * @param {function} [cb]
 */
const handleFile = function(file, cb) {
    analyzeFile(file.path, function(fileMd5, mimeTypeResult, buf) {
        File.findByMd5(fileMd5, function(err, result) {
            if (err) return cb(err);
            if (result) return cb(null, fileMd5);
            console.log("Md5: " + fileMd5 + "; MimeType: " + mimeTypeResult);
            const params = {
                Bucket: config.aws.bucketName,
                Key: config.aws.documentsPrefix + fileMd5,
                Body: buf,
                ContentMD5: new Buffer(fileMd5, "hex").toString("base64"),
                ContentType: mimeTypeResult
                //Tagging: "key1=value1&key2=value2",
                //StorageClass: REDUCED_REDUNDANCY
            };
            const s3 = new S3();
            s3.putObject(params, function(err, data) {
            //s3.upload(params, function(err, data) {
                if (err) console.log(err);
                else {
                    console.log(
                        "Successfully uploaded data to " +
                            config.aws.bucketName +
                            "/" +
                            config.aws.documentsPrefix +
                            fileMd5
                    );
                    File.createFile(fileMd5, mimeTypeResult, file.originalname, function(err, result) {
                    });
                }
            });
        });
    });
};

/**
 * Calulates md5 and actual mimeType.
 * If file is a tiff image larger than 10MB compress it.
 * TODO: Warning, if the tiff image cannot be reduced under 10MB
 * we will end in an infinite loop, need to determine if the image is already compressed!
 * 
 * @param {string} path 
 * @param {function} cb
 */
const analyzeFile = function(path, cb) {
    fs.readFile(path, function(err, buf) {
        magic.detect(buf, function(err, mimeTypeResult) {
            if (err) throw err;
            else {
                if (isImage(mimeTypeResult)) {
                    if (mimeTypeResult == "image/tiff" && buf.byteLength > 1024 * 10240) {
                        sharp(buf).metadata().then(function(metadata) {
                            // Sharp tiff options regarding resolution unit of measure
                            // are weird and wrong documented
                            const res = metadata.density ? metadata.density / 2.54 : 72 / 2.54;
                            sharp(buf)
                                .tiff({ compression: "lzw", xres: res, yres: res })
                                .withMetadata()
                                .toBuffer((err, outBuf) => {
                                    if (err) throw err;
                                    else {
                                        // overwrite original file and recursevly call ourself
                                        fs.writeFileSync(path, outBuf);
                                        analyzeFile(path, cb);
                                    }
                                });
                        });
                        return;
                    }
                }
                const hash = crypto.createHash("md5");
                hash.update(buf);
                return cb(hash.digest("hex"), mimeTypeResult, buf);
            }
        });
    });
};

/**
 * Determines whether our file is a valid image type
 * 
 * @param {string} mimeType
 * @return {boolean}
 */

const isImage = function(mimeType) {
    if (config.fileTypes.images.includes(mimeType)) {
        return true;
    } else {
        return false;
    }
};
module.exports = {
    handleFile: handleFile
};
