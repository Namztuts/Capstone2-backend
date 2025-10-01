'use strict';

describe('config', () => {
   const ORIGINAL_ENV = process.env;

   beforeEach(() => {
      jest.resetModules(); //clear cache to re-import config fresh each time
      process.env = { ...ORIGINAL_ENV }; //reset env
   });

   afterAll(() => {
      process.env = ORIGINAL_ENV; //restore original env after all tests
   });

   test('loads default development config', () => {
      delete process.env.NODE_ENV;
      delete process.env.SECRET_KEY;
      delete process.env.DATABASE_URL;
      delete process.env.PORT;

      const config = require('./config');

      expect(config.SECRET_KEY).toBe('secret-dev');
      expect(config.PORT).toBe(3001);
      expect(config.getDatabaseUri()).toBe(
         'postgresql://namztuts:password@localhost/a_and_e'
      );
      expect(config.BCRYPT_WORK_FACTOR).toBe(12);
   });

   test('loads test config with correct overrides', () => {
      process.env.NODE_ENV = 'test';

      const config = require('./config');

      expect(config.BCRYPT_WORK_FACTOR).toBe(1);
      expect(config.getDatabaseUri()).toBe(
         'postgresql://namztuts:password@localhost/a_and_e_test'
      );
   });

   test('uses environment overrides correctly', () => {
      process.env.SECRET_KEY = 'mysecret';
      process.env.PORT = '8080';
      process.env.DATABASE_URL = 'postgresql://user:pass@remote/db';
      delete process.env.NODE_ENV;

      const config = require('./config');

      expect(config.SECRET_KEY).toBe('mysecret');
      expect(config.PORT).toBe(8080);
      expect(config.getDatabaseUri()).toBe('postgresql://user:pass@remote/db');
   });
});
