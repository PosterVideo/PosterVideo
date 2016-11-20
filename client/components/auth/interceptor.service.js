'use strict';

import NProgress from 'nprogress';

export function authInterceptor($rootScope, $q, $cookies, $injector, Util) {
  'ngInject';

  var state;
  return {
    // Add authorization token to headers
    request(config) {
      config.headers = config.headers || {};
      if($cookies.get('token') && Util.isSameOrigin(config.url)) {
        config.headers.Authorization = `Bearer ${$cookies.get('token')}`;
      }
      NProgress.start();
      return config;
    },
    response(response){
      NProgress.done();
      return response;
    },

    // Intercept 401s and redirect you to login
    responseError(response) {
      NProgress.done();

      if(response.status === 401) {

        (state || (state = $injector.get('$state')))
        .go('main');
        // remove any stale tokens
        $cookies.remove('token');
      }
      return $q.reject(response);
    }
  };
}