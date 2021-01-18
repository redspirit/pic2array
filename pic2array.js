
const argv = require('minimist')(process.argv.slice(2));
const Jimp = require('jimp');

if(!argv._[0]) {
    return console.log(`Помощь:
Укажите имя картинки для обработки pic2array.js imagename.{jpg|png|bmp|gif}
Доступные опции:
-o генерировать рядом с оригинальным изображением картинку с новой палитрой
-c выводить содержимое массива в stdout`);
}

let imagePath = __dirname + '/' + argv._[0];
let imageArray = [];

let generateImage = argv['o'];
let outputResult = argv['c'];


Jimp.read(imagePath, (err, image) => {

    if(err)
        return console.log(err);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    // image.scan(0, 0, 4, 4, (x, y, idx) => {

        let red = Math.round(image.bitmap.data[idx] / 36);          // 3 bits for Red
        let green = Math.round(image.bitmap.data[idx + 1] / 36);    // 3 bits for Green
        let blue = Math.round(image.bitmap.data[idx + 2] / 85);     // 2 bits for Blue

        // используем бинарные операции для кодирования цвета в 8-бит
        let res = red << 3;
        res |= green;
        res = res << 2;
        res |= blue;
        imageArray.push(res);

        if(generateImage) {
            // создаем картинку с новыми цветами
            image.bitmap.data[idx] = red * 36;
            image.bitmap.data[idx+1] = green * 36;
            image.bitmap.data[idx+2] = blue * 85;
        }

    });

    if(generateImage) {
        image.write(imagePath + '.converted.png');
    }

    console.log(imageArray.map(item => {
        return '0x' + item.toString(16).toUpperCase();
    }));

});


