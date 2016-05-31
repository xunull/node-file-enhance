var fs = require('fs');
var Q = require('q');
var os_path = require('path');

var logger = require('./common/logger');

/**
 * 此方法可以跨目录保存文件(请勿使用相对路径)
 * @param  {[type]} path    [description]
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
exports.saveNewFile = function(path, content) {
    assertRelative(path);
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
    }

};

function FileEnhanceException(message) {
    this.message = message;
    this.name = 'FileEnhanceException';
}

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
    assertRelative(path);
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
