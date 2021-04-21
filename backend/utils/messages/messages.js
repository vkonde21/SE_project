const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateImage = (buffer) => {
    return {
        buffer, //convert this to a 64 base string
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}