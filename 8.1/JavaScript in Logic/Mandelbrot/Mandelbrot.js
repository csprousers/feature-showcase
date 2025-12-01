import { Bitmap } from "./Bitmap.js";

// Creates a image (BMP) showing a Mandelbrot set.
function createMandelbrotBitmap(width, height) {
    const FILL_RADIUS = 3;

    // create the bitmap and set the background to white
    const bmp = new Bitmap(width, height);
    bmp.fillRect(0, 0, width, height, 255, 255, 255);

    // create the Mandelbrot using a modified version of this algorithm:
    // https://www.reddit.com/r/learnjavascript/comments/xms9pj/very_simple_mandelbrot_in_vanilla_js/
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const dx = (x - 500) / 100000 - 0.233;
            const dy = (y - 500) / 100000 - 0.655;
            let a = dx;
            let b = dy;

            for (let t = 1; t < 200; ++t) {
                const d = (a * a) - (b * b) + dx;
                b = 2 * (a * b) + dy;
                a = d;

                if (d > 200) {
                    bmp.fillRect(x, y, FILL_RADIUS, FILL_RADIUS, Math.min(255, t * 3), t, t * 0.5);
                    break;
                }
            }
        }
    }

    return bmp;
}


// This file is evaluated as a module, so explicitly add createMandelbrotBitmapFile to the global execution context (globalThis).
globalThis.createMandelbrotBitmapFile = function (width, height, bmpFilePath) {
    // create the bitmap
    const bmp = createMandelbrotBitmap(width, height);

    // save it using the Action Invoker
    CS.File.writeBytes({
        path: bmpFilePath,
        bytes: bmp.getBitmapAsHex(),
        bytesFormat: "hex"
    });
};
