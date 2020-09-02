import { img_2 } from '../assets/*.png';
import { generateLumaChromaImageData } from './luma_chroma';
import { SamplingType, mapInputToSamplingType } from './sampling_type';

const COMPONENT_IMAGES = 3

// Canvas Elements
const canvas = document.getElementById('original-canvas') as HTMLCanvasElement
const resultCanvas = document.getElementById('result-canvas') as HTMLCanvasElement
const lumaCanvas = document.getElementById('luma-canvas') as HTMLCanvasElement
const chromaRedCanvas = document.getElementById('chroma-red-canvas') as HTMLCanvasElement
const chromaBlueCanvas = document.getElementById('chroma-blue-canvas') as HTMLCanvasElement

// Input Elements
const lumaRange = document.getElementById('luma-range')
const chromaRedRange = document.getElementById('chroma-red-range')
const chromaBlueRange = document.getElementById('chroma-blue-range')
const subSamplingInputs = Array.from(document.getElementsByName('subSamplingOptions')) as HTMLInputElement[] 

// Canvas contexts
const context = canvas.getContext('2d')
const lumaContext = lumaCanvas.getContext('2d')
const chromaRedContext = chromaRedCanvas.getContext('2d')
const chromaBlueContext = chromaBlueCanvas.getContext('2d')
const resultContext = resultCanvas.getContext('2d')

if (context === null) {
    throw new Error('ERROR: No 2d context')
}

subSamplingInputs.forEach((radioButton) => {
    radioButton.onchange = () => {
        const samplingType: SamplingType = mapInputToSamplingType[radioButton.value]
    }
})

const img = new Image();
img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    resultCanvas.width = img.width
    resultCanvas.height = img.height

    context.drawImage(img, 0, 0);
    const originalImageData = context.getImageData(0, 0, canvas.width, canvas.height)

    resultContext?.drawImage(img, 0, 0)
    canvas.style.width = resultCanvas.style.width = `${window.innerWidth / 4}px`

    const imageDataPayload = generateLumaChromaImageData(originalImageData, SamplingType.FOUR_TWO_ZERO)


    lumaCanvas.width = imageDataPayload.lumaImageData.width
    lumaCanvas.height = imageDataPayload.lumaImageData.height

    chromaRedCanvas.width = chromaBlueCanvas.width = imageDataPayload.chromaBlueImageData.width
    chromaRedCanvas.height = chromaBlueCanvas.height = imageDataPayload.chromaBlueImageData.height
    
    const maxImageWidth = window.innerWidth / COMPONENT_IMAGES
    const lumaCanvasScale = imageDataPayload.lumaImageData.width / window.innerWidth
    const chromaCanvasScale = imageDataPayload.chromaRedImageData.width / window.innerWidth

    lumaCanvas.style.width = `${lumaCanvasScale * maxImageWidth}px`
    chromaRedCanvas.style.width = chromaBlueCanvas.style.width = `${chromaCanvasScale * maxImageWidth}px`
    
    lumaContext?.putImageData(imageDataPayload.lumaImageData, 0, 0)
    chromaRedContext?.putImageData(imageDataPayload.chromaRedImageData, 0, 0)
    chromaBlueContext?.putImageData(imageDataPayload.chromaBlueImageData, 0, 0)

};
img.src = img_2;

const onLoadHandler = () => {
    canvas.width = img.width
    canvas.height = img.height
    resultCanvas.width = img.width
    resultCanvas.height = img.height

    context.drawImage(img, 0, 0);
    const originalImageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // TODO calculate the image size
    const lumaContext = lumaCanvas.getContext('2d')
    const chromaRedContext = chromaRedCanvas.getContext('2d')
    const chromaBlueContext = chromaBlueCanvas.getContext('2d')
    const resultContext = resultCanvas.getContext('2d')

    resultContext?.drawImage(img, 0, 0)
    canvas.style.width = resultCanvas.style.width = `${window.innerWidth / 4}px`

    const imageDataPayload = generateLumaChromaImageData(originalImageData, SamplingType.FOUR_TWO_ZERO)



    lumaCanvas.width = imageDataPayload.lumaImageData.width
    lumaCanvas.height = imageDataPayload.lumaImageData.height

    chromaRedCanvas.width = chromaBlueCanvas.width = imageDataPayload.chromaBlueImageData.width
    chromaRedCanvas.height = chromaBlueCanvas.height = imageDataPayload.chromaBlueImageData.height

    const maxImageWidth = window.innerWidth / COMPONENT_IMAGES
    const lumaCanvasScale = imageDataPayload.lumaImageData.width / window.innerWidth
    const chromaCanvasScale = imageDataPayload.chromaRedImageData.width / window.innerWidth

    lumaCanvas.style.width = `${lumaCanvasScale * maxImageWidth}px`
    chromaRedCanvas.style.width = chromaBlueCanvas.style.width = `${chromaCanvasScale * maxImageWidth}px`

    lumaContext?.putImageData(imageDataPayload.lumaImageData, 0, 0)
    chromaRedContext?.putImageData(imageDataPayload.chromaRedImageData, 0, 0)
    chromaBlueContext?.putImageData(imageDataPayload.chromaBlueImageData, 0, 0)

}

const updateLumaChromaImages = () => {
    const imageDataPayload = generateLumaChromaImageData(originalImageData, SamplingType.FOUR_TWO_ZERO)



    lumaCanvas.width = imageDataPayload.lumaImageData.width
    lumaCanvas.height = imageDataPayload.lumaImageData.height

    chromaRedCanvas.width = chromaBlueCanvas.width = imageDataPayload.chromaBlueImageData.width
    chromaRedCanvas.height = chromaBlueCanvas.height = imageDataPayload.chromaBlueImageData.height

    const maxImageWidth = window.innerWidth / COMPONENT_IMAGES
    const lumaCanvasScale = imageDataPayload.lumaImageData.width / window.innerWidth
    const chromaCanvasScale = imageDataPayload.chromaRedImageData.width / window.innerWidth

    lumaCanvas.style.width = `${lumaCanvasScale * maxImageWidth}px`
    chromaRedCanvas.style.width = chromaBlueCanvas.style.width = `${chromaCanvasScale * maxImageWidth}px`

    lumaContext?.putImageData(imageDataPayload.lumaImageData, 0, 0)
    chromaRedContext?.putImageData(imageDataPayload.chromaRedImageData, 0, 0)
    chromaBlueContext?.putImageData(imageDataPayload.chromaBlueImageData, 0, 0)
}

const updateOutputImage = () => {

}

