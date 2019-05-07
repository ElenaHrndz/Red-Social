require('./js/controllers/profile');
const firebase = require('./firebase');
const firebase = require( "./firebaseMock");


describe('es un Objeto llamado redSocial', () => { // test si es un objeto

    it('is an object', () => {
      expect(typeof window.redSocial).toBe('object');
    });
  });

  describe('redSocial.obtainUser', () => {

    it('debería ser una función', () => {
      assert.equal(typeof redSocial.obtainUser, 'function');
  });
});