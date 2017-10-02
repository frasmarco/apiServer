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


/**
 * Create file in DB
 * 
 * @param {string} md5 
 * @param {string} mimeType 
 * @param {string} name 
 * @param {integer} size 
 * @param {boolean} isImage 
 * @param {string} userId 
 * @param {function} cb 
 */
const createFile = function(md5, mimeType, name, size, isImage, userId, cb) {
    const query =
        "INSERT INTO file (md5, mime_type, name, size, is_image, created_by)\
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    db.query(query, [md5, mimeType, name, size, isImage, userId], function(err, result) {
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

/**
 * Sets to true the has_thumbnail flag
 * 
 * @param {string} md5 
 * @param {function} cb 
 */
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

/**
 * Sets to true the has_miniature flag
 * 
 * @param {UUID} md5 
 * @param {function} cb 
 */
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
