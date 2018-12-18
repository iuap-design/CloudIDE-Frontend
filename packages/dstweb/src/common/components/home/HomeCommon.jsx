export const getDate = function (type, index) {
    var self = this;
    var now = new Date(); //当前日期
    var nowDayOfWeek = now.getDay(); //今天本周的第几天
    var nowDay = now.getDate(); //当前日
    var nowMonth = now.getMonth(); //当前月
    var nowQuarter = Math.floor((nowMonth + 3) / 3); //当前季度
    var quarter_start = (nowQuarter-1) * 3;
    var nowYear = now.getYear(); //当前年

    var lastMonthDate = new Date();  //上月日期
    lastMonthDate.setDate(1);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    var lastYear = nowYear - 1;
    var lastMonth = lastMonthDate.getMonth();

    nowYear += (nowYear < 2000) ? 1900 : 0;
    lastYear += (lastYear < 2000) ? 1900 : 0;
    switch (type) {
        case 'preday':/*昨天*/
            return self.Format(new Date(nowYear, nowMonth, nowDay - 1 ));
        case 'lastpreday':/*昨天的昨天*/
            return self.Format(new Date(nowYear, nowMonth, nowDay - 2 ));
        case 'yesterday':/**/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 1 ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 1 ));
            }
        case 'lastyesterday':/**/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 2 ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 2 ));
            }
        case 'day':/*今天*/
            return self.Format(new Date(nowYear, nowMonth, nowDay ));
        case 'seven':/*近7天*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay -  6));
            }
        case 'lastseven':/*近7天的 前7天*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 7 ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 7 - 6 ));
            }
        case 'thirty':/*近30天*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 29 ));
            }
        case 'lastthirty':/*近30天*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 30 ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 30 - 30 ));
            }
        case 'ninety':/*近90天*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay ));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - 89 ));
            }
        case 'week':/*本周*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek)));
            }
        case 'lastweek':/*上周*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7));
            } else {
                return self.Format(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1));
            }
        case 'month':/*本月*/
            if (index == 0) {
                return self.Format(new Date(nowYear, nowMonth, 1));
            } else {
                var monthStartDate = new Date(nowYear, nowMonth, 1);
                var monthEndDate = new Date(nowYear, nowMonth + 1, 1);
                var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                return self.Format(new Date(nowYear, nowMonth, days));
            }
        case 'lastmonth':/*上月*/
            if (index == 0) {
                return self.Format(new Date(nowYear, lastMonth, 1));
            } else {
                var monthStartDate = new Date(nowYear, lastMonth, 1);
                var monthEndDate = new Date(nowYear, lastMonth + 1, 1);
                var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                return self.Format(new Date(nowYear, lastMonth, days));
            }
        case 'quarter':/*本季度*/
            if (index == 0) {
                return self.Format(new Date(nowYear, quarter_start, 1));
            } else {
                var monthStartDate = new Date(nowYear, nowMonth, 1);
                var monthEndDate = new Date(nowYear, quarter_start + 3, 1);
                var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                return self.Format(new Date(nowYear, nowMonth, days));
            }
        case 'year':/*本年*/
            if (index == 0) {
                return self.Format(new Date(nowYear, 0, 1));
            } else {
                var monthStartDate = new Date(nowYear, 11, 1);
                var monthEndDate = new Date(nowYear, 11 + 1, 1);
                var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                return self.Format(new Date(nowYear, 11, days));
            }
        case 'lastyear':/*上年*/
            if (index == 0) {
                return self.Format(new Date(lastYear, 0, 1));
            } else {
                var monthStartDate = new Date(lastYear, 11, 1);
                var monthEndDate = new Date(lastYear, 11 + 1, 1);
                var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
                return self.Format(new Date(lastYear, 11, days));
            }
    }
}
export const Format = function(date,format) {
    var fmt = format?format:"yyyy-MM-dd";
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
export const  DateDiff = function(sDate1,  sDate2){    //sDate1和sDate2是2006-12-18格式  
        if(!sDate1) sDate1 = Format(new Date());
       var  aDate,  oDate1,  oDate2,  iDays;  
       aDate  =  sDate1.split("-")  
       oDate1  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0])    //转换为12-18-2006格式  
       aDate  =  sDate2.split("-")  
       oDate2  =  new  Date(aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0])  
       iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24)    //把相差的毫秒数转换为天数  
       return  iDays  
   }    