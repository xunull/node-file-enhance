var readLine = require('readLine');
var fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('sample.txt')
});

rl.on('line', (line) => {
  console.log('Line from file:', line);
});
