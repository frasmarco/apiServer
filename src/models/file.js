// Utility functions for file persistence.
const db = require("../db");

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
    const query = "INSERT INTO file (md5, mime_type, file_name) VALUES ($1, $2, $3) RETURNING *";
    db.query(query, [md5, mimeType, fileName], function(err, result) {
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
    findByMd5: findByMd5,
    createFile: createFile
};
