export const environment = {
  production: false,
appApiUrl: 'http://localhost:8080/api/v1.0/private',
//  appApiUrl: 'http://192.168.1.10:8080/api/v1.0/private',
//wmfuertes
  appUsers:'https://api-ufa.espe.edu.ec/api/v1.0/private/apisExternals/dataUser?usuario=',
  espematicoApiUrl: 'https://espematico-api.espe.edu.ec/reporteWs',
  imageApiUrl: 'https://image-api.espe.edu.ec/imagen/',
  appDocuments:'https://api-ufa-test.espe.edu.ec/api/v1.0/private/files/',
  sso: {
    serverUrl: 'https://srvcas.espe.edu.ec',
    clientId: 'F_13VTNPdVHPSstUZtYmldfl2UYa',
    requireHttps: false,
    issuer: '/oauth2endpoints/token',
    redirectUri: window.location.origin,
    postRedirectUrL: window.location.origin,
    scope: 'openid profile email',
    logout: '/oidc/logout',
    tokenEndpoint: '/oauth2endpoints/token',
    userinfoEndpoint: '/oauth2/userinfo',
    authorizationEndpoint: '/oauth2/authorize',
    jwksEndpoint: '/oauth2/jwks',
    showDebugInformation: true,
    responseType: 'id_token token'
  }
};
