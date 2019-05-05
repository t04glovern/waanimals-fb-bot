var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');

var expect = chai.expect;

chai.use(chaiHttp);

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

describe('app', function () {
  describe('/webhook verification should succeed', function () {
    it('responds with CHALLENGE_ACCEPTED', function (done) {
      chai.request(app)
        .get('/webhook?hub.verify_token=' + VERIFY_TOKEN + '&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe')
        .end(function (err, res) {
          expect(res.text).to.equal("CHALLENGE_ACCEPTED")
          done();
        });
    });
  });

  describe('/webhook verification should not succeed', function () {
    it('responds with status 403', function (done) {
      chai.request(app)
        .get('/webhook?hub.verify_token=BADTOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe')
        .end(function (err, res) {
          expect(res).to.have.status(403)
          done();
        });
    });
  });

  describe('/healthy endpoint should succeed', function () {
    it('responds Health endpoint successful!', function (done) {
      chai.request(app)
        .get('/healthy')
        .end(function (err, res) {
          expect(res.text).to.equal("Health endpoint successful!")
          done();
        });
    });
  });
});