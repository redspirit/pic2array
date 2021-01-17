
let argv = require('minimist')(process.argv.slice(2));
const Jimp = require('jimp');

let imagePath = __dirname + '/' + argv._[0];
let imageArray = [];


Jimp.read(imagePath, (err, image) => {

    if(err)
        return console.log(err);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    // image.scan(0, 0, 4, 4, (x, y, idx) => {

        let red = Math.round(image.bitmap.data[idx] / 36);          // 3 bits for Red
        let green = Math.round(image.bitmap.data[idx + 1] / 36);    // 3 bits for Green
        let blue = Math.round(image.bitmap.data[idx + 2] / 85);     // 2 bits for Blue

        let res = red << 3;
        res |= green;
        res = res << 2;
        res |= blue;
        imageArray.push(res);

    });

    console.log(imageArray.map(item => {
        return '0x' + item.toString(16).toUpperCase();
    }));

});


