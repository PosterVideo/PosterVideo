'use strict';

var app = require('../..');
import request from 'supertest';

var newImage;

describe('Image API:', function() {
  describe('GET /api/images', function() {
    var images;

    beforeEach(function(done) {
      request(app)
        .get('/api/images')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          images = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(images).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/images', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/images')
        .send({
          name: 'New Image',
          info: 'This is the brand new image!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newImage = res.body;
          done();
        });
    });

    it('should respond with the newly created image', function() {
      expect(newImage.name).to.equal('New Image');
      expect(newImage.info).to.equal('This is the brand new image!!!');
    });
  });

  describe('GET /api/images/:id', function() {
    var image;

    beforeEach(function(done) {
      request(app)
        .get(`/api/images/${newImage._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          image = res.body;
          done();
        });
    });

    afterEach(function() {
      image = {};
    });

    it('should respond with the requested image', function() {
      expect(image.name).to.equal('New Image');
      expect(image.info).to.equal('This is the brand new image!!!');
    });
  });

  describe('PUT /api/images/:id', function() {
    var updatedImage;

    beforeEach(function(done) {
      request(app)
        .put(`/api/images/${newImage._id}`)
        .send({
          name: 'Updated Image',
          info: 'This is the updated image!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedImage = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedImage = {};
    });

    it('should respond with the original image', function() {
      expect(updatedImage.name).to.equal('New Image');
      expect(updatedImage.info).to.equal('This is the brand new image!!!');
    });

    it('should respond with the updated image on a subsequent GET', function(done) {
      request(app)
        .get(`/api/images/${newImage._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let image = res.body;

          expect(image.name).to.equal('Updated Image');
          expect(image.info).to.equal('This is the updated image!!!');

          done();
        });
    });
  });

  describe('PATCH /api/images/:id', function() {
    var patchedImage;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/images/${newImage._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Image' },
          { op: 'replace', path: '/info', value: 'This is the patched image!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedImage = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedImage = {};
    });

    it('should respond with the patched image', function() {
      expect(patchedImage.name).to.equal('Patched Image');
      expect(patchedImage.info).to.equal('This is the patched image!!!');
    });
  });

  describe('DELETE /api/images/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/images/${newImage._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when image does not exist', function(done) {
      request(app)
        .delete(`/api/images/${newImage._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
