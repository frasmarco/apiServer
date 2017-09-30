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
            console.log(err);
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
const createFile = function(md5, mimeType, name, size, isImage, cb) {
    const query =
        "INSERT INTO file (md5, mime_type, name, size, is_image)\
        VALUES ($1, $2, $3, $4, $5) RETURNING *";
    db.query(query, [md5, mimeType, name, size, isImage], function(err, result) {
        if (err) {
            console.log(err);
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

const setHasThumbnail = function(md5, cb) {
    const query = "UPDATE file SET has_thumbnail = true WHERE md5 = $1 RETURNING *";
    db.query(query, [md5], function(err, result) {
        if (err) {
            console.log(err);
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

const setHasMiniature = function(md5, cb) {
    const query = "UPDATE file SET has_miniature = true WHERE md5 = $1 RETURNING *";
    db.query(query, [md5], function(err, result) {
        if (err) {
            console.log(err);
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
    createFile: createFile,
    setHasThumbnail: setHasThumbnail,
    setHasMiniature: setHasMiniature
};
