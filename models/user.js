'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql');
const {
   NotFoundError,
   BadRequestError,
   UnauthorizedError,
} = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');

/** Related functions for users. */
class User {
   /** authenticate user with username, password.
    *
    * Returns { username, first_name, last_name, email, is_admin }
    *
    * Throws UnauthorizedError is user not found or wrong password.
    **/
   //FIN:
   static async authenticate(username, password) {
      const result = await db.query(
         `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
         [username]
      );

      const user = result.rows[0];

      if (user) {
         // compare hashed password to a new hash from password
         const isValid = await bcrypt.compare(password, user.password);
         if (isValid === true) {
            delete user.password;
            return user;
         }
      }

      throw new UnauthorizedError('Invalid username/password');
   }

   /** Register user with data.
    *
    * Returns { username, firstName, lastName, email, isAdmin }
    *
    * Throws BadRequestError on duplicates.
    **/
   //FIN:
   static async register({
      username,
      password,
      firstName,
      lastName,
      email,
      isAdmin,
   }) {
      const duplicateCheck = await db.query(
         `SELECT username
           FROM users
           WHERE username = $1`,
         [username]
      );

      if (duplicateCheck.rows[0]) {
         throw new BadRequestError(`Duplicate username: ${username}`);
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      const result = await db.query(
         `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
         [username, hashedPassword, firstName, lastName, email, isAdmin]
      );

      //create cart for user upon profile creation
      await db.query(
         `INSERT INTO carts 
            (username) 
            VALUES ($1)`,
         [username]
      );

      const user = result.rows[0];

      return user;
   }

   /** Find all users.
    *
    * Returns [{ username, first_name, last_name, email, is_admin }, ...]
    **/
   //FIN:
   static async findAll() {
      const result = await db.query(
         `SELECT username,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email,
                   is_admin AS "isAdmin",
                   created_at AS "createdAt"
            FROM users
            ORDER BY username`
      );

      return result.rows;
   }

   /** Given a username, return data about user.
    *
    * Returns { username, first_name, last_name, is_admin, jobs }
    *   TODO: where jobs is { id, title, company_handle, company_name, state }
    *
    * Throws NotFoundError if user not found.
    **/
   //NOTE: route works | need to add in cart data later
   static async get(username) {
      const userRes = await db.query(
         `SELECT username,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email,
                   is_admin AS "isAdmin",
                   created_at AS "createdAt"
            FROM users
            WHERE username = $1`,
         [username]
      );

      const user = userRes.rows[0];

      if (!user) throw new NotFoundError(`No user: ${username}`);

      //TODO: add cart data here instead of applications?
      // const userApplicationsRes = await db.query(
      //    `SELECT a.job_id
      //       FROM applications AS a
      //       WHERE a.username = $1`,
      //    [username]
      // );

      // user.applications = userApplicationsRes.rows.map((a) => a.job_id);
      return user;
   }

   //  /** Update user data with `data`.
   //   *
   //   * This is a "partial update" --- it's fine if data doesn't contain
   //   * all the fields; this only changes provided ones.
   //   *
   //   * Data can include:
   //   *   { username, firstName, lastName, password, email, isAdmin }
   //   *
   //   * Returns { username, firstName, lastName, email, isAdmin }
   //   *
   //   * Throws NotFoundError if not found.
   //   *
   //   * WARNING: this function can set a new password or make a user an admin.
   //   * Callers of this function must be certain they have validated inputs to this
   //   * or a serious security risks are opened.
   //   */
   //FIN: works
   static async update(username, data) {
      //check for password
      if (!data.password) {
         throw new BadRequestError('Password required to make updates.');
      }

      //get existing password
      const userRes = await db.query(
         `SELECT password FROM users WHERE username = $1`,
         [username]
      );
      const user = userRes.rows[0];
      if (!user) throw new NotFoundError(`No user: ${username}`);

      //check that the passwords match
      const isValid = await bcrypt.compare(data.password, user.password);
      if (!isValid) throw new UnauthorizedError('Invalid password');

      //exclude password from the patch request
      delete data.password;

      //check to make sure isAdmin is a boolean (handles checkbox edge cases)
      if ('isAdmin' in data) {
         data.isAdmin = Boolean(data.isAdmin);
      }

      //continue with getting and updating the fields
      //NOTE: how is this updating username and email fields if it is not included here? Ask chatGPT
      const { setCols, values } = sqlForPartialUpdate(data, {
         firstName: 'first_name',
         lastName: 'last_name',
         isAdmin: 'is_admin',
      });
      const usernameVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE users
                       SET ${setCols}
                       WHERE username = ${usernameVarIdx}
                       RETURNING username,
                                 first_name AS "firstName",
                                 last_name AS "lastName",
                                 email,
                                 is_admin AS "isAdmin"`;
      const result = await db.query(querySql, [...values, username]);
      const updatedUser = result.rows[0];

      if (!updatedUser) throw new NotFoundError(`No user: ${username}`);

      return updatedUser;
   }

   //  /** Delete given user from database; returns undefined. */
   //FIN: works
   static async remove(username) {
      let result = await db.query(
         `DELETE
            FROM users
            WHERE username = $1
            RETURNING username`,
         [username]
      );
      const user = result.rows[0];

      if (!user) throw new NotFoundError(`No user: ${username}`);
   }
}

module.exports = User;
