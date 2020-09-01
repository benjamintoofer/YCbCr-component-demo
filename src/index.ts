import { img_2 } from '../assets/*.png';
import { generateLumaChromaImageData } from './luma_chroma';

const canvas = document.getElementById('original-canvas') as HTMLCanvasElement
const lumaCanvas = document.getElementById('luma-canvas') as HTMLCanvasElement
const chromaRedCanvas = document.getElementById('luma-canvas') as HTMLCanvasElement
const chromaBlueCanvas = document.getElementById('luma-canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')

if (context === null) {
    throw new Error('ERROR: No 2d context')
}

const img = new Image();
img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height

    context.drawImage(img, 0, 0);
    const originalImageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // TODO calculate the image size
    const lumaContext = lumaCanvas.getContext('2d')
    const chromaRedContext = chromaRedCanvas.getContext('2d')
    const chromaBlueContext = chromaBlueCanvas.getContext('2d')

    const imageDataPayload = generateLumaChromaImageData(originalImageData)
    console.warn(lumaContext)
    chromaRedCanvas.width = chromaBlueCanvas.width = lumaCanvas.width = imageDataPayload.lumaImageData.width
    chromaRedCanvas.height = chromaBlueCanvas.height = lumaCanvas.height = imageDataPayload.lumaImageData.height
    // TODO (calculate 1/4 ~ 1/5 of the width of the page)
    chromaRedCanvas.style.width = chromaBlueCanvas.style.width = lumaCanvas.style.width = '190px'
    chromaRedCanvas.style.height = chromaBlueCanvas.style.height = lumaCanvas.style.height = '190px'
    lumaContext?.putImageData(imageDataPayload.lumaImageData, 0, 0)
    console.warn(imageDataPayload)

};
img.src = img_2;

const updateLumaChromaImages = () => {

}

const updateOutputImage = () => {

}

