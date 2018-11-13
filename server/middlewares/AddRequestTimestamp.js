module.exports = (req, res, next) => {
    
    req.timestamp = Date.now();
    next();
}