'use strict';
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('../libs/logger').getLogger('config.js');

global.serverUrl = "http://192.168.2.41:3001/Speech/";//发布地址

var viewConfig = function(){
    fs.exists(nwDir + '/config.ini', function (exists) {
        if (exists) {
            var data = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
            $("#soundModal input[name=speed]").val(data.sound.speed);
            $("#soundModal input[name=volume]").val(data.sound.volume);
            $("#soundModal select[name=timbre]").val(data.sound.timbre);
            //$("#configureModal input[name=url]").val(data.configure.url);
            //$("#configureModal input[name=address]").val(data.configure.ip);
            //$("#configureModal input[name=releaseUrl]").val(data.configure.releaseUrl);
            $("#playModal input[name=taskNumber]").val(data.play.taskNumber);
            $("#playModal input[name=aheadTime]").val(data.play.aheadTime);
            $("#playModal input[name=rulePlay]").val(data.play.rulePlay);
            $("#getDataModal input[name=updateTime]").val(data.updateData.updateTime);
            $("#loginModal input[name=user]").val(data.login.user);
            $("#loginModal input[name=password]").val(data.login.password);
        }else{
            fs.createWriteStream(nwDir + '/config.ini', {start: 0, flags: "w", encoding: "utf8"});
            var c = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
            c.scope = "local";
            fs.writeFileSync(nwDir + "/config.ini", ini.stringify(c));
        }
    })
};

var saveSoundConfig = function () {
    $("#saveSoundConfig").click(function () {
        var speed = $("#soundModal input[name=speed]").val();
        var volume = $("#soundModal input[name=volume]").val();
        var timbre = $("#soundModal select[name=timbre]").val();
        var s = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (s.sound == undefined) {
            s.sound = {};
        }
        s.sound.speed = speed;
        s.sound.volume = volume;
        s.sound.timbre = timbre;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(s), {start: 0, flags: "w", encoding: "utf8"});
        //TODO 同步语音合成
    });
};

var savePlayConfig = function () {
    $("#savePlayConfig").click(function () {
        var taskNumber = $("#playModal input[name=taskNumber]").val();
        var aheadTime = $("#playModal input[name=aheadTime]").val();
        var rulePlay = $("#playModal input[name=rulePlay]").val();

        var p = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (p.play == undefined) {
            p.play = {};
        }
        p.play.taskNumber = taskNumber;
        p.play.aheadTime = aheadTime;
        p.play.rulePlay = rulePlay;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(p), {start: 0, flags: "w", encoding: "utf8"});
    });
};

var saveGetDataConfig = function(){
    $("#saveGetDataConfig").click(function () {
        var updateTime = $("#getDataModal input[name=updateTime]").val();
        var d = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (d.updateData == undefined) {
            d.updateData = {};
        }
        d.updateData.updateTime = updateTime;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(d), {start: 0, flags: "w", encoding: "utf8"});
    });
};

var init = function () {
    viewConfig();
    saveSoundConfig();
    savePlayConfig();
    saveGetDataConfig();
};

init();

