/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('../libs/logger').getLogger('data_node.js');
var utils = require('../libs/utils');
var SDK = require('../libs/play');

//!*根据地址获取数据*!
global.carData = [];
var time;
var getDate = function () {
    $("#getData").click(function () {
        var optUrl = url.parse(serverUrl + "admin/findDataList.do");
        optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
        optUrl.method = "post";

        var postData = "";
        var manage = http.request(optUrl, function (ma) {
            ma.setEncoding('utf8');
            ma.on("data", function (data) {
                postData += data;
            }).on("end", function () {
                var json = JSON.parse(postData);
                if (json.status == "01") {
                    global.carData = json.result;

                    clearInterval(time);
                    $("#getData").button("loading");//防止一直获取数据
                    $("#countdown").removeClass("hide");
                    var s = 60;
                    time = setInterval(function () {
                        $("#countdown").html(s + "s", s-- + "s");
                        if (s == -1) {
                            clearInterval(time);
                            $("#getData").button('reset');
                            $("#countdown").addClass("hide")
                        }
                    }, 1000);

                    viewTable();
                } else if (json.status == "00") {
                    utils.alertModal("请登录");//没有登录
                } else {
                    utils.alertModal("系统错误");//系统错误
                }
            }).on("error", function (e) {
                logger.error("getDate"+e.message);
            });
        });
        manage.on('error', function (e) {
            logger.error("getDate"+e.message);
            utils.alertModal("服务连接失败");//系统错误
        });
        manage.write(querystring.stringify({id: global.company_id}));
        manage.end();
    })
};

var viewTableFun = {
    appendCarList: function (json, id, cb) {
        var s = "";
        $.each(json, function (index, obj) {
            if (!obj.number) {
                obj.number = $("#playModal input[name=taskNumber]").val();
            }
            var select = "<button type='button'data-loading-text='立即播放' class='btn btn-success singleCarList' onclick=\"singleCarListPlay(\'" + obj.id + "\')\">立即播放</button> <button type='button' class='btn btn-info'onclick=\"modifyCarListView(\'" + obj.id + "\')\">修改</button>";
            s += "<tr data-json=\'" + JSON.stringify(obj) + "\' id=\'" + obj.id + "\' class='text-center'><td>" + obj.time + "</td><td>" + obj.carNumber + "</td><td>" + obj.terminus + "</td><td>" + obj.carType + "</td><td>" + obj.platformNo + "</td><td>" + obj.number + "</td><td>" + select + "</td></tr>";
        });
        setTimeout(function () {
            cb(id, s);
            s = "";
        }, 30)
    },
    appendHistory: function (json, id, cb) {
        var s = "";
        $.each(json, function (index, obj) {
            obj.number = $("#playModal input[name=taskNumber]").val();
            var select = "<button type='button' class='btn btn-info' onclick=\"goTop(\'viewCarList\',\'" + obj.id + "\')\">顶部</button> <button type='button' class='btn btn-success'onclick=\"goButton(\'viewCarList\',\'" + obj.id + "\')\">尾部</button>";
            s += "<tr data-json=\'" + JSON.stringify(obj) + "\' id=\'" + obj.id + "\' class='text-center'><td>" + obj.time + "</td><td>" + obj.carNumber + "</td><td>" + obj.terminus + "</td><td>" + obj.carType + "</td><td>" + obj.platformNo + "</td><td>" + obj.number + "</td><td>" + select + "</td></tr>";
        });
        setTimeout(function () {
            cb(id, s);
            s = "";
        }, 30)
    },
    appendStr: function (id, str) {
        $("#" + id).append(str);
    },
    viewCarList: function (data) {
        $("#viewCarList").children("tr").remove();
        viewTableFun.appendCarList(data, "viewCarList", viewTableFun.appendStr);
    },
    viewHistory: function (data) {
        $("#historyList").children("tr").remove();
        viewTableFun.appendHistory(data, "historyList", viewTableFun.appendStr);
    },
    carTohistory: function (id) {
        var s = "<button type='button' class='btn btn-info' onclick=\"goTop(\'viewCarList\',\'" + id + "\')\">顶部</button> <button type='button' class='btn btn-success'onclick=\"goButton(\'viewCarList\',\'" + id + "\')\">尾部</button>";
        $("#" + id).children("td:eq(6)").html(s);
        return $("#" + id);
    },
    historyToCar: function (id) {
        var s = "<button type='button' data-loading-text='立即播放' class='btn btn-success singleCarList' onclick=\"singleCarListPlay(\'" + id + "\')\">立即播放</button> <button type='button' class='btn btn-info'onclick=\"modifyCarListView(\'" + id + "\')\">修改</button>";
        $("#" + id).children("td:eq(6)").html(s);
        return $("#" + id);
    },
    viewSpeechStr: function (data) {
        var select = "<div class='btn-group'><button type='button' class='btn btn-success' onclick=\"singlePlay(\'" + data.id + "\')\">播放</button> <button type='button' class='btn btn-info'onclick=\"modifySpeech(\'" + data.id + "\')\">修改</button> <button type='button' class='btn btn-warning'onclick=\"deleteSpeech(\'" + data.id + "\')\">删除</button></div>";
        var str = "<tr class='text-center' data-json='" + JSON.stringify(data) + "' id='" + data.id + "'><td>" + data.title + "</td><td>" + data.content + "</td><td> " + select + " </td></tr>";
        return str;
    }
};

/*从本地取数据展现*/
var array = [];//车次列表
var oldArray = [];//历史车次列表
var viewTable = function () {
    var data = global.carData;
    array.length = 0;
    oldArray.length = 0;
    for (var s in data) {
        var hour = new Date().getHours();
        var minutes = new Date().getMinutes();
        var hour_d = parseInt(data[s].time.split(":")[0]);
        var minutes_d = parseInt(data[s].time.split(":")[1]);
        /*过滤已修改的播报次数的车次*/
        if (JSON.stringify(global.taskModifyArray).indexOf(data[s].id) != -1) {
            for (var i = 0, j = global.taskModifyArray.length; i < j; i++) {
                if (global.taskModifyArray[i].id == data[s].id) {
                    data[s].number = global.taskModifyArray[i].number;
                }
            }
        }
        /*过滤到期时间*/
        if (hour_d > hour || (hour_d == hour && minutes_d + 1 > minutes)) {
            if (global.carBusId.indexOf(data[s].id) == -1) {
                array.push(data[s]);
            } else {
                oldArray.push(data[s]);
            }
        } else {
            oldArray.push(data[s]);
        }
    }
    viewTableFun.viewCarList(array);
    viewTableFun.viewHistory(oldArray);
};

/*保存以修改播报次数的车次信息 数组长度大于500，推陈出新*/
global.taskModifyArray = [];
var saveCarListNumber = function () {
    $("#saveCarList").click(function () {
        var id = $("#modifyCarListViewModal input[name=taskNumberId]:hidden").val();
        var data = $("#" + id).attr("data-json");
        data = JSON.parse(data);
        var taskNumber = $("#modifyCarListViewModal input[name=taskNumber]").val();
        data.number = parseInt(taskNumber);

        global.taskModifyArray.unshift(data);
        if (global.taskModifyArray.length >= 1000) {
            global.taskModifyArray.pop();
        }
        $("#" + id).children("td:eq(5)").html(taskNumber);
        $("#" + id).attr("data-json", JSON.stringify(data));
    });
};

/*自动跟新数据*/
var updateTime;
var autoGetData = function () {
    clearInterval(updateTime);
    var time = $("#getDataModal input[name=updateTime]").val();
    var intervalTime = parseInt(time) * 1000 * 60;
    /*每过一段时间跟新数据*/
    updateTime = setInterval(function () {
        $("#getData").trigger("click");
    }, intervalTime);
};

/*---------------play-----------------*/
var play = function () {
    $("#play").click(function () {
        if ($("#viewCarList >tr").length != 0) {
            var json = $("#viewCarList").children("tr:first").attr("data-json");
            json = JSON.parse(json);
            var id = json.id;
            var number = json.number;
            var rule = $("#playModal input[name=rulePlay]").val();
            var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
            var aheadTime = $("#playModal input[name=aheadTime]").val();
            var data = {speech: rulePlay, id: id, time: json.time, aheadTime: aheadTime, taskNumber: number};

            $("#" + id).attr("class", "success text-center");
            $("#play").button("loading");

            SDK.play(data, function (d) {
                console.info("play" + d.status);
                if (d.status == '0') {
                    var historyList = $("#historyList");
                    if (historyList.children("tr[id=" + id + "]").length == 0) {
                        historyList.append(viewTableFun.carTohistory(id));
                    } else {
                        $("#viewCarList").children("tr[id=" + id + "]").remove();
                    }
                    $("#play").trigger("click");
                    $("#" + id).attr("class", "text-center");
                } else if (d.status == "1") {
                    $("#play").trigger("click");
                } else {
                    $("#play").button("reset");
                    $("#" + id).attr("class", "text-center");
                }
            });
        } else {
            $("#play").button("reset");
            return false;
        }
    })
};

/*------------stop-----------*/
var stop = function () {
    $("#stop,#speechStop").click(function () {
        SDK.stop(function (d, time) {
            if (d.status == 1) {
                if (time) {
                    time.cancel();
                }
                $("#play").button("reset");
                $("#speechJob").button("reset");
            }
        })
    })
};

/*-----------speechPlay-----------*/
var speechPlay = function () {
    $("#speechPlay").click(function () {
        $("#speechPlay").button("loading");
        SDK.speechPlay({speech: $("input[name=speech]").val(), taskNumber: 1}, function (data) {
            if (data.status == 0) {
                console.info(data.status);
                $("#speechPlay").button("reset");
                //TODO
            }
        })
    })
};

var saveSpeech = function () {
    $("#saveSpeech").click(function () {
        var data = {
            title: $("#addSpeechModal input[name=title]").val(),
            content: $("#addSpeechModal textarea[name=content]").val()
        };
        var key = uuid.v1().replace(/\-/g, "");
        fs.exists(nwDir + '/tempJob.ini', function (exists) {
            if (!exists) {
                fs.createWriteStream(nwDir + '/tempJob.ini', {start: 0, flags: "w", encoding: "utf8"});
                var c = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
                c.scope = "local";
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(c));
            }
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content == undefined) {
                sp.content = {};
            }
            data.id = key;
            sp.content[key] = data;
            fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
            $("#speechList").append(viewTableFun.viewSpeechStr(data));
        });
    })
};

var viewSpeech = function () {
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                $.each(sp.content, function (index, obj) {
                    $("#speechList").append(viewTableFun.viewSpeechStr(obj));
                });
            }
        }
    });
};

var updateSpeech = function () {
    var id = $("#addSpeechModal input[name=speechId]:hidden").val();
    var data = {
        id: id,
        title: $("#addSpeechModal input[name=title]").val(),
        content: $("#addSpeechModal textarea[name=content]").val()
    };
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                sp.content[id].title = data.title;
                sp.content[id].content = data.content;
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
                $("#" + id).attr("data-json", JSON.stringify(data));
                $("#" + id).children("td:eq(0)").html(data.title);
                $("#" + id).children("td:eq(1)").html(data.content);
            }
        }
    });
};

var init = function () {
    /*手动获取数据*/
    getDate();
    /*展现本地数据*/
    viewTable();
    /*保存以修改播报次数的车次信息*/
    saveCarListNumber();
    /*自动获取数据*/
    autoGetData();
    /*任务播报*/
    play();
    /*任务停止*/
    stop();
    /*插播*/
    speechPlay();
    /*保存自定义任务*/
    saveSpeech();
    /*展现自定义任务*/
    viewSpeech();
};

init();

/*-----------------------------------------------------------------------*/
/*修改播报次数展现页*/
function modifyCarListView(id) {
    $('#modifyCarListViewModal').modal({
        backdrop: true,
        show: true
    });
    $("#modifyCarListViewModal input[name=taskNumberId]:hidden").val(id);
}

global.carBusId = [];//已经读过的信息ID
/*保存以播报的车次ID 数组长度大于500，推陈出新*/
var saveCarBusId = function (id) {
    global.carBusId.unshift(id);
    if (global.carBusId.length == 1000) {
        global.carBusId.pop();
    }
};

function goTop(fid, id) {
    for (var i = 0; i < global.carBusId.length; i++) {
        if (id.indexOf(global.carBusId[i]) != -1) {
            global.carBusId.splice(i, 1);
            return global.carBusId;
        }
    }
    $("#" + fid).prepend(viewTableFun.historyToCar(id));
}

function goButton(fid, id) {
    for (var i = 0; i < global.carBusId.length; i++) {
        if (id.indexOf(global.carBusId[i]) != -1) {
            global.carBusId.splice(i, 1);
            return global.carBusId;
        }
    }
    $("#" + fid).prepend(viewTableFun.historyToCar(id));
}

/*新增修改自定义任务*/
function modifySpeech(id) {
    $('#addSpeechModal').modal({
        backdrop: true,
        show: true
    }).on('hidden.bs.modal', function (e) {
        $("#saveSpeech").removeClass("hide");
        $("#updateSpeech").addClass("hide");
        $("#addSpeechModalLabel").html("添加");
    });
    var data = JSON.parse($("#" + id).attr("data-json"));
    $("#addSpeechModal input[name=title]").val(data.title);
    $("#addSpeechModal input[name=speechId]:hidden").val(id);
    $("#addSpeechModal textarea[name=content]").val(data.content);
    $("#addSpeechModalLabel").html("修改");
    $("#saveSpeech").addClass("hide");
    $("#updateSpeech").removeClass("hide");
}

/*车次列表立即播报*/
function singleCarListPlay(id) {
    var json = $("#" + id).attr("data-json");
    json = JSON.parse(json);
    var number = json.number;
    var rule = $("#playModal input[name=rulePlay]").val();
    var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
    SDK.speechPlay({speech: rulePlay, taskNumber: number, id: id}, function (data) {
        if (data.status == '0') {
            var historyList = $("#historyList");
            /*历史列表中不存在就插入否则就移除*/
            if (historyList.children("tr[id=" + id + "]").length == 0) {
                historyList.append(viewTableFun.carTohistory(id));
            } else {
                $("#viewCarList").children("tr[id=" + id + "]").remove();
            }
            saveCarBusId(id);
        }
    });
}

/*删除自定义任务*/
function deleteSpeech(id) {
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                delete sp.content[id];
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
            }
        }
    });
    $("#" + id).remove();
}

