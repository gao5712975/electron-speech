/**
 * Created by Yuan on 2015/11/17.
 */
var alertModal = function (text) {
    $("#alertModalText").text(text);
    $("[data-target=#alertModal]").trigger("click");
    $('#alertModal').on('hidden.bs.modal', function () {
        $("body").css("padding-right", "0");
    });
};

var rulePlay = {
    rulePlayStr: function (data,rule) {
        if (rule != undefined && rule != "") {
            rule = rule.replace("${terminus}", data.terminus);
            rule = rule.replace("${carNumber}", rulePlay.numberOfString(data.carNumber));
            rule = rule.replace("${time}", data.time);
            rule = rule.replace("${platformNo}", data.platformNo);
        } else {
            rule = "尊敬的旅客，去往终点站、" + data.terminus + "、班次为" + rulePlay.numberOfString(data.carNumber) + "号的汽车、将在" + data.time + "准时发车，请旅客们提前去往" + data.platformNo + "，谢谢！";
        }
        return rule;
    }, numberOfString: function (number) {
        var s = number.split("");
        var nu = "";
        for (var i = 0, j = s.length; i < j; i++) {
            switch (s[i]) {
                case '0':
                    nu += "零";
                    break;
                case '1':
                    nu += "一";
                    break;
                case '2':
                    nu += "二";
                    break;
                case '3':
                    nu += "三";
                    break;
                case '4':
                    nu += "四";
                    break;
                case '5':
                    nu += "五";
                    break;
                case '6':
                    nu += "六";
                    break;
                case '7':
                    nu += "七";
                    break;
                case '8':
                    nu += "八";
                    break;
                case '9':
                    nu += "九";
                    break;
                default:
                    nu += s[i];
                    break;
            }
        }
        return nu;
    }
};

module.exports = {
    alertModal: alertModal,
    rulePlay: rulePlay
};