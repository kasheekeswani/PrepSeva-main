import { createContext, useState, useContext, useEffect } from 'react';
import { tokenStorage } from '../services/api';

const AuthContext = createContext();

// ✅ Safe storage utility that works without localStorage
class UserStorage {
  constructor() {
    this.user = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          this.user = JSON.parse(savedUser);
        }
      }
    } catch (error) {
      console.warn('localStorage not available or corrupted user data, using memory storage');
      this.clearUser();
    }
    
    this.initialized = true;
  }

  setUser(userData) {
    this.user = userData;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.warn('Cannot store user data in localStorage');
    }
  }

  getUser() {
    this.init();
    return this.user;
  }

  clearUser() {
    this.user = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.warn('Cannot remove user data from localStorage');
    }
  }
}

const userStorage = new UserStorage();

// ✅ Affiliate code storage that works without localStorage
class AffiliateStorage {
  constructor() {
    this.affiliateCode = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.affiliateCode = localStorage.getItem('affiliateCode');
      }
    } catch (error) {
      console.warn('localStorage not available for affiliate code, using memory storage');
    }
    
    this.initialized = true;
  }

  setAffiliateCode(code) {
    this.affiliateCode = code;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('affiliateCode', code);
      }
    } catch (error) {
      console.warn('Cannot store affiliate code in localStorage');
    }
  }

  getAffiliateCode() {
    this.init();
    return this.affiliateCode;
  }

  clearAffiliateCode() {
    this.affiliateCode = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('affiliateCode');
      }
    } catch (error) {
      console.warn('Cannot remove affiliate code from localStorage');
    }
  }
}

const affiliateStorage = new AffiliateStorage();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState(null);

  // ✅ Initialize user and affiliate code from storage on mount
  useEffect(() => {
    try {
      const savedUser = userStorage.getUser();
      const savedAffiliateCode = affiliateStorage.getAffiliateCode();
      
      if (savedUser) {
        setUser(savedUser);
      }
      
      if (savedAffiliateCode) {
        setAffiliateCode(savedAffiliateCode);
      }
    } catch (error) {
      console.error('Error initializing auth context:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Enhanced login function with better error handling
  const login = (userData, token) => {
    try {
      if (!userData) {
        throw new Error('User data is required for login');
      }

      setUser(userData);
      userStorage.setUser(userData);
      
      if (token) {
        tokenStorage.setToken(token);
      }

      console.log('✅ User logged in successfully:', userData.email);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // ✅ Enhanced logout function
  const logout = () => {
    try {
      setUser(null);
      setAffiliateCode(null);
      userStorage.clearUser();
      tokenStorage.removeToken();
      affiliateStorage.clearAffiliateCode();
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // ✅ Set affiliate code function
  const setAffiliateCodeValue = (code) => {
    try {
      if (code && typeof code === 'string') {
        setAffiliateCode(code);
        affiliateStorage.setAffiliateCode(code);
        console.log('✅ Affiliate code set:', code);
      }
    } catch (error) {
      console.error('❌ Error setting affiliate code:', error);
    }
  };

  // ✅ Clear affiliate code function
  const clearAffiliateCode = () => {
    try {
      setAffiliateCode(null);
      affiliateStorage.clearAffiliateCode();
      console.log('✅ Affiliate code cleared');
    } catch (error) {
      console.error('❌ Error clearing affiliate code:', error);
    }
  };

  // ✅ Update user function
  const updateUser = (updates) => {
    try {
      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      userStorage.setUser(updatedUser);
      
      console.log('✅ User updated successfully');
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  };

  // ✅ Role-based access helpers
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isAuthenticated = !!user;

  // ✅ Enhanced context value
  const contextValue = {
    user,
    loading,
    isAdmin,
    isUser,
    isAuthenticated,
    login,
    logout,
    updateUser,
    affiliateCode,
    setAffiliateCode: setAffiliateCodeValue,
    clearAffiliateCode,
    getUserId: () => user?._id,
    getUserRole: () => user?.role,
    getUserEmail: () => user?.email,
    getUserName: () => user?.name,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { userStorage, affiliateStorage };