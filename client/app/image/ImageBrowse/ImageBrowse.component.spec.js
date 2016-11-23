'use strict';

describe('Component: ImageBrowseComponent', function() {
  // load the controller's module
  beforeEach(module('pvApp.imageBrowse'));

  var ImageBrowseComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ImageBrowseComponent = $componentController('ImageBrowse', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
