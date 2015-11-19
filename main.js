/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;
app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 585,
        width: 1000
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
});