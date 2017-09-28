// Utility functions for file upload and analysis.
const fs = require("fs");
const crypto = require("crypto");
const mmm = require("mmmagic");
const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
const sharp = require("sharp");
const AWS = require("aws-sdk");
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
            //if (result) return cb(null, fileMd5);
            if (result) return;
            console.log("Md5: " + fileMd5 + "; MimeType: " + mimeTypeResult);
            const params = {
                Bucket: config.aws.bucketName,
                Key: config.aws.documentsPrefix + fileMd5,
                Body: buf,
                ContentType: mimeTypeResult
            };
            const s3 = new AWS.S3({endpoint: new AWS.Endpoint(config.aws.endpoint)});
            const upload = new AWS.S3.ManagedUpload({
                params: params,
                tags: [{Key: "type", Value: "image"}],
                service: s3
            });
            upload.send(function(err, data) {
                if (err) console.log(err);
                else {
                    console.log(
                        "Successfully uploaded data to " +
                            params.Bucket +
                            "/" +
                            params.Key
                    );
                    File.createFile(fileMd5, mimeTypeResult, file.originalname, function(err, result) {
                    });
                    if (isImage(mimeTypeResult)) {
                        makeLowres(buf, fileMd5, file.path);
                    }
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
 * 
 * @param {*} buf 
 */


const makeLowres = function(buf, fileMd5, path) {
    const images = [];
    sharp(buf).metadata().then(function(metadata) {
        if (metadata.height > config.miniatures.maxHeight || metadata.width > config.miniatures.maxWidht ) {
            images.push(makeMiniature(buf, fileMd5, path, metadata.format));
        }
        if(metadata.height > config.thumbnails.maxHeight || metadata.width > config.thumbnails.maxWidht ) {
            images.push(makeThumb(buf, fileMd5, path));
        }
    })
    .then(function() {
        Promise.all(images).then(function(elements) {
            elements.map(function(image) {
            });
        });
    });
};

const makeThumb = function(buf, fileMd5, path) {
    return sharp(buf)
    .resize(config.thumbnails.maxWidht, config.thumbnails.maxHeight)
    .max()
    .toFormat('png')
    .toFile(path + "-" + config.thumbnails.dimensions + ".png");
};

const makeMiniature = function(buf, fileMd5, path, format) {
    format = format == "jpeg" ? "jpeg" : "png";
    console.log(format);
    return sharp(buf)
    .resize(config.miniatures.maxWidht, config.miniatures.maxHeight)
    .max()
    .toFormat(format)
    .toFile(path + "-" + config.miniatures.dimensions + "." + format);
};

const lowresToS3 = function(path, md5) {

    const params = {
        Bucket: config.aws.bucketName,
        Key: config.aws.thumbsPrefix + md5 + "-" + size.dimensions + ".png",
        Body: outputBuffer,
        ContentType: "image/png",
        StorageClass: "REDUCED_REDUNDANCY"
    };
    const s3 = new AWS.S3({endpoint: new AWS.Endpoint(config.aws.endpoint)});
    const upload = new AWS.S3.ManagedUpload({
        params: params,
        tags: [{Key: "type", Value: "image"}],
        service: s3
    });
    upload.send(function(err, data) {
        if (err) console.log(err);
        else {
            console.log(
                "Successfully uploaded data to " +
                    params.Bucket +
                    "/" +
                    params.Key
            );
            //TODO: mark thumb present in db
        }
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
