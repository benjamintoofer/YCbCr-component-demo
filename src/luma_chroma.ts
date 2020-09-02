import { SamplingType } from "./sampling_type"
import { debug } from "console"

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

const getChromaArraySizeFromSamplingType = (length: number, samplingType: SamplingType) => {
    switch (samplingType) {
        case SamplingType.FOUR_FOUR_FOUR:
            return length
        case SamplingType.FOUR_TWO_TWO:
            return Math.floor(length / 2)
        case SamplingType.FOUR_TWO_ZERO:
            return Math.floor(length / 4)
        default:
            return length
    }
}

const getChromaRowDivisor = (samplingType: SamplingType) => {
    if (samplingType === SamplingType.FOUR_TWO_ZERO) {
        return 2
    } else {
        return 1
    }
}

const getChromaColDivisor = (samplingType: SamplingType) => {
    if (samplingType === SamplingType.FOUR_FOUR_FOUR) {
        return 1
    } else {
        return 2
    }
}

// TODO: Need to change this so that it uses the sub sampling strategy to determine the width and height of the chroma red/blue image data
export const generateLumaChromaImageData = (data: ImageData, samplingType: SamplingType): ImagePayLoad => {
    const lumaArraySize = data.data.length
    const chromaArraySize = getChromaArraySizeFromSamplingType(data.data.length, samplingType)
    const lumaImageData = new Uint8ClampedArray(lumaArraySize)
    const chromaRedImageData = new Uint8ClampedArray(chromaArraySize)
    const chromaBlueImageData = new Uint8ClampedArray(chromaArraySize)
    const PIXEL_DATA_SIZE = 4
    const colDivisor = getChromaColDivisor(samplingType)
    const rowDivisor = getChromaRowDivisor(samplingType)
    const chromaRowWidth = Math.floor(data.width / colDivisor)
    
    for (let i = 0; i < data.data.length; i += PIXEL_DATA_SIZE) {
        const row = Math.floor((i / PIXEL_DATA_SIZE) / data.width)
        const col = (i / PIXEL_DATA_SIZE)  % data.width

        const r = data.data[i]
        const g = data.data[i + 1]
        const b = data.data[i + 2]
        const a = data.data[i + 3]
      
        const rgbVector = [r, g, b]
        const YCrCbVector = multiply(matrixRGB2YCbCr, rgbVector)
        const YCrCbVectorWithOffset = add(YCbCrOffset, YCrCbVector)

        let vector = [YCrCbVectorWithOffset[0], 128, 128]
        let vectorWithoutOffset = subtract(vector, YCbCrOffset)
        let newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

        lumaImageData[i] = newRGBVector[0]
        lumaImageData[i + 1] = newRGBVector[1]
        lumaImageData[i + 2] = newRGBVector[2]
        lumaImageData[i + 3] = a

        if (col % colDivisor === 0 && row % rowDivisor === 0) {
            const newRow = Math.floor(row / rowDivisor)
            const newCol = Math.floor(col / colDivisor)
            const newIndex = ((newRow * chromaRowWidth) + newCol) * PIXEL_DATA_SIZE
            vector = [128, YCrCbVectorWithOffset[1], 128]
            vectorWithoutOffset = subtract(vector, YCbCrOffset)
            newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

            chromaBlueImageData[newIndex] = newRGBVector[0]
            chromaBlueImageData[newIndex + 1] = newRGBVector[1]
            chromaBlueImageData[newIndex + 2] = newRGBVector[2]
            chromaBlueImageData[newIndex + 3] = a

            vector = [128, 128, YCrCbVectorWithOffset[2]]
            vectorWithoutOffset = subtract(vector, YCbCrOffset)
            newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

            chromaRedImageData[newIndex] = newRGBVector[0]
            chromaRedImageData[newIndex + 1] = newRGBVector[1]
            chromaRedImageData[newIndex + 2] = newRGBVector[2]
            chromaRedImageData[newIndex + 3] = a
        }
    }
    console.warn(chromaRedImageData.length)
    console.warn(chromaRowWidth)
    return {
        lumaImageData: new ImageData(lumaImageData, data.width),
        chromaRedImageData: new ImageData(chromaRedImageData, chromaRowWidth),
        chromaBlueImageData: new ImageData(chromaBlueImageData, chromaRowWidth)
    }
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