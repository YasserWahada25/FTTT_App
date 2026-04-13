export const environment = {
  production: false,
  apiBaseUrl: '',
  keycloak: {
    baseUrl: '/oidc',
    realm: 'fttapp',
    clientId: 'fttapp-frontend',
    scopes: ['openid', 'profile', 'email', 'roles'],
    redirectPath: '/auth/callback',
    postLogoutRedirectPath: '/auth/login',
  },
};
