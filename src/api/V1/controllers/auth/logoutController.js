export const logout = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      user.devices = user.devices.filter(device => 
        !(device.userAgent === req.headers['user-agent'] && device.ipAddress === req.ip)
      );
  
      await user.save();
  
      // If using a token blacklist
      await addToTokenBlacklist(token);
  
      // Log the logout event
      await logUserActivity(user._id, 'logout');
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error during logout', error: error.message });
    }
  };