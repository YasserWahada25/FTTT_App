export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8090',
  keycloak: {
    baseUrl: 'http://localhost:9090',
    realm: 'fttapp',
    clientId: 'fttapp-frontend',
    scopes: ['openid', 'profile', 'email', 'roles'],
    redirectPath: '/auth/callback',
    postLogoutRedirectPath: '/auth/login',
  },
};
