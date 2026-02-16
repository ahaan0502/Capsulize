const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Log the full Authorization header
    console.log('Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Extracted token:', token);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authenticate;