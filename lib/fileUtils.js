var fs = require('fs');
var Q = require('q');
var os_path = require('path');
var config = require('../config');

var logger = require('../common/logger');

/**
 * 此方法可以跨目录保存文件(请勿使用相对路径)
 * @param  {[type]} path    [description]
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
exports.saveNewFile = function(path, content) {

    if (!os_path.isAbsolute(path)) {
        if (config.projectPath !== undefined && os_path.isAbsolute(config.projectPath)) {
            logger.warn('you are saving file in a relative path,i have put it in project path');
            path = os_path.join(config.projectPath, os_path.basename(path));
        } else {
            throw new FileEnhanceException('path can\'t a relative path');
        }
    }

    path = exports.assertRelative(path);
    var deferred = Q.defer();

    var reg = /^.*\//;
    var dir = reg.exec(path);
    mkdir(dir[0].substring(0, dir[0].length - 1), function() {
        /**
         * 只会自动创建文件 不会自动创建目录
         */
        fs.writeFile(path, content, function(err) {
            if (err) {
                logger.info(path + '文件保存失败');
                logger.info(err);
                if (err) deferred.reject(err);
            } else {
                logger.info(path + '文件保存成功');
                deferred.resolve();
            }
        });
    });

    return deferred.promise;
};

/**
 * 文件的目录不能以相对目录(因为操作文件的时都是在这些文件的方法中操作的)
 * 如果是相对目录会直接报错
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
exports.assertRelative = function(path) {

    if (!os_path.isAbsolute(path)) {
        throw new FileEnhanceException('path can\'t a relative path');
    } else {
        return null;
    }

};

function FileEnhanceException(message) {
    this.message = message;
    this.name = 'FileEnhanceException';
}

exports.appendFile = function(path, data) {
    exports.assertRelative(path);
    var deferred = Q.defer();
    fs.appendFile(path, data, 'utf8', function(err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};

exports.watch = function(path, listener) {
    exports.assertRelative(path);
    fs.watch(path, function(event, filename) {
        // event is either rename,change
        if (undefined !== listener) {
            listener(event, filename);
        }
    });
};

exports.exists = function(path, callback) {
    exports.assertRelative(path);
    var deferred = Q.defer();
    fs.access(path, fs.F_OK, (err) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;

    // fs.stat(path, function(err, stats) {
    //     if (err) {
    //         callback(false);
    //         // if (err.errno === -2) {
    //         //     // 文件不存在
    //         //     callback(false);
    //         // }
    //     } else {
    //         // 文件存在
    //         callback(true);
    //     }
    // });
};

/**
 * 此方法可以中间跨目录创建文件
 *
 *  nodejs已经存在的路径再次创建会报错，java好像不会
 * nodejs创建多层级会报错,java也会报错(不让中间跨目录是怕并发操作出问题么)
 * @param  {[type]}   path     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var mkdir = function(path, callback) {
    exports.assertRelative(path);
    fs.mkdir(path, function(err) {
        if (null === err) {
            // 创建成功了
            callback();
        } else {
            // console.log(err);
            if (err.errno === -17) {
                callback();
            } else {
                var reg = /^.*\//;
                var dir = reg.exec(path);
                if (null === dir) {

                } else {
                    mkdir(dir[0].substring(0, dir[0].length - 1), function() {
                        mkdir(path, callback);
                    });
                }
            }
        }
    });
};

exports.mkdir = mkdir;

exports.readFile = function(path, callback) {
    exports.assertRelative(path);
    fs.readFile(path, (err, data) => {
        callback(err, data);
    });
};

exports.readFileSync = function(path) {
    exports.assertRelative(path);
    return fs.readFileSync(path, 'utf-8');
};
