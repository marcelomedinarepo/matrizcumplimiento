/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"ehs/ehs141/matrizcumplimiento/app/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});