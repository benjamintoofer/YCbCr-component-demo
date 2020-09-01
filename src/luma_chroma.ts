
interface ImagePayLoad {
    lumaImageData: ImageData
    chromaRedImageData: ImageData
    chromaBlueImageData: ImageData
}

const matrixRGB2YCbCr = [
    [.257, .504, .098],
    [-.148, -.291, .439],
    [.439, -.368, -.071]
]
const matrixYCbCr2RGB = [
    [1.164, 0, 1.596],
    [1.164, -.392, -.813],
    [1.164, 2.017, 0]
]
const YCbCrOffset = [16, 128, 128]

// TODO: Need to change this so that it uses the sub sampling strategy to determine the width and height of the chroma red/blue image data
export const generateLumaChromaImageData = (data: ImageData): ImagePayLoad => {
    const lumaImageData = new Uint8ClampedArray(data.data.length)
    const chromaRedImageData = new Uint8ClampedArray(data.data.length)
    const chromaBlueImageData = new Uint8ClampedArray(data.data.length)
    for (let i = 0; i < data.data.length; i+=4) {
        const r = data.data[i]
        const g = data.data[i + 1]
        const b = data.data[i + 2]
        const a = data.data[i + 3]
        let y = 0.299 * r + 0.587 * g + 0.114 * b
      
        const rgbVector = [r, g, b]

        const val = multiply(matrixRGB2YCbCr, rgbVector)
       
        const YCrCb = add(YCbCrOffset, val)
        const temp = [(235 - 16) / 2, 128, YCrCb[2]]
        const something = subtract(temp, YCbCrOffset)
       
        const ben = multiply(matrixYCbCr2RGB, something)
        lumaImageData[i] = ben[0]
        lumaImageData[i + 1] = ben[1]
        lumaImageData[i + 2] = ben[2]
        lumaImageData[i + 3] = a

        chromaBlueImageData[i] = 0
        chromaBlueImageData[i + 1] = 0
        chromaBlueImageData[i + 2] = (0.564 * (b - y))
        chromaBlueImageData[i + 3] = a

        chromaRedImageData[i] = 0.713 * (r - y)
        chromaRedImageData[i + 1] = g
        chromaRedImageData[i + 2] = (0.564 * (b - y))
        chromaRedImageData[i + 3] = a
    }
    return {
        lumaImageData: new ImageData(lumaImageData, data.width),
        chromaRedImageData: new ImageData(lumaImageData, data.width),
        chromaBlueImageData: new ImageData(lumaImageData, data.width)
    }
}

export const generateChromeRedImageData = (data: ImageData): ImageData => {

}

export const generateChromeBlueImageData = (data: ImageData): ImageData => {

}

const multiply = (matrixA: number[][], vector: number[]): number[] => {
    return [
        ((matrixA[0][0] * vector[0]) + (matrixA[0][1] * vector[1]) + (matrixA[0][2] * vector[2])),
        ((matrixA[1][0] * vector[0]) + (matrixA[1][1] * vector[1]) + (matrixA[1][2] * vector[2])),
        ((matrixA[2][0] * vector[0]) + (matrixA[2][1] * vector[1]) + (matrixA[2][2] * vector[2])),
    ]
}

const add = (vectorA: number[], vectorB: number[]) => {
    return [
        vectorA[0] + vectorB[0],
        vectorA[1] + vectorB[1],
        vectorA[2] + vectorB[2]
    ]
}

const subtract = (vectorA: number[], vectorB: number[]) => {
    return [
        vectorA[0] - vectorB[0],
        vectorA[1] - vectorB[1],
        vectorA[2] - vectorB[2]
    ]
}