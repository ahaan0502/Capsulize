const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Failed',
            details: err.message
        });
    }

    //Mongoose CastError
    if (err.name === 'CastError') {
        return res.status(400).json({error: 'Invalid ID Format'});
    }

    //Default
    res.status(500).json({error: 'Internal Server Error'});
};

module.exports = errorHandler;