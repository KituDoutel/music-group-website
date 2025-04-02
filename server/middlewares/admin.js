const admin = async (req, res, next) => {
    try {
      const [user] = await query(
        'SELECT role FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin access only' 
        });
      }
      
      next();
    } catch (err) {
      res.status(500).json({ 
        error: 'Authorization check failed' 
      });
    }
  };
  
  module.exports = admin;