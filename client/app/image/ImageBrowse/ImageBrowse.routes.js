'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('imageBrowse', {
      url: '/image',
      template: '<image-browse></image-browse>',
      authenticate: true,
      role: 'paid'
    });
}
