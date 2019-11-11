
let pixelData = new Map();

window.onload = function () {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let dog_image = new Image();
    dog_image.onload = function() {
        ctx.drawImage(dog_image, 0, 0, 400, 400);
        for (let x = 0; x <= canvas.clientWidth; x++) {
            for (let y = 0; y <= canvas.clientHeight; y++) {
                const data = ctx.getImageData(x, y, 1, 1).data;
                let pixel_info = {
                    R: data[0],
                    G: data[1],
                    B: data[2]
                };
                pixelData.set(`${x}|${y}`, pixel_info);
            }
        }
    };
    dog_image.src = './dog.jpg';

    const buttom = document.getElementById('learn');
    buttom.addEventListener('click', () => {
        printPicture();
    });
}

let counter = 0;

const printPicture = function() {

    let canvas = document.getElementById('canvas-result');
    let ctx = canvas.getContext('2d');

    // const imageData = ctx.createImageData(1, 1);

    const x = Math.floor(Math.random() * 401);
    const y = Math.floor(Math.random() * 401);
    // for (let x = 0; x <= 400; x++) {
    //     for (let y = 0; y <= 400; y++) {
            
    const dataFromWiadomo = pixelData.get(`${x}|${y}`);

            ctx.fillStyle = "rgb(" + dataFromWiadomo.R + ", " + dataFromWiadomo.G + ", " + dataFromWiadomo.B + ")";
            ctx.fillRect(x, y, 1, 1);

            if (counter === 1000) {
                counter = 0;
                window.requestAnimationFrame(printPicture);
            } else {
                counter++;
            }

}

