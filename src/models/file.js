// Utility functions for file analysis and persistence.
const db = require("../db");
const fs = require('fs');
const md5 = require("md5");
const mmm = require('mmmagic');
const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

/**
 * Handle file upload
 * 
 * @param {function} [cb]
 */
const handleFile = function(file, cb) {
    console.log(file);
    fs.readFile(file.path, function(err, buf) {
        const fileMd5 = md5(buf);
        findByMd5(fileMd5, function(err, result){
            if (err) {
                return cb(err);
            } else {
                if (result) {
                    // file is already in db!
                    return(false, fileMd5);
                } else {
                    magic.detect(buf, function(err, mimeTypeResult) {
                        if (err) throw err;
                        else {
                            createFile(fileMd5, mimeTypeResult, file.originalname, function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                    return fileMd5;
                                }
        
                            });
                        }
                        
                    });
                    return(false, fileMd5);
                }
            }

        });
      });
};

/**
 * Find a file knowing his md5 (UUID)
 *
 * @param {UUID} [md5]
 * @param {function} [cb]
 */
const findByMd5 = function(md5, cb) {
    db.query("SELECT * FROM file WHERE md5 = $1", [md5], function(err, result) {
        if (err) {
            return cb(err);
        } else {
            if (result.rowCount == 0) {
                return cb(null, false);
            } else {
                return cb(null, result.rows[0]);
            }
        }
    });
};


// Create file in DB
const createFile = function(md5, mimeType, fileName, cb) {
    const query ="INSERT INTO file (md5, mime_type, file_name) VALUES ($1, $2, $3) RETURNING *";
    db.query(query, [md5, mimeType, fileName], function(
        err,
        result
    ) {
        if (err) {
            return cb(err);
        } else {
            if (result.rowCount == 0) {
                return cb(null, false);
            } else {
                return cb(null, result.rows[0]);
            }
        }
    });
};



module.exports = {
    handleFile: handleFile,
    findByMd5: findByMd5,
    createFile: createFile
};
