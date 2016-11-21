'use strict';

describe('Component: ExploreComponent', function() {
  // load the controller's module
  beforeEach(module('pvApp.explore'));

  var ExploreComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ExploreComponent = $componentController('explore', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
