'use strict';


var imjv = require('is-my-json-valid');
var stableStringify = require('json-stable-stringify');


module.exports = Validator;


function Validator(opts) {
    if (!(this instanceof Validator)) return new Validator(opts);
    
    this._opts = convertOpts(opts);
    this._opts.schemas = this._opts.schemas || {};
    this._compiled = {};

    // this is done on purpose, so that methods are bound to the instance without using bind
    this.validate = validate;
    this.compile = compile;
    this.addSchema = addSchema;
    this.getSchema = getSchema;

    var self = this;


    function validate(schema, json) {
        var v = self.compile(schema);
        var result = v(json);
        return { valid: result, errors: v.errors };
    }


    function compile(schema) {
        if (typeof schema == 'string')
            schema = JSON.parse(schema);
        var schemaStr = stableStringify(schema);
        var v = self._compiled[schemaStr]
        if (!v) v = self._compiled[schemaStr] = imjv(schema, self._opts);

        return function validate() {
            var result = v(json);
            return { valid: result, errors: v.errors };
        };
    }


    function addSchema(schema, id) {
        var id = id || schema.id;
        self._opts.schemas[id] = schema;
    }


    function getSchema(id) {
        return self._opts.schemas[id];
    }
}


function convertOpts(opts) {
    var _opts = opts ? copy(opts) : {};
    _opts.greedy = opts.allErrors;
    return {
        greedy: opts.allErrors,
        verbose: opts.verbose,
        schemas: opts.schemas,
        formats: opts.formats
    };
}


function copy(o, to) {
    to = to || {};
    for (var key in o) to[key] = o[key];
    return to;
}