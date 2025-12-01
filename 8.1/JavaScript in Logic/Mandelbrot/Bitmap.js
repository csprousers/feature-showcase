export class Bitmap {

    // Creates a bitmap file of the specified dimensions.
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // the row size is padded to 32-bit
        this.rowSize = Math.floor((24 * width + 31) / 32) * 4;

        // code to allocate the buffer and set the header is modified from a ChatGPT suggestion
        const BmpHeaderSize = 54;
        const pixelArraySize = this.rowSize * height;
        const fileSize = BmpHeaderSize + pixelArraySize;

        this.buffer = new ArrayBuffer(fileSize);
        this.pixels = new Uint8Array(this.buffer, BmpHeaderSize);

        const data = new DataView(this.buffer);
        let offset = 0;

        // BMP File Header (14 bytes)
        data.setUint8(offset++, 0x42); // 'B'
        data.setUint8(offset++, 0x4D); // 'M'
        data.setUint32(offset, fileSize, true); offset += 4; // File size
        data.setUint16(offset, 0, true); offset += 2; // Reserved1
        data.setUint16(offset, 0, true); offset += 2; // Reserved2
        data.setUint32(offset, 54, true); offset += 4; // Pixel data offset

        // DIB Header (40 bytes)
        data.setUint32(offset, 40, true); offset += 4; // DIB header size
        data.setInt32(offset, width, true); offset += 4;
        data.setInt32(offset, height, true); offset += 4;
        data.setUint16(offset, 1, true); offset += 2; // Color planes
        data.setUint16(offset, 24, true); offset += 2; // Bits per pixel
        data.setUint32(offset, 0, true); offset += 4; // Compression (0 = none)
        data.setUint32(offset, pixelArraySize, true); offset += 4; // Image size
        data.setInt32(offset, 2835, true); offset += 4; // X pixels per meter (~72 DPI)
        data.setInt32(offset, 2835, true); offset += 4; // Y pixels per meter
        data.setUint32(offset, 0, true); offset += 4; // Colors used
        data.setUint32(offset, 0, true); offset += 4; // Important colors
    }


    // Returns the contents of the bitmap in hex.
    getBitmapAsHex() {
        return [...new Uint8Array(this.buffer)]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }


    // Sets the value of a pixel.
    setPixel(x, y, red, green, blue) {
        // rows are stored from bottom to top
        const rowOffset = (this.height - 1 - y) * this.rowSize;
        const idx = rowOffset + x * 3;
        this.pixels[idx] = blue;
        this.pixels[idx + 1] = green;
        this.pixels[idx + 2] = red;
    }


    // Fills the rectangle with the provided color.
    fillRect(x, y, fillWidth, fillHeight, red, green, blue) {
        const start_x = Math.max(x, 0);
        const start_y = Math.max(y, 0);
        const end_x = Math.min(x + fillWidth, this.width);
        const end_y = Math.min(y + fillHeight, this.height);

        for (y = start_y; y < end_y; ++y) {
            // rows are stored from bottom to top
            const rowOffset = (this.height - 1 - y) * this.rowSize;

            for (x = start_x; x < end_x; ++x) {
                let idx = rowOffset + x * 3;
                this.pixels[idx] = blue;
                this.pixels[idx + 1] = green;
                this.pixels[idx + 2] = red;
            }
        }
    }
}
