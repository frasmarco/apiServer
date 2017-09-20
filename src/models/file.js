// Utility functions for file analysis and persistence.
const db = require("../db");
const fs = require('fs');
const md5 = require("md5");

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
                    createFile(fileMd5, file.mimetype, file.originalname, function(err, result) {
                        if (err) {
                            return cb(err);
                        } else {
                            return cb(false, result);
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
    // TODO : rewrite query to return created row
    const query ="INSERT INTO file (md5, mime_type, file_name) VALUES ($1, $2, $3);";
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
