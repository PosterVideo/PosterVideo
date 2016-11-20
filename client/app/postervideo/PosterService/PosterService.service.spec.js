'use strict';

describe('Service: PosterService', function() {
  // load the service's module
  beforeEach(module('pvApp.PosterService'));

  // instantiate service
  var PosterService;
  beforeEach(inject(function(_PosterService_) {
    PosterService = _PosterService_;
  }));

  it('should do something', function() {
    expect(!!PosterService).to.be.true;
  });
});

//~@o@~
