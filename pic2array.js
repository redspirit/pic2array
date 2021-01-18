
const argv = require('minimist')(process.argv.slice(2));
const Jimp = require('jimp');
const fs = require('fs');

if(!argv._[0]) {
    return console.log(`Помощь:
Укажите имя картинки для обработки pic2array.js imagename.{jpg|png|bmp|gif}
Доступные опции:
-o генерировать рядом с оригинальным изображением картинку с новой палитрой
-c выводить содержимое массива в stdout
--limit {n} лимит массива в байтах`);
}

let imagePath = __dirname + '/' + argv._[0];
let imageArray = [];
let limit = +argv['limit'] || 76800;

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

    let arrayContent = `const unsigned char img_data[] PROGMEM={ \n`;

    let i = 0;
    imageArray.length = limit;
    arrayContent += imageArray.map(item => {
        let sep = '';
        if(i === 30) {
            i = 0;
            sep = '\n'
        }
        i++;
        return '0x' + item.toString(16).toUpperCase() + sep;
    }).join();
    arrayContent += `\n};`;

    if(outputResult) {
        console.log(arrayContent);
    } else {
        let arrayFile = imagePath + '.array.txt';
        fs.writeFileSync(arrayFile, arrayContent);
        console.log('Файл записан:' + arrayFile);
    }

});


