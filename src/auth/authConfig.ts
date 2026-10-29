const env = import.meta.env as Record<string, string | undefined>

const region = env.VITE_AWS_REGION || env.AWS_REGION || 'us-west-2'
const userPoolId = env.VITE_COGNITO_USER_POOL_ID || env.COGNITO_USER_POOL_ID || 'us-west-2_lLYEkDgbK'
const clientId = env.VITE_COGNITO_CLIENT_ID || env.COGNITO_CLIENT_ID || '5hd36m6qsssbl237dmalv18pv1'
const cognitoDomain = env.VITE_COGNITO_DOMAIN || env.COGNITO_DOMAIN || 'https://us-west-2llyekdgbk.auth.us-west-2.amazoncognito.com'
const redirectUri =
  env.VITE_COGNITO_REDIRECT_URI || env.COGNITO_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:5173/')
const logoutUri =
  env.VITE_COGNITO_LOGOUT_URI || env.COGNITO_LOGOUT_URI || (typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:5173/')
const scopes = env.VITE_COGNITO_SCOPES || env.COGNITO_SCOPES || 'openid email profile'

export const authConfig = {
  authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: logoutUri,
  response_type: 'code',
  scope: scopes,
  automaticSilentRenew: true,
  loadUserInfo: true,
  metadata: {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    end_session_endpoint: `${cognitoDomain}/logout`,
  },
}

console.log('Cognito config:', { client_id: clientId, redirect_uri: redirectUri, domain: cognitoDomain })

