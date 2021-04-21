const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateImage = (buffer, ext) => {
    return {
        buffer, 
        type:ext, 
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage, generateImage
}