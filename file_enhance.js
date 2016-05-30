/**
 *	\r 会换行,\n 会换行
 * 	\r 后面接\n 只会换一行 （\r\n的组合只会换一行）
 *  \n 后面接\r 会换两行
 *  编辑文件的时候的 两行之间是\n,(测试这个atom 是这个样子)
 *  linux,unix: \r\n
 *  windows : \n  这三个是在网上找的,有点懵逼了
 *  Mac OS ： \r
 */

var fs = require('fs');

function File(path) {
    var that = this;
    // 使用同步模式读取
    this.data = fs.readFileSync(path, 'utf8');
    this.length = this.data.length;
    this.readLine = readLine;
    // 当前读取的游标位置
    this.current_cursor = 0;
    // 这个lines 如果合并在一起就相当于data
    this.lines = [];
}

exports.File = File;

function Line() {

}

function cacheAllLines() {
    while (this.current_cursor < this.length) {
        lines.push(readLine());
    }
}

/**
 * 读取文件中的一行,如果没有指定参数,会读取当前所在行
 * (如果一次都没有调用的时候,读取的就是第一行,此后调用的时候,就是上一次读取后的下一行)
 *
 * (这个方法读取完的内容,在保存到别的文件中时,于原文件读取的行数,内容,是一样的)
 * @return {[type]} [description]
 */
function readLine() {
    if (this.current_cursor < this.length) {
        var temp_cursor = this.current_cursor;
        this.current_cursor = this.data.indexOf('\n', temp_cursor) + 1;
        return this.data.substring(temp_cursor, this.current_cursor);
    } else {

    }

}
