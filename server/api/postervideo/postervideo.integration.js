'use strict';

var app = require('../..');
import request from 'supertest';

var newPostervideo;

describe('Postervideo API:', function() {
  describe('GET /api/postervideos', function() {
    var postervideos;

    beforeEach(function(done) {
      request(app)
        .get('/api/postervideos')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          postervideos = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(postervideos).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/postervideos', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/postervideos')
        .send({
          name: 'New Postervideo',
          info: 'This is the brand new postervideo!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPostervideo = res.body;
          done();
        });
    });

    it('should respond with the newly created postervideo', function() {
      expect(newPostervideo.name).to.equal('New Postervideo');
      expect(newPostervideo.info).to.equal('This is the brand new postervideo!!!');
    });
  });

  describe('GET /api/postervideos/:id', function() {
    var postervideo;

    beforeEach(function(done) {
      request(app)
        .get(`/api/postervideos/${newPostervideo._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          postervideo = res.body;
          done();
        });
    });

    afterEach(function() {
      postervideo = {};
    });

    it('should respond with the requested postervideo', function() {
      expect(postervideo.name).to.equal('New Postervideo');
      expect(postervideo.info).to.equal('This is the brand new postervideo!!!');
    });
  });

  describe('PUT /api/postervideos/:id', function() {
    var updatedPostervideo;

    beforeEach(function(done) {
      request(app)
        .put(`/api/postervideos/${newPostervideo._id}`)
        .send({
          name: 'Updated Postervideo',
          info: 'This is the updated postervideo!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPostervideo = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPostervideo = {};
    });

    it('should respond with the original postervideo', function() {
      expect(updatedPostervideo.name).to.equal('New Postervideo');
      expect(updatedPostervideo.info).to.equal('This is the brand new postervideo!!!');
    });

    it('should respond with the updated postervideo on a subsequent GET', function(done) {
      request(app)
        .get(`/api/postervideos/${newPostervideo._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let postervideo = res.body;

          expect(postervideo.name).to.equal('Updated Postervideo');
          expect(postervideo.info).to.equal('This is the updated postervideo!!!');

          done();
        });
    });
  });

  describe('PATCH /api/postervideos/:id', function() {
    var patchedPostervideo;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/postervideos/${newPostervideo._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Postervideo' },
          { op: 'replace', path: '/info', value: 'This is the patched postervideo!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPostervideo = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPostervideo = {};
    });

    it('should respond with the patched postervideo', function() {
      expect(patchedPostervideo.name).to.equal('Patched Postervideo');
      expect(patchedPostervideo.info).to.equal('This is the patched postervideo!!!');
    });
  });

  describe('DELETE /api/postervideos/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/postervideos/${newPostervideo._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when postervideo does not exist', function(done) {
      request(app)
        .delete(`/api/postervideos/${newPostervideo._id}`)
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
