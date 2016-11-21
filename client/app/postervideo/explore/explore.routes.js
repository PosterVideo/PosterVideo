'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('explore', {
      url: '/explore',
      template: '<explore></explore>',
      authenticate: true
    });
}
