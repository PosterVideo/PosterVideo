'use strict';

describe('Component: PosterEditComponent', function() {
  // load the controller's module
  beforeEach(module('pvApp.PosterEdit'));

  var PosterEditComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    PosterEditComponent = $componentController('PosterEdit', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
