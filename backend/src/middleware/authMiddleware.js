import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes.
 * Verifies a JWT token from the Authorization header.
 */
export const protect = (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and is a Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 2. Extract the token
      token = authHeader.split(' ')[1];

      // 3. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach the decoded payload to the request object
      // We can use this to identify the user in our controllers
      req.auth = decoded; // e.g., { id: 'someUserId', role: 'admin' }

      // 5. Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // No token found
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to restrict access to certain roles (e.g., 'admin').
 * This should be used *after* the 'protect' middleware.
 */
export const admin = (req, res, next) => {
  if (req.auth && req.auth.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};