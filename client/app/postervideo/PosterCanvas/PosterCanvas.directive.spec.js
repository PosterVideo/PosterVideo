'use strict';

describe('Directive: PosterCanvas', function() {
  // load the directive's module and view
  beforeEach(module('pvApp.PosterCanvas'));
  beforeEach(module('app/postervideo/PosterCanvas/PosterCanvas.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<-poster-canvas></-poster-canvas>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the PosterCanvas directive');
  }));
});
