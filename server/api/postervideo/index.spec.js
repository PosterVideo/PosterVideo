'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var postervideoCtrlStub = {
  index: 'postervideoCtrl.index',
  show: 'postervideoCtrl.show',
  create: 'postervideoCtrl.create',
  upsert: 'postervideoCtrl.upsert',
  patch: 'postervideoCtrl.patch',
  destroy: 'postervideoCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var postervideoIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './postervideo.controller': postervideoCtrlStub
});

describe('Postervideo API Router:', function() {
  it('should return an express router instance', function() {
    expect(postervideoIndex).to.equal(routerStub);
  });

  describe('GET /api/postervideos', function() {
    it('should route to postervideo.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'postervideoCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/postervideos/:id', function() {
    it('should route to postervideo.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'postervideoCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/postervideos', function() {
    it('should route to postervideo.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'postervideoCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/postervideos/:id', function() {
    it('should route to postervideo.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'postervideoCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/postervideos/:id', function() {
    it('should route to postervideo.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'postervideoCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/postervideos/:id', function() {
    it('should route to postervideo.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'postervideoCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
