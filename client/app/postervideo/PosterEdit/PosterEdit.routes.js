'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('posterEdit', {
      url: '/edit/:id',
      template: '<poster-edit></poster-edit>',
      authenticate: true
    });
}
