// Utility functions for file upload and analysis.
const fs = require("fs");
const crypto = require("crypto");
const mmm = require("mmmagic");
const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
const sharp = require("sharp");
const S3 = require("aws-sdk/clients/s3");
const s3 = new S3();
const config = require("../config");
const File = require("./models/file");

/**
 * Handle file upload
 * 
 * @param {function} [cb]
 */
const handleFile = function(file, cb) {
    analyzeFile(file, function() {});
};

/**
 * 
 * @param {Express.Multer.File} file 
 * @param {function} cb 
 */
const analyzeFile = function(file, cb) {
    fs.readFile(file.path, function(err, buf) {
        const hash = crypto.createHash("md5");
        hash.update(buf);
        const fileMd5 = hash.digest("hex");
        console.log(fileMd5);
        magic.detect(buf, function(err, mimeTypeResult) {
            if (err) throw err;
            else {
                console.log("mimeType: " + mimeTypeResult);
                if (isImage(mimeTypeResult)) {
                    if (mimeTypeResult == "image/tiff" && buf.byteLength > 1024 * 10240) {
                        sharp(buf).metadata().then(function(metadata) {
                            const res = metadata.density ? metadata.density / 2.54 : 72 / 2.54;
                            sharp(buf)
                                .tiff({ compression: "lzw", xres: res, yres: res })
                                .withMetadata()
                                .toBuffer(function(err, buf) {
                                    if (err) throw err;
                                    else {
                                        fs.writeFile(file.path + "saved", buf);
                                    }
                                });
                        });
                    }
                    sharp(buf).metadata().then(function(metadata) {
                        console.log(metadata);
                    });
                }
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
