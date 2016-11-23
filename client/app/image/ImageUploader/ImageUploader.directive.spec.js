'use strict';

describe('Directive: ImageUploader', function() {
  // load the directive's module and view
  beforeEach(module('pvApp.imageUploader'));
  beforeEach(module('app/image/ImageUploader/ImageUploader.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<-image-uploader></-image-uploader>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the ImageUploader directive');
  }));
});
