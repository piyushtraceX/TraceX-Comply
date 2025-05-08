import { jwtVerify } from 'jose';
import axios from 'axios';
import { storage } from '../storage';
import { InsertUser } from '@shared/schema';

// Casdoor configuration
// Note: In production, these values should be stored in environment variables
const casdoorConfig = {
  serverUrl: process.env.CASDOOR_SERVER_URL || 'https://door.casdoor.com',
  clientId: process.env.CASDOOR_CLIENT_ID || 'YOUR_CASDOOR_CLIENT_ID',
  clientSecret: process.env.CASDOOR_CLIENT_SECRET || 'YOUR_CASDOOR_CLIENT_SECRET',
  organizationName: process.env.CASDOOR_ORGANIZATION_NAME || 'YOUR_CASDOOR_ORGANIZATION_NAME',
  applicationName: process.env.CASDOOR_APPLICATION_NAME || 'YOUR_CASDOOR_APPLICATION_NAME',
  callbackUrl: process.env.CASDOOR_CALLBACK_URL || 'http://localhost:5000/api/auth/callback',
};

// Helper: Simple implementation for OAuth client
export const casdoorClient = {
  // Generate the OAuth authorize URL
  getSignInUrl: (redirectUri: string, state: string) => {
    const queryParams = new URLSearchParams({
      client_id: casdoorConfig.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'read',
      state: state,
    });
    
    return `${casdoorConfig.serverUrl}/login/oauth/authorize?${queryParams.toString()}`;
  },
  
  // Exchange authorization code for access token
  getAuthToken: async (code: string) => {
    const response = await axios.post(`${casdoorConfig.serverUrl}/api/login/oauth/access_token`, {
      client_id: casdoorConfig.clientId,
      client_secret: casdoorConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    });
    
    return response.data.access_token;
  },
  
  // Parse JWT token
  parseJwtToken: async (token: string) => {
    try {
      // Note: In production, you should verify with the proper public key
      const { payload } = await jwtVerify(
        token, 
        new TextEncoder().encode(casdoorConfig.clientSecret),
        { algorithms: ['HS256'] }
      );
      
      return payload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }
};

// Generate OAuth authorization URL
export function getSigninUrl(redirectUri: string, state: string): string {
  return casdoorClient.getSignInUrl(redirectUri, state);
}

// Token verification and user profile fetching
export async function verifyAndGetUser(code: string): Promise<any> {
  // Parse the token
  const token = await casdoorClient.getAuthToken(code);
  
  // Verify the token
  const tokenObj = await casdoorClient.parseJwtToken(token);
  
  if (!tokenObj) {
    throw new Error('Invalid token');
  }
  
  // Extract user information from the token (adjust property access based on actual token structure)
  const payload = tokenObj as Record<string, any>;
  
  const casdoorUser = {
    id: (payload.id || payload.userId || payload.user_id || payload.sub || '') as string,
    name: (payload.name || payload.username || '') as string,
    displayName: (payload.displayName || payload.display_name || payload.name || '') as string,
    email: (payload.email || '') as string,
    avatar: (payload.avatar || '') as string,
  };
  
  // Retrieve or create a user in our local database
  let user = await storage.getUserByCasdoorId(casdoorUser.id);
  
  if (!user) {
    // Create a new user in our database
    const newUser: InsertUser = {
      username: casdoorUser.name,
      password: 'oauth-user', // This is a placeholder as OAuth users don't need passwords
      email: casdoorUser.email,
      displayName: casdoorUser.displayName || casdoorUser.name,
      avatar: casdoorUser.avatar,
      casdoorId: casdoorUser.id,
    };
    
    user = await storage.createUser(newUser);
  }
  
  return {
    user,
    token,
  };
}

// Fetch a user's profile from Casdoor
export async function getCasdoorUser(token: string): Promise<any> {
  try {
    const response = await axios.get(`${casdoorConfig.serverUrl}/api/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile from Casdoor:', error);
    throw error;
  }
}

// Refresh an expired token
export async function refreshToken(refreshToken: string): Promise<any> {
  try {
    const response = await axios.post(`${casdoorConfig.serverUrl}/api/token`, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: casdoorConfig.clientId,
      client_secret: casdoorConfig.clientSecret,
    });
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}