'use strict';
// var util = require('util');
var zag_agent = require('zag-agent');
var xtend = require('xtend');

var default_key_rules = {
	'statsd.': 'statsd>'
};
var default_config = {
	daemons: ['127.0.0.1:8876']
};

function ZagBackend(startupTime, config, emitter) {
	var self = this;
	this.stats = {
		last_flush: startupTime,
		last_exception: startupTime
	};
	this.config = xtend(default_config, config.zag || {});
	this.key_rules = xtend(default_key_rules, this.config.key_rules);
	this.key_map = {};

	this.agent = zag_agent(this.config.daemons);

	emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
	emitter.on('status', function(callback) { self.status(callback); });
}

ZagBackend.prototype.map_key = function map_key(key) {
	var self = this;
	if (self.key_map[key]) {
		return self.key_map[key];
	}
	Object.keys(self.key_rules).forEach(function (rule) {
		key = key.replace(rule, self.key_rules[rule]);
	});
	self.key_map[key] = key;
	return key;
};

ZagBackend.prototype.flush = function (timestamp, metrics) {
	var self = this;
	this.stats.last_flush = timestamp;

	// Counters
	Object.keys(metrics.counters).forEach(function(key) {
		var val = metrics.counters[key];
		if (val !== 0) {
			self.agent.counter(self.map_key(key), val);
		}
	});

	// Gauges
	Object.keys(metrics.gauges).forEach(function(key) {
		var val = metrics.gauges[key];
		self.agent.histogram(self.map_key(key+'.gauge'), val);
	});

	// Timers
	Object.keys(metrics.timers).forEach(function(key) {
		metrics.timers[key].forEach(function (val) {
			self.agent.histogram(self.map_key(key), val);
		});
	});

	// Sets
	Object.keys(metrics.sets).forEach(function(key) {
		var set = metrics.sets[key];
		set.values().forEach(function (val) {
			var value_key = key + '.set|' + val;
			self.agent.counter(self.map_key(value_key), 1);
		});
	});
};

ZagBackend.prototype.status = function (callback) {
	this.stats.forEach(function(key) {
		callback(null, 'console', key, this[key]);
	}, this);
};

exports.init = function(startupTime, config, events) {
	var instance = new ZagBackend(startupTime, config, events);
	return instance && true;
};
