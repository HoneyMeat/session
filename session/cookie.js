/*!
 * Connect - session - Cookie
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var cookie = require("cookie");
var deprecate = require("depd")("express-session");

/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */

var Cookie = (module.exports = function Cookie(options) {
  this.path = "/";
  this.maxAge = null;
  this.httpOnly = true;

  /**
   * Initialize the 'partitioned' attribute to false by default. This attribute is essential for ensuring
   * that the 'partitioned' flag is explicitly recognized and handled within the express server's cookie
   * settings. Without explicitly setting this property here, the express server would not acknowledge the
   * 'partitioned' attribute, potentially leading to unexpected behavior in cookie management, especially
   * in contexts requiring partitioned cookies for enhanced security or domain isolation.
   */
  this.partitioned = false;

  if (options) {
    if (typeof options !== "object") {
      throw new TypeError("argument options must be a object");
    }

    for (var key in options) {
      if (key !== "data") {
        this[key] = options[key];
      }
    }
  }

  if (this.originalMaxAge === undefined || this.originalMaxAge === null) {
    this.originalMaxAge = this.maxAge;
  }
});

/*!
 * Prototype.
 */

Cookie.prototype = {
  /**
   * Set expires `date`.
   *
   * @param {Date} date
   * @api public
   */

  set expires(date) {
    this._expires = date;
    this.originalMaxAge = this.maxAge;
  },

  /**
   * Get expires `date`.
   *
   * @return {Date}
   * @api public
   */

  get expires() {
    return this._expires;
  },

  /**
   * Set expires via max-age in `ms`.
   *
   * @param {Number} ms
   * @api public
   */

  set maxAge(ms) {
    if (ms && typeof ms !== "number" && !(ms instanceof Date)) {
      throw new TypeError("maxAge must be a number or Date");
    }

    if (ms instanceof Date) {
      deprecate("maxAge as Date; pass number of milliseconds instead");
    }

    this.expires = typeof ms === "number" ? new Date(Date.now() + ms) : ms;
  },

  /**
   * Get expires max-age in `ms`.
   *
   * @return {Number}
   * @api public
   */

  get maxAge() {
    return this.expires instanceof Date
      ? this.expires.valueOf() - Date.now()
      : this.expires;
  },

  /**
   * Return cookie data object.
   *
   * @return {Object}
   * @api private
   */

  get data() {
    return {
      originalMaxAge: this.originalMaxAge,
      partitioned: this.partitioned,
      priority: this.priority,
      expires: this._expires,
      secure: this.secure,
      httpOnly: this.httpOnly,
      domain: this.domain,
      path: this.path,
      sameSite: this.sameSite,
    };
  },

  /**
   * Return a serialized cookie string.
   *
   * @return {String}
   * @api public
   */

  serialize: function (name, val) {
    return cookie.serialize(name, val, this.data);
  },

  /**
   * Return JSON representation of this cookie.
   *
   * @return {Object}
   * @api private
   */

  toJSON: function () {
    return this.data;
  },
};
