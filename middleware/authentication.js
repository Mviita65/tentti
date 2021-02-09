const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken'); //token



const getTokenFrom = request => {
    const authorization = request.get('authorization')
    console.log(authorization);
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const isAuthenticated = (request, response, next) => {
    const token = getTokenFrom(request);
    console.log(token);

    if (!token) {
        return response.status(401).json({ error: 'token missing' });
    }


    const decodedToken = jwt.verify(token, process.env.SECRET);
    console.log("decoded", decodedToken);

    if (!decodedToken || !decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' });
    }    
    
    return true
}

module.exports = isAuthenticated;