import { SamplingType } from "./sampling_type"

const PIXEL_DATA_SIZE = 4
const CR_CB_OFFSET = 128

export interface LumaChromaComponentImageData {
    lumaImageData: ImageData
    chromaRedImageData: ImageData
    chromaBlueImageData: ImageData
    resultImageData: ImageData
}

interface LumaChromaModifiers {
    lumaModifier: number,
    cbModifier: number,
    crModifier: number,
}

// Matrix to transform RGB coordinates to YCbCr coordinates
const matrixRGB2YCbCr = [
    [.257, .504, .098],
    [-.148, -.291, .439],
    [.439, -.368, -.071]
]

// Matrix to transform YCbCr coordinates to RGB coordinates
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
export const generateLumaChromaImageData = (data: ImageData, samplingType: SamplingType, modifiers: LumaChromaModifiers): LumaChromaComponentImageData => {
    const { lumaModifier, cbModifier, crModifier } = modifiers
    const lumaArraySize = data.data.length
    const chromaArraySize = getChromaArraySizeFromSamplingType(data.data.length, samplingType)
    const resultImageData = new Uint8ClampedArray(lumaArraySize)
    const lumaImageData = new Uint8ClampedArray(lumaArraySize)
    const chromaRedImageData = new Uint8ClampedArray(chromaArraySize)
    const chromaBlueImageData = new Uint8ClampedArray(chromaArraySize)
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

        const lumaValue = Math.min(YCrCbVectorWithOffset[0] + lumaModifier, 235)
        let vector = [lumaValue, 128, 128]
        let vectorWithoutOffset = subtract(vector, YCbCrOffset)
        let newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

        lumaImageData[i] = newRGBVector[0]
        lumaImageData[i + 1] = newRGBVector[1]
        lumaImageData[i + 2] = newRGBVector[2]
        lumaImageData[i + 3] = a
        
        let cbValue = CR_CB_OFFSET
        let crValue = CR_CB_OFFSET

        if (isValidColAndRow(col, row, colDivisor, rowDivisor)) {
            const newRow = Math.floor(row / rowDivisor)
            const newCol = Math.floor(col / colDivisor)
            const chromaIndex = ((newRow * chromaRowWidth) + newCol) * PIXEL_DATA_SIZE
            cbValue = Math.min(YCrCbVectorWithOffset[1] + cbModifier, 240)
            vector = [CR_CB_OFFSET, cbValue, CR_CB_OFFSET]
            vectorWithoutOffset = subtract(vector, YCbCrOffset)
            newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

            chromaBlueImageData[chromaIndex] = newRGBVector[0]
            chromaBlueImageData[chromaIndex + 1] = newRGBVector[1]
            chromaBlueImageData[chromaIndex + 2] = newRGBVector[2]
            chromaBlueImageData[chromaIndex + 3] = a

            crValue = Math.min(YCrCbVectorWithOffset[2] + crModifier, 240)
            vector = [CR_CB_OFFSET, CR_CB_OFFSET, crValue]
            vectorWithoutOffset = subtract(vector, YCbCrOffset)
            newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

            chromaRedImageData[chromaIndex] = newRGBVector[0]
            chromaRedImageData[chromaIndex + 1] = newRGBVector[1]
            chromaRedImageData[chromaIndex + 2] = newRGBVector[2]
            chromaRedImageData[chromaIndex + 3] = a

            const temp = [lumaValue, cbValue, crValue]
            vectorWithoutOffset = subtract(temp, YCbCrOffset)
            newRGBVector = multiply(matrixYCbCr2RGB, vectorWithoutOffset)

        } else {
            let index = 0
            // find nearest pixel
            if (isValidColAndRow(col - 1, row, colDivisor, rowDivisor)) {
                const newRow = row
                const newCol = col - 1
                index = ((newRow * data.width) + newCol) * PIXEL_DATA_SIZE
            } else if (isValidColAndRow(col, row - 1, colDivisor, rowDivisor)) {
                const newRow = row - 1
                const newCol = col
                index = ((newRow * data.width) + newCol) * PIXEL_DATA_SIZE
            } else if (isValidColAndRow(col - 1, row - 1, colDivisor, rowDivisor)) {
                const newRow = row - 1 
                const newCol = col - 1
                index = ((newRow * data.width) + newCol) * PIXEL_DATA_SIZE
            }
            newRGBVector = [resultImageData[index], resultImageData[index + 1], resultImageData[index + 2]]

        }

        resultImageData[i] = newRGBVector[0]
        resultImageData[i + 1] = newRGBVector[1]
        resultImageData[i + 2] = newRGBVector[2]
        resultImageData[i + 3] = a
    }

    return {
        lumaImageData: new ImageData(lumaImageData, data.width),
        chromaRedImageData: new ImageData(chromaRedImageData, chromaRowWidth),
        chromaBlueImageData: new ImageData(chromaBlueImageData, chromaRowWidth),
        resultImageData: new ImageData(resultImageData, data.width)
    }
}

const isValidColAndRow = (col: number, row: number, colDivisor: number, rowDivisor: number) => {
    return col % colDivisor === 0 && row % rowDivisor === 0
}

const multiply = (matrix: number[][], vector: number[]): number[] => {
    return [
        ((matrix[0][0] * vector[0]) + (matrix[0][1] * vector[1]) + (matrix[0][2] * vector[2])),
        ((matrix[1][0] * vector[0]) + (matrix[1][1] * vector[1]) + (matrix[1][2] * vector[2])),
        ((matrix[2][0] * vector[0]) + (matrix[2][1] * vector[1]) + (matrix[2][2] * vector[2])),
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