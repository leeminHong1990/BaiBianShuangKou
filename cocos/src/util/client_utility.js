"use strict"
var cutil = function(){}

cutil.lock_ui = function (){
	if(h1global.globalUIMgr){
		h1global.globalUIMgr.lock_ui.show();
	}
};

cutil.unlock_ui = function (){
	if(h1global.globalUIMgr){
		h1global.globalUIMgr.lock_ui.hide();
	}
};

cutil.randomContainBorder = function(a, b){ // a,b整数 并 包含a,b (a<=b)
	var sub = b-a;
	return Math.round(Math.random()*sub+a)
};

cutil.deepCopy = function(obj){
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            cutil.deepCopy(obj[i]) : obj[i]; 
        }
    }
    return newobj;
};

cutil.convert_time_to_date = function (rtime)
{
	var temp = os.date("*t", rtime)
	return temp.year.toString() + "年" + temp.month.toString() + "月" + temp.day.toString() + "日"
};

cutil.convert_time_to_hour2second = function (rtime)
{
	var temp = os.date("*t", rtime)
	return temp.hour.toString() + ":" + temp.min.toString()
};

cutil.convert_time_to_stime = function (ttime)
{
	var temp = os.date("*t", ttime)
	return temp.year.toString() + "/" + temp.month.toString() + "/" + temp.day.toString() + "  "+ temp.hour.toString() + ":"+ temp.min.toString() + ":" + temp.sec.toString()
};

cutil.convert_seconds_to_decimal = function(seconds, decimalNum){
	seconds = String(seconds)
	var lis = [[], []]
	var index = 0
	for (var i = 0; i < seconds.length; i++) {
		if (seconds[i] === '.') {
			index += 1
		}
		if (index <= 1 && seconds[i] !== '.') {
			lis[index].push(seconds[i])
		}
	}
	if (lis[0].length <= 0) {
		return null;
	}
	var integerPart = ""
	for (var i = 0; i < lis[0].length; i++) {
		integerPart += lis[0][i];
	}
	var decimalPart = ""
	if (lis[1].length < decimalNum) {
		for (var i = 0; i < lis[1].length; i++) {
			decimalPart += lis[1][i];
		}
		for (var i = 0; i < decimalNum-lis[1].length; i++) {
			decimalPart += '0';
		}
	} else {
		for (var i = 0; i < decimalNum; i++) {
			decimalPart += lis[1][i];
		}
	}
	return integerPart + "." + decimalPart
}

cutil.convert_second_to_hms = function (sec)
{
	if (!sec || sec <= 0) {return "00:00:00";}
	sec = Math.floor(sec);
	var hour = Math.floor(sec / 3600);
	var minute = Math.floor((sec % 3600) / 60);
	var second = (sec % 3600) % 60;
	// cc.log(second)
	
	var timeStr = "";
	if (hour < 10) {
		timeStr = timeStr + "0" + hour + ":";
	}else {
        timeStr = hour + ":";
    }
	if (minute < 10) {
		timeStr = timeStr + "0" + minute + ":";
	} else {
		timeStr = timeStr + minute + ":";
	}
	if (second < 10) {
		timeStr = timeStr + "0" + second;
	} else {
		timeStr = timeStr + second;
	}
	return timeStr;
}

cutil.convert_second_to_ms = function (sec)
{
	if (!sec || sec <= 0) {return "00:00";}
	sec = Math.floor(sec);

	var minute = Math.floor(sec / 60);
	var second = sec % 60;
	// cc.log(second)
	
	var timeStr = "";
	if (minute < 10) {
		timeStr = timeStr + "0" + minute + ":";
	} else {
		timeStr = timeStr + minute + ":";
	}
	if (second < 10) {
		timeStr = timeStr + "0" + second;
	} else {
		timeStr = timeStr + second;
	}
	return timeStr;
}


cutil.resize_img = function( item_img, size )
{
	var rect = item_img.getContentSize()
	var scale = size / rect.height
	var width = rect.width * scale
	if (width > size)
		scale = size / rect.width
	item_img.setScale(scale)
};

cutil.show_portrait_by_num = function (portrait_img,  characterNum)
{
	if (characterNum <= 100){
        portrait_img.loadTexture("res/portrait/zhujue" + characterNum + ".png")
	}
    else
    {
		// var table_mercenary = require("data/table_mercenary")
		var mercenary_info = table_mercenary[characterNum]
		KBEngine.DEBUG_MSG("mercenary_info", mercenary_info["PORTRAIT"])
		portrait_img.loadTexture("res/portrait/" + mercenary_info["PORTRAIT"] + ".png")
    }
};


cutil.print_table = function (lst)
{
	if (lst === undefined)
	{
		KBEngine.DEBUG_MSG("ERROR------>Table is undefined")
		return;
	} 
	for (var key in lst)
	{
		var info = lst[key];
    	KBEngine.DEBUG_MSG(key + " : " + info)
    	if (info instanceof Array)
    	{
        	cutil.print_table(info);
    	}
	}
};

cutil.is_in_list = function (x, t){
	for(var index in t){
		if (t[index] === x) {
			return  index;
		}
	}
	return null;
}


cutil.str_sub = function (strinput, len)
{
	if (strinput.length < len)
		return strinput
	if (strinput.length >= 128 && strinput.length < 192) 
		return cutil.str_sub(strinput, len - 1)
	return strinput.substring(0, len)
};

cutil.info_sub = function (strinput, len)
{
	var output = cutil.str_sub(strinput, len)
	if (output.length < strinput.length)
	{
		return output + "..."
	}
	return output
};
/*
cutil.deep_copy_table = 
	function (tb)
		if type(tb) ~= "table" then return tb end
		var result = {}
		for i, j in pairs(tb) do
			result[i] = cutil.deep_copy_table(j)
		end
		return result
	end
*/
cutil.convert_num_to_chstr = function(num)
{
	if (typeof num !== "number") {
		// 处理UINT64
		num = num.toDouble();
	}
	function convert(num, limit, word)
	{
		var integer = Math.floor(num / limit);
		var res_str = integer.toString();
		var floatNum = 0;
		if (integer < 10)
		{
			// floatNum = (Math.floor((num % limit) / (limit / 100))) * 0.01;
			floatNum = (Math.floor((num % limit) / (limit / 100)));
			if(floatNum < 1){
			} else if(floatNum < 10) {
				res_str = res_str + ".0" + floatNum.toString();
			} else {
				res_str = res_str + "." + floatNum.toString();
			}
		}
		else if (integer < 100)
		{
			floatNum = (Math.floor((num % limit) / (limit / 10)));
			if(floatNum < 1){
			} else {
				res_str = res_str + "." + floatNum.toString();
			}
		}
		// floatNum = Math.floor(floatNum * limit)/limit
		// integer += floatNum;

		// return integer.toString() + word;
		// cc.log(num)
		// cc.log(res_str + word)
		return res_str + word;
	}

	if (num >= 1000000000)
	{
		return convert(num, 1000000000, "B");
	}
	else if (num >= 1000000)
	{
		return convert(num, 1000000, "M");
	}
	else if (num >= 1000)
	{
		return convert(num, 1000, "K");
	}
	else
	{
		return Math.floor(num).toString();
	}
		
};

cutil.splite_list = function (list, interval, fix_length)
{
	var result_list = [];
	for (var i = 0; i < list.length; ++i)
	{
		var idx = Math.floor(i / interval);
		if (idx >= result_list.length)
		{
			result_list[idx] = [];
		}
		result_list[idx][i - idx * interval] = list[i];
	} 

	if (fix_length && result_list.length < fix_length)
	{
		for (var i = result_list.length; i < fix_length; ++i)
		{
			result_list.push([]);
		}
	}
	return result_list;
};


cutil.get_rotation_angle = function(vec2)
{
	var vec2_tan = Math.abs(vec2.y) / Math.abs(vec2.x);
	var angle = 0
	if (vec2.y == 0)
	{
		if (vec2.x > 0){
			angle = 90
		}
		else if (vec2.x < 0){
			angle = 270
		}
	}
	else if (vec2.x == 0){
		if (vec2.y > 0){
			angle = 0
		}
		else if (vec2.y < 0){
			angle = 180
		}
	}
	else if (vec2.y > 0 && vec2.x < 0){
		angle = Math.atan(vec2_tan)*180 / Math.pi - 90;
	}
	else if (vec2.y > 0 && vec2.x > 0){
		angle = 90 - Math.atan(vec2_tan)*180/Math.pi
	}
	else if (vec2.y < 0 && vec2.x < 0){
		angle = -Math.atan(vec2_tan)*180/Math.pi - 90;
	}
	else if (vec2.y < 0 && vec2.x > 0){
		angle = Math.atan(vec2_tan)*180/Math.pi + 90;
	}
	return angle
};

cutil.post_php_info = function (info, msg)
{
	var xhr = new cc.XMLHttpRequest()
	xhr.responseType = 0 // cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr.open("GET", "http://" + switches.httpServerIP + "/log_client.php?key=" + info +   "&value=" +  msg)
	function onReadyStateChange()
	{

	}
	xhr.registerScriptHandler(onReadyStateChange)
	xhr.send()
};


cutil.post_php_feedback = function (info, msg)
{
	var xhr = new cc.XMLHttpRequest()
	xhr.responseType = 0 // cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr.open("GET", "http://" + switches.httpServerIP + "/log_feedback.php?key=" + info +  "&value=" + msg)
	function onReadyStateChange(){}
	xhr.registerScriptHandler(onReadyStateChange)
	xhr.send()
};


cutil.printMessageToLogcat = function (message)
{
	if (targetPlatform === cc.PLATFORM_OS_ANDROID)
	{
        //var ok,ret  = luaj.callStaticMethod("org/cocos2dx/lua/AppActivity", "sPrintMsg", { message }, "(Ljava/lang/String;)V")
	}
};

cutil.openWebURL = function (url)
{
	if (targetPlatform == cc.PLATFORM_OS_ANDROID){
        //var ok,ret  = luaj.callStaticMethod("org/cocos2dx/lua/AppActivity", "sOpenWebURL", { url }, "(Ljava/lang/String;)V")
	}

};

cutil.get_uint32 = function (inputNum)
{
	return Math.ceil(inputNum) % 4294967294
};

cutil.schedule = function(node, callback, delay)
{
	// var delayAction = cc.DelayTime.create(delay);
	// var sequence = cc.Sequence.create(delay, cc.CallFunc.create(callback));
	// var action = cc.RepeatForever.create(sequence);
	// node.runAction(action);
	var action = cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(delay), cc.CallFunc.create(callback)));
	node.runAction(action);
	return action;
};

cutil.performWithDelay = function(node, callback, delay)
{
	var delayAction = cc.DelayTime.create(delay);
	var sequence = cc.Sequence.create(delay, cc.CallFunc.create(callback));
	node.runAction(sequence);
	return sequence;
};

cutil.binarySearch = function(targetList, val, func){
	func = func || function(x, val){return val - x;};
	var curIndex = 0;
	var fromIndex = 0;
	var toIndex = targetList.length - 1;
	while(toIndex > fromIndex){
		curIndex = Math.floor((fromIndex + toIndex) / 2);
		if (func(targetList[curIndex], val) < 0){
			toIndex = curIndex;
		}else if (func(targetList[curIndex], val) > 0){
			fromIndex = curIndex + 1;
		}else if (func(targetList[curIndex], val) == 0){
			return curIndex + 1;
		}
	}
	return toIndex;
};

cutil.get_count = function(cards, t){
	var sum = 0;
	for(var i = 0; i < cards.length; i++){
		if(cards[i] == t){
			sum++;
		}
	}
	return sum;
};

// 用于调用本地时，保存回调方法的闭包
cutil.callFuncs = {};
cutil.callFuncMax = 10000;
cutil.callFuncIdx = -1;
cutil.addFunc = function(callback){
    cutil.callFuncIdx = (cutil.callFuncIdx + 1) % cutil.callFuncMax;
    cutil.callFuncs[cutil.callFuncIdx] = callback;
    return cutil.callFuncIdx;
}
cutil.runFunc = function(idx, param){
    if(cutil.callFuncs[idx]){
        (cutil.callFuncs[idx])(param);
        cutil.callFuncs[idx] = undefined;
    }
}

cutil.portraitCache = {};

cutil.loadPortraitTexture = function(url, callback, filename){
	cc.log("loadPortraitTexture:", url)
	if(!url){
		if(callback){
			callback("res/ui/Default/defaultPortrait.png");
		}
		return;
	}
	if(cutil.portraitCache[url]){
		callback(cutil.portraitCache[url]);
		return;
	}
	var fid = cutil.addFunc(function(img){cutil.portraitCache[url] = img;callback(img);});
	if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
		filename = filename || h1global.entityManager.player().uuid.toString() + ".png";
		// download portrait
        // var pathurl = 'http://wx.qlogo.cn/mmopen/Q3auHgzwzM6zHFzbk0YyibNTMxxibJ2yhg2eq0sIBOgFHCKvSBsibkm2pjYVcwgjwsJlI4yrJvWzXBYHRohiced8tQ/0';
        // var filename = 'me.jpg';
        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "downloadAndStoreFile", "(Ljava/lang/String;Ljava/lang/String;I)V", url, filename, fid);
	} else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
		filename = filename || h1global.entityManager.player().uuid.toString() + ".png";
		jsb.reflection.callStaticMethod("DownloaderOCBridge", "downloadAndStorePortrait:WithLocalFileName:AndFuncId:", url, filename, fid);
	} else {
		cc.loader.loadImg([url], {"isCrossOrigin":false}, function(err, img){cutil.runFunc(fid, img);});
	}
};

cutil.captureScreenCallback = function(success, filepath){
	// 安卓截屏回调
	if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) && success){
		jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareImg", "(ZLjava/lang/String;)V", true, filepath);
	}
};

cutil.getMaxSerialCard = function(){
	return const_val.HEI[const_val.HEI.length - 2];
};

cutil.getMinSerialCard = function(){
	return const_val.HEI[0]
};

cutil.classifyCards = function(cards){ //区分 大王 
	var notBigJokerList = [];
	var bigJokers = [];
	for (var i = 0; i < cards.length; i++) {
		if (const_val.HEI.indexOf(cards[i]) >= 0 || const_val.HONG.indexOf(cards[i]) >= 0 || const_val.MEI.indexOf(cards[i]) >= 0 || const_val.FANG.indexOf(cards[i]) >= 0 || const_val.JOKER.indexOf(cards[i]) == 0) {
			notBigJokerList.push(cards[i])
		}else if (const_val.JOKER.indexOf(cards[i]) == 1) {
			bigJokers.push(cards[i])
		}
	}
	return [notBigJokerList, bigJokers]
};

cutil.getJokerNum = function(cards){ //王的张数
	var num = 0
	for (var i = 0; i < cards.length; i++) {
		if(const_val.JOKER.indexOf(cards[i]) >= 0){
			num += 1;
		}
	}
	return num
};

cutil.getSmallJokerNum = function(cards){
	var num = 0
	for (var i = 0; i < cards.length; i++) {
		if(const_val.JOKER.indexOf(cards[i]) == 1){
			num += 1;
		}
	}
	return num
};

cutil.getBigJokerNum = function(cards){
	var num = 0
	for (var i = 0; i < cards.length; i++) {
		if(const_val.JOKER.indexOf(cards[i]) == 0){
			num += 1;
		}
	}
	return num
};

cutil.getCard2ListDict = function(oringin_cards){
	var card2ListDict = {}
	for (var i = 0; i < oringin_cards.length; i++) {
		var shiftCard = oringin_cards[i] >> 3
		if (card2ListDict[shiftCard]) {
			card2ListDict[shiftCard].push(oringin_cards[i])
		}else{
			card2ListDict[shiftCard] = [oringin_cards[i]]
		}
	}
	return card2ListDict
};

cutil.cardSortFunc = function(a, b){
	return b-a;
};

cutil.getKeyList = function(dic){
	var list = Object.keys(dic)
	for (var i = 0; i < list.length; i++) {
		list[i] = Number(list[i])
	}
	list = list.sort(function(a,b){return a-b})
	return list
};

cutil.getCard2NumDict = function(cards){
	var card2NumDict = {}
	for (var i = 0; i < cards.length; i++) {
		if(card2NumDict[cards[i]]){
			card2NumDict[cards[i]] ++
		} else {
			card2NumDict[cards[i]] = 1
		}
	}
	return card2NumDict
};

cutil.checkIsSingle = function(cards){
	if (cards.length == 1) {
		return true
	}
	return false
};

cutil.checkIsPair = function(cards){
	if (cards.length == 2 && cards[0] == cards[1]) {
		return true
	}
	return false
};

cutil.checkIsSerialPair = function(cards){
	if (cards.length < 6 || cards.length%2 != 0) {
		return false
	}
	var card2NumDict = cutil.getCard2NumDict(cards)
	//数量
	for (var key in card2NumDict) {
		if (card2NumDict[key] != 2) {
			return false;
		}
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length - 1; i++) {
		if (keyList[i] + 1 != keyList[i+1]) {
			return false;
		}
	}
	return true
};

cutil.checkIsTriple = function(cards){
	cc.log("checkIsTriple")
	if (cards.length == 3 && cards[0] == cards[1] && cards[0] == cards[2]) {
		return true
	}
	return false
};

cutil.checkIsSerialTriple = function(cards){
	var card2NumDict = cutil.getCard2NumDict(cards)
	//3种以上
	if (Object.keys(card2NumDict).length < 3) {
		return false
	}
	//每样3张
	for (var key in card2NumDict) {
		if (card2NumDict[key] != 3) {
			return false
		}
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length-1; i++) {
		if (keyList[i]+1 != keyList[i+1]) {
			return false
		}
	}
	return true
};

cutil.checkIsSerialSingle = function(cards){
	if (cards.length < 5) {return false;}
	var card2NumDict = cutil.getCard2NumDict(cards)
	for (var key in card2NumDict) {
		if (card2NumDict[key] != 1) {return false;}
	}
	var keyList = cutil.getKeyList(card2NumDict)
	cc.log(keyList)
	for (var i = 0; i < keyList.length - 1; i++) {
		if (keyList[i] + 1 != keyList[i+1]) {
			cc.log(i)
			return false;
		}
	}
	return true;
};

cutil.checkIsNormalBomb = function(cards){
	var card2NumDict = cutil.getCard2NumDict(cards)
	if (cards.length >= 4 && Object.keys(card2NumDict).length == 1) {
		return true;
	}
	return false;
};

cutil.getSerialBombNum = function(cards){ //连炸 每个炸弹张数
	var card2NumDict = cutil.getCard2NumDict(cards)
	for (var card in card2NumDict) {
		return card2NumDict[card]
	}
};

cutil.getSerialBombSerialNum = function(cards){ //连炸 x连炸
	var card2NumDict = cutil.getCard2NumDict(cards)
	return Object.keys(card2NumDict).length
};

cutil.checkIsSerialBomb = function(cards){
	cc.log("checkIsSerialBomb")
	if (cards.length < 12) {return false;}
	//数量
	var card2NumDict = cutil.getCard2NumDict(cards)
	var cardNum = cutil.getSerialBombNum(cards)
	for (var card in card2NumDict) {
		if (card2NumDict[card] != cardNum || card2NumDict[card] < 4) {
			return false
		}
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict)
	if (keyList.length < 3) {return false;}
	//先判断2 ,连炸 2 要特殊处理 可以循环
	if (keyList.indexOf(const_val.CARD2) >= 0) {
		var copySerial = cutil.deepCopy(keyList)
		for (var i = 0; i < const_val.CIRCLE.length; i++) {
			if (copySerial.indexOf(const_val.CIRCLE[i]) >= 0) {
				copySerial.splice(copySerial.indexOf(const_val.CIRCLE[i]), 1)
			}else{
				break
			}
		}

		for (var i = const_val.CIRCLE.length - 1; i >= 0; i--) {
			if (copySerial.indexOf(const_val.CIRCLE[i]) >= 0) {
				copySerial.splice(copySerial.indexOf(const_val.CIRCLE[i]), 1)
			}else{
				break
			}
		}
		cc.log("copySerial=======>:", copySerial)
		if (copySerial.length <= 0) {
			return true
		}
	}
	// var card2Index = keyList.indexOf(const_val.CARD2)
	// if (card2Index > 0) {
	// 	//往后
	// 	var beforeList = []
	// 	var isEndSerial = true
	// 	for (var i = 0; i < keyList.length; i++) {
	// 		if (!isEndSerial) {
	// 			beforeList.push(keyList[i]);
	// 			continue;
	// 		}
	// 		if (i != const_val.CIRCLE.indexOf(keyList[i])) { //如果不连续
	// 			isEndSerial = false
	// 			beforeList.push(keyList[i]);
	// 		}
	// 	}
	// 	//往前
	// 	beforeList.sort(function(a,b){return a-b})
	// 	var needList = const_val.CIRCLE.slice(-1, -beforeList.length-1)
	// 	needList.sort(function(a,b){return a-b})
	// 	for (var i = 0; i < beforeList.length; i++) {
	// 		if (beforeList[i] != needList[i]) {
	// 			return false
	// 		}
	// 	}
	// }
	for (var i = 0; i < keyList.length - 1; i++) {
		if (keyList[i] + 1 != keyList[i+1]) {
			return false
		}
	}
	return true
};


cutil.checkIs3Joker = function(cards){
	cc.log("checkIs3Joker")
	// 3张
	if (cards.length != 3) {return false;}
	var card2NumDict = cutil.getCard2NumDict(cards)
	// 2种
	if (Object.keys(card2NumDict).length !=2) {
		return false
	}
	// 大小王
	var jokerList = []
	for (var i = 0; i < const_val.JOKER.length; i++) {
		jokerList.push(const_val.JOKER[i] >> 3)
	}
	var keyList = cutil.getKeyList(card2NumDict)
	cc.log(keyList)
	for (var i = 0; i < keyList.length; i++) {
		if (jokerList.indexOf(keyList[i]) < 0) {
			return false
		}
	}
	return true
};

cutil.checkIs4Joker = function(cards){
	cc.log("checkIs4Joker")
	// 4张
	if (cards.length != 4) {return false;}
	var card2NumDict = cutil.getCard2NumDict(cards)
	// 2种
	if (Object.keys(card2NumDict).length !=2) {
		return false
	}
	// 大小王
	var jokerList = []
	for (var i = 0; i < const_val.JOKER.length; i++) {
		jokerList.push(const_val.JOKER[i] >> 3)
	}
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length; i++) {
		if (jokerList.indexOf(keyList[i]) < 0) {
			return false
		}
	}
	return true
};

//百变双扣计算
cutil.checkIsJokerPair = function(cardsButJoker, jokers){ //对子
	cc.log("checkIsJokerPair")
	if (cardsButJoker.length == 1 && jokers.length == 1) {
		return true;
	}
	return false;
};

cutil.checkIsJokerSerialPair = function(cardsButJoker, jokers){ //连对
	cc.log("checkIsJokerSerialPair")
	if (cardsButJoker.length + jokers.length < 6  || (cardsButJoker.length + jokers.length)%2 != 0) {
		return false;
	}
	if (cardsButJoker.length + jokers.length > 24) { //最大不能超过 3-A
		return false;
	}
	var jokerNum = jokers.length;
	var card2NumDict = cutil.getCard2NumDict(cardsButJoker)
	//数量是否满足
	for (var card in card2NumDict) {
		if (card2NumDict[card] > 2) {
			return false
		}else if (card2NumDict[card] < 2) {
			var needNum = 2 - card2NumDict[card]
			if (jokerNum < needNum) {
				return false
			}
			jokerNum -= needNum
		}
	}
	//是否连续
	var isSerial = true
	var restJokerPairNum = jokerNum/2
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length - 1; i++) {
		var j = 1
		while(keyList[i] + j != keyList[i+1]){
			if (restJokerPairNum <= 0) {
				isSerial = false
				break;
			}
			j += 1;
			restJokerPairNum -= 1;
		}
	}
	return isSerial
};

cutil.checkIsJokerTriple = function(cardsButJoker, jokers){ //三张 三张王 也是三张一样的
	cc.log("checkIsJokerTriple")
	if (cardsButJoker.length + jokers.length != 3) {
		return false;
	}
	if (cardsButJoker.length == 2) {
		if (cardsButJoker[0] == cardsButJoker[1]) {
			return true
		}
		return false
	}
	return true
};

cutil.checkIsJokerSerialTriple = function(cardsButJoker, jokers){ //连三张
	cc.log('checkIsJokerSerialTriple')
	if (cardsButJoker.length + jokers.length < 9 && (cardsButJoker.length + jokers.length)%3 != 0) {
		return false
	}
	if (cardsButJoker.length + jokers.length > 36) { //最大不能超过 3-A
		return false;
	}
	var jokerNum = jokers.length;
	var card2NumDict = cutil.getCard2NumDict(cardsButJoker);
	//数量
	for (var card in card2NumDict) {
		if (card2NumDict[card] > 3) {
			return false
		} else if (card2NumDict[card] < 3) {
			var needNum = 3 - card2NumDict[card]
			if (jokerNum < needNum) {
				return false
			}
			jokerNum -= needNum
		}
	}
	//连续
	var isSerial = true
	var restJokerTripleNum = jokerNum/3
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length - 1; i++) {
		var j = 1
		while(keyList[i] + j != keyList[i+1]){
			if (restJokerTripleNum <= 0) {
				isSerial = false;
				break;
			}
			j += 1;
			restJokerTripleNum  -= 1;
		}
	}
	return isSerial
};

cutil.checkIsJokerSerialSingle = function(cardsButJoker, jokers){ //顺子
	cc.log('checkIsJokerSerialSingle')
	cc.log(cardsButJoker, jokers)
	cc.log("======================")
	if (cardsButJoker.length + jokers.length < 5) {
		return false
	}
	if (cardsButJoker.length + jokers.length > 12) { //最大不能超过 3-A
		return false;
	}
	var card2NumDict = cutil.getCard2NumDict(cardsButJoker)
	//数量
	for (var card in card2NumDict) {
		if (card2NumDict[card] != 1) {
			return false
		}
	}

	//连续
	var isSerial = true
	var jokerNum = jokers.length
	var keyList = cutil.getKeyList(card2NumDict)
	for (var i = 0; i < keyList.length - 1; i++) {
		var j = 1;
		while(keyList[i] + j != keyList[i+1]){
			if (jokerNum <= 0) {
				isSerial = false
				break;
			}
			j += 1;
			jokerNum -= 1
		}
	}
	return isSerial
};

cutil.checkIsJokerNormalBomb = function(cardsButJoker, jokers){ //普通炸 四王炸不算普通炸
	cc.log('checkIsJokerNormalBomb')
	if (cardsButJoker.length + jokers.length < 4) {
		return false
	}
	if (cardsButJoker.length <= 0) {
		return false
	}
	var card2NumDict = cutil.getCard2NumDict(cardsButJoker)
	if (Object.keys(card2NumDict).length != 1) {
		return false
	}
	return true
};

cutil.checkIsJokerSerialBomb = function(cardsButJoker, jokers){
	cc.log("checkIsJokerSerialBomb")
	if (cardsButJoker.length + jokers.length < 12) {return false;}
	var jokerNum = jokers.length;
	var card2NumDict = cutil.getCard2NumDict(cardsButJoker);
	// 数量
	var maxBombNum = 0;
	for (var card in card2NumDict) {
		if (card2NumDict[card] && card2NumDict[card] > maxBombNum) {
			maxBombNum = card2NumDict[card];
		}
	}
	// 先填成一样的
	for (var card in card2NumDict) {
		if (card2NumDict[card] < maxBombNum) {
			var needNum = maxBombNum - card2NumDict[card];
			if (jokerNum < needNum) {
				return false;
			}
			jokerNum -= needNum;
		}
	}
	// 如果不是炸弹 先填成炸弹
	if (maxBombNum < 4) {
		if (jokerNum < Object.keys(card2NumDict).length * (4 - maxBombNum)) {
			return false
		}
		jokerNum -= Object.keys(card2NumDict).length * (4 - maxBombNum);
		maxBombNum = 4
	}
	//判断是否满足3连炸以上
	if (Object.keys(card2NumDict).length + Math.floor(jokerNum/maxBombNum)< 3) {
		return false
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict);
	keyList.sort(function(a,b){return a-b;});
	// 2 特殊判断(仅限两王)
	if (keyList.indexOf(const_val.CARD2) >= 0) {
		var copySerial = cutil.deepCopy(keyList)
		for (var i = 0; i < const_val.CIRCLE.length; i++) {
			if (copySerial.indexOf(const_val.CIRCLE[i]) >= 0) {
				copySerial.splice(copySerial.indexOf(const_val.CIRCLE[i]), 1)
			}else{
				break
			}
		}

		for (var i = const_val.CIRCLE.length - 1; i >= 0; i--) {
			if (copySerial.indexOf(const_val.CIRCLE[i]) >= 0) {
				copySerial.splice(copySerial.indexOf(const_val.CIRCLE[i]), 1)
			}else{
				break
			}
		}
		if (copySerial.length <= 0 && jokerNum%maxBombNum == 0) {
			return true
		}
	}
	var isSerial = true;
	var needSerialNum = keyList.length;
	for (var i = 0; i < keyList.length - 1; i++) {
		var j = 1;
		while(keyList[i] + j != keyList[i+1]){
			if (jokerNum <= 0) {
				isSerial = false
				break;
			}
			j += 1;
			jokerNum -= maxBombNum;
			needSerialNum += 1;
		}
	}
	//判断是否刚好可以拼成炸弹
	if (jokerNum != 0 && jokerNum != maxBombNum) {
		return false
	}
	if (isSerial && (jokerNum%needSerialNum == 0 || jokerNum%maxBombNum == 0)) {
		return true
	}
	return false
};

cutil.getOriginCardInsteadNum = function(originCard){
	var notJokerList = [const_val.HEI, const_val.HONG, const_val.MEI, const_val.FANG]
	if (const_val.JOKER.indexOf(originCard) >= 0) {
		return const_val.SHADOW_JOKER[const_val.JOKER.indexOf(originCard)]
	}
	for (var i = 0; i < notJokerList.length; i++) {
		if (notJokerList[i].indexOf(originCard) >= 0) {
			return const_val.INSTEAD[notJokerList[i].indexOf(originCard)];
		}
	}
	return originCard;
};

cutil.getRightShiftCardInsteadNum = function(shiftCard){
	var originCard = shiftCard << 3;
	return cutil.getOriginCardInsteadNum(originCard);
};

//按最大牌型生成新牌（必须满足可以生成）
cutil.makeJokerPair = function(originCardsButJoker, originJokers){
	// 王不能替王 两个王的情况（一大一小）
	var newOriginPair = [];
	newOriginPair.push(originCardsButJoker[0]);
	newOriginPair.push(cutil.getOriginCardInsteadNum(originCardsButJoker[0]));
	newOriginPair.sort(function(a,b){return a-b;});
	return newOriginPair;
};

cutil.getInsteadMidSerialCard = function(shiftSerialCard, jokerNum){ //往中间填
 	var insteadCards = []
 	shiftSerialCard.sort(function(a,b){return a-b;})
 	for (var i = 0; i < shiftSerialCard.length - 1; i++) {
 		var j = 1;
 		while(shiftSerialCard[i] + j != shiftSerialCard[i+1]){
 			insteadCards.push(cutil.getRightShiftCardInsteadNum(shiftSerialCard[i] + j));
 			jokerNum -= 1;
 			j += 1;
 		}
 	}
 	return [insteadCards, jokerNum];
};

cutil.getInsteadEndSerialCard = function(shiftSerialCard, jokerNum){ // 往后填
	var insteadCards = [];
	shiftSerialCard.sort(function(a, b){return a-b;});
	var maxCard = shiftSerialCard[shiftSerialCard.length - 1];
	while(maxCard && maxCard < (cutil.getMaxSerialCard() >> 3) && jokerNum > 0){
		maxCard += 1;
		jokerNum -= 1;
		insteadCards.push(cutil.getRightShiftCardInsteadNum(maxCard));
	}
	return [insteadCards, jokerNum];
};

cutil.getInsteadBeforeSerialCard = function(shiftSerialCard, jokerNum){ //往前填
	var insteadCards = [];
	shiftSerialCard.sort(function(a,b){return a-b;});
	var minCard = shiftSerialCard[0];
	while(minCard && minCard > (cutil.getMinSerialCard() >> 3) && jokerNum > 0){
		minCard -= 1;
		jokerNum -= 1;
		insteadCards.push(cutil.getRightShiftCardInsteadNum(minCard));
	}
	return [insteadCards, jokerNum];
};

cutil.makeJokerSerialPair = function(originCardsButJoker, originJokers){
	var makeCards = cutil.deepCopy(originCardsButJoker);
	var shiftCards = cutil.rightShiftCards(originCardsButJoker);
	shiftCards.sort(function(a,b){return a-b;});
	var jokerNum = originJokers.length;

	var card2NumDict = cutil.getCard2NumDict(shiftCards);
	//成对
	for (var card in card2NumDict) {
		if (card2NumDict[card] == 1) {
			makeCards.push(cutil.getRightShiftCardInsteadNum(card));
			jokerNum -= 1;
		}
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict);
	keyList.sort(function(a,b){return a-b;});
	//中间连续
	var midResult = cutil.getInsteadMidSerialCard(keyList, jokerNum);
	var midRestJokerNum = midResult[1] - (jokerNum - midResult[1]);
	makeCards = makeCards.concat(midResult[0]);
	makeCards = makeCards.concat(midResult[0]);

	//往后连续
	var endResult = cutil.getInsteadEndSerialCard(keyList, midRestJokerNum);
	var endRestJokerNum = endResult[1] - (midRestJokerNum - endResult[1]);
	makeCards = makeCards.concat(endResult[0]);
	makeCards = makeCards.concat(endResult[0]);

	//往前连续
	var beforeResult = cutil.getInsteadBeforeSerialCard(keyList, endRestJokerNum);
	var beforeRestJokerNum = beforeResult[1] - (endRestJokerNum - beforeResult[1]);
	makeCards = makeCards.concat(beforeResult[0]);
	makeCards = makeCards.concat(beforeResult[0]);

	makeCards.sort(function(a,b){return a-b;});
	return makeCards;
};

cutil.makeJokerTriple = function(originCardsButJoker, originJokers){
	var jokerNum = originJokers.length;
	var makeCards = cutil.deepCopy(originCardsButJoker);
	for (var i = 0; i < originJokers.length; i++) {
		makeCards.push(cutil.getOriginCardInsteadNum(originCardsButJoker[0]))
	}
	return makeCards
};

cutil.makeJokerSerialTriple = function(originCardsButJoker, originJokers){
	var makeCards = cutil.deepCopy(originCardsButJoker);
	var shiftCards = cutil.rightShiftCards(originCardsButJoker);
	shiftCards.sort(function(a,b){return a-b;});
	var jokerNum = originJokers.length;

	var card2NumDict = cutil.getCard2NumDict(shiftCards);
	//成 *3
	for (var card in card2NumDict) {
		if (card2NumDict[card] == 1) {
			makeCards.push(cutil.getRightShiftCardInsteadNum(card));
			makeCards.push(cutil.getRightShiftCardInsteadNum(card));
			jokerNum -= 1;
			jokerNum -= 1;
		}else if (card2NumDict[card] == 2) {
			makeCards.push(cutil.getRightShiftCardInsteadNum(card));
			jokerNum -= 1;
		}
	}
	//连续
	var keyList = cutil.getKeyList(card2NumDict);
	keyList.sort(function(a,b){return a-b;});

	//中间连续
	var midResult = cutil.getInsteadMidSerialCard(keyList, jokerNum);
	var midRestJokerNum = midResult[1] - 2*(jokerNum - midResult[1]);
	makeCards = makeCards.concat(midResult[0]);
	makeCards = makeCards.concat(midResult[0]);
	makeCards = makeCards.concat(midResult[0]);

	//往后连续
	var endResult = cutil.getInsteadEndSerialCard(keyList, midRestJokerNum);
	var endRestJokerNum = endResult[1] - 2*(midRestJokerNum - endResult[1]);
	makeCards = makeCards.concat(endResult[0]);
	makeCards = makeCards.concat(endResult[0]);
	makeCards = makeCards.concat(endResult[0]);

	//往前连续
	var beforeResult = cutil.getInsteadBeforeSerialCard(keyList, endRestJokerNum);
	var beforeRestJokerNum = beforeResult[1] - 2*(endRestJokerNum - beforeResult[1]);
	makeCards = makeCards.concat(beforeResult[0]);
	makeCards = makeCards.concat(beforeResult[0]);
	makeCards = makeCards.concat(beforeResult[0]);

	makeCards.sort(function(a,b){return a-b;});
	return makeCards;
};

cutil.makeJokerSerialSingle = function(originCardsButJoker, originJokers){
	var makeCards = cutil.deepCopy(originCardsButJoker);
	var shiftCards = cutil.rightShiftCards(originCardsButJoker);
	shiftCards.sort(function(a,b){return a-b;});
	var jokerNum = originJokers.length;

	var card2NumDict = cutil.getCard2NumDict(shiftCards);
	//连续
	var keyList = cutil.getKeyList(card2NumDict);
	keyList.sort(function(a,b){return a-b;});
	//中间连续
	var midResult = cutil.getInsteadMidSerialCard(keyList, jokerNum);
	makeCards = makeCards.concat(midResult[0]);
	//往后连续
	var endResult = cutil.getInsteadEndSerialCard(keyList, midResult[1]);
	makeCards = makeCards.concat(endResult[0]);
	//往前连续
	var beforeResult = cutil.getInsteadBeforeSerialCard(keyList, endResult[1]);
	makeCards = makeCards.concat(beforeResult[0]);

	makeCards.sort(function(a,b){return a-b;});
	return makeCards;
};

cutil.makeJokerNormalBomb = function(originCardsButJoker, originJokers){
	var makeCards = cutil.deepCopy(originCardsButJoker);
	for (var i = 0; i < originJokers.length; i++) {
		makeCards.push(cutil.getOriginCardInsteadNum(originCardsButJoker[0]))
	}
	return makeCards
};

//返回需要的 list
function getLeftOffset(i, seq){
	var sequence = cutil.deepCopy(seq);
	if (const_val.CARD2 in sequence) {
		sequence.splice(sequence.indexOf(const_val.CARD2), 1)
	}
	sequence.sort(function(a,b){return b-a})
	if (i < 0) {
		var lis = []
		for (var j = 14; j >= 3; j--) {
			if (j > sequence[0]) {
				lis.push(j)
			}
			return lis
		}
	}
	var lis = []
	for (var j = 14; j >= 3; j--) {
		if (sequence[i+1] < j && j < sequence[i+1]) {
			lis.push(j)
		}
	}
	return lis
}

function getRightOffset(i, seq){
	var sequence = cutil.deepCopy(seq);
	if (const_val.CARD2 in sequence) {
		sequence.splice(sequence.indexOf(const_val.CARD2), 1)
	}
	sequence.sort(function(a,b){return a-b})
	if (i < 0) {
		var lis = []
		for (var j = 3; j <= 14; j++) {
			if (j < sequence[0]) {
				lis.push(j)
			}
		}
		return lis
	}
	var lis = []
	for (var j = 3; j <= 14; j++) {
		if (sequence[i] < j && j < sequence[i+1]) {
			lis.push(j)
		}
	}
	return lis
}

cutil.makeJokerSerialBomb = function(originCardsButJoker, originJokers){
	cc.log("makeJokerSerialBomb")
	var makeCards = cutil.deepCopy(originCardsButJoker);
	var shiftCards = cutil.rightShiftCards(originCardsButJoker);
	shiftCards.sort(function(a,b){return a-b;});
	var jokerNum = originJokers.length;

	var card2NumDict = cutil.getCard2NumDict(shiftCards);
	//连续
	var keyList = cutil.getKeyList(card2NumDict);
	keyList.sort(function(a,b){return a-b;});

	var maxBombNum = 0;
	for(var card in card2NumDict){
		if (card2NumDict[card] && card2NumDict[card] > maxBombNum) {
			maxBombNum = card2NumDict[card]
		}
	}

	//填成一致
	for(var card in card2NumDict){
		if (card2NumDict[card] < maxBombNum) {
			var needNum = maxBombNum - card2NumDict[card]
			for (var i = 0; i < needNum; i++) {
				jokerNum -= 1;
				makeCards.push(cutil.getRightShiftCardInsteadNum(card));
			}
		}
	}

	//填成炸弹
	if (maxBombNum < 4) {
		var needNum = 4 - maxBombNum;
		for (var i = 0; i < keyList.length; i++) {
			for (var j = 0; j < needNum; j++) {
				jokerNum -= 1;
				makeCards.push(cutil.getRightShiftCardInsteadNum(keyList[i]));
			}
		}
	}
	var temp = cutil.deepCopy(makeCards);
	var tempJokerNum = jokerNum;
	//有多余王 先往中间填 然后往A填(后) 最后往前填
	if (jokerNum > 0 && keyList.indexOf(const_val.CARD2) < 0) {
		var midResult = cutil.getInsteadMidSerialCard(keyList, jokerNum);
		var midRestJokerNum = midResult[1] - (maxBombNum - 1)*(jokerNum - midResult[1]);
		for (var i = 0; i < maxBombNum; i++) {
			makeCards = makeCards.concat(midResult[0]);
		}
		
		var endResult = cutil.getInsteadEndSerialCard(keyList, midRestJokerNum);
		var endRestJokerNum = endResult[1] - (maxBombNum - 1)*(midRestJokerNum - endResult[1]);
		for (var i = 0; i < maxBombNum; i++) {
			makeCards = makeCards.concat(endResult[0]);
		}

		//往前连续
		var beforeResult = cutil.getInsteadBeforeSerialCard(keyList, endRestJokerNum);
		var beforeRestJokerNum = beforeResult[1] - (maxBombNum - 1)*(endRestJokerNum - beforeResult[1]);
		for (var i = 0; i < maxBombNum; i++) {
			makeCards = makeCards.concat(beforeResult[0]);
		}	
	}
	//特殊类型
	var tryRightShift = cutil.rightShiftCards(makeCards);
	var tryCard2NumDict = cutil.getCard2NumDict(tryRightShift);
	var trySerial = cutil.getKeyList(tryCard2NumDict);
	var isTrySerial = true;
	for (var i = 0; i < trySerial.length - 1; i++) {
		if (trySerial[i] + 1 != trySerial[i+1]) {
			isTrySerial = false;
		}
	}
	if (!isTrySerial) {
		makeCards = temp;
		jokerNum = tempJokerNum;
	}
	cc.log("===================================================")
	cc.log(isTrySerial)
	cc.log(makeCards)
	cc.log(jokerNum)

	if (jokerNum > 0 && !isTrySerial) {
		// 若没有2
		if (keyList.indexOf(const_val.CARD2) < 0) {
			for (var i = 0; i < maxBombNum; i++) {
				jokerNum -= 1
				makeCards.push(const_val.CARD2 << 3)
			}
		}
		cc.log("xxxx")
		cc.log(makeCards)

		var leftOffset = -1;
		var rightOffset = -1;
		while(jokerNum > 0){
			if (leftOffset >= keyList.length && rightOffset >= keyList.length) {
				break
			}
			if (leftOffset >= keyList.length) {
				var rightNeedList = cutil.getRightOffset(rightOffset, keyList)
				cc.log("rightNeedList==1>:",rightNeedList)
				rightOffset += 1;
				for (var i = 0; i < rightNeedList.length; i++) {
					for (var j = 0; j < maxBombNum; j++) {
						if (jokerNum <= 0) {break;}
						jokerNum -= 1;
						makeCards.push(rightNeedList[i] << 3)
						cc.log("push==>:",rightNeedList[i])
					}
				}
				continue
			}

			if (rightOffset >= keyList.length) {
				var leftNeedList = cutil.getLeftOffset(leftOffset, keyList)
				cc.log("leftNeedList==1>:",leftNeedList)
				leftOffset += 1;
				for (var i = 0; i < leftNeedList.length; i++) {
					for (var j = 0; j < maxBombNum; j++) {
						if (jokerNum <= 0) {break;}
						jokerNum -= 1;
						makeCards.push(leftNeedList[i] << 3)
						cc.log("push==>:",leftNeedList[i])
					}
				}
			}

			var leftNeedList = cutil.getLeftOffset(leftOffset, keyList)
			var rightNeedList = cutil.getRightOffset(rightOffset, keyList)
			cc.log("leftNeedList==2>:",leftNeedList)
			cc.log("rightNeedList==2>:",rightNeedList)
			if (rightNeedList.length <= leftNeedList.length) { //往右填
				leftOffset += 1
				for (var i = 0; i < rightNeedList.length; i++) {
					for (var j = 0; j < maxBombNum; j++) {
						if (jokerNum <= 0) {break;}
						jokerNum -= 1;
						makeCards.push(rightNeedList[i] << 3)
						cc.log("push==>:",rightNeedList[i])
					}
				}
			}else{
				leftOffset += 1;
				for (var i = 0; i < leftNeedList.length; i++) {
					for (var j = 0; j < maxBombNum; j++) {
						if (jokerNum <= 0) {break;}
						jokerNum -= 1;
						makeCards.push(leftNeedList[i] << 3)
						cc.log("push==>:",leftNeedList[i])
					}
				}
			}
		}
	}
	makeCards.sort(function(a,b){return a-b;});
	return makeCards;
};

cutil.rightShiftCards = function(cards){
	var result = []
	for (var i = 0; i < cards.length; i++) {
		result[i] = cards[i] >> 3
	}
	return result
};

//判断玩家出牌的线数
cutil.judgeCardsLine = function(cards, cardsType){	
	var shiftCards = cutil.rightShiftCards(cards);
	if(cardsType == 8){
		return shiftCards.length
	}else if (cardsType == 9) {
		return 6
	} else if (cardsType == 10) {
		return 7
	} else if (cardsType == 11) {
		var card2NumDict = cutil.getCard2NumDict(shiftCards)
		return Object.keys(card2NumDict).length + shiftCards.length/Object.keys(card2NumDict).length
	}
	return -1
};

// 0无牌 1非可出牌型 2单张 3对子 4连对 5三张 6连三张
// 7顺子 8炸弹 9四王炸
cutil.getNormalCardsType = function(cards){
	cc.log("getNormalCardsType")
	if (cards.length <= 0) {
		return const_val.TYPE_NO_CARD
	} else if (cutil.checkIsSingle(cards)) {
		return const_val.TYPE_SINGLE
	} else if (cutil.checkIsPair(cards)) {
		return const_val.TYPE_PAIR
	} else if (cutil.checkIsSerialPair(cards)) {
		return const_val.TYPE_SERIAL_PAIR
	} else if (cutil.checkIsTriple(cards)) {
		return const_val.TYPE_TRIPLE
	} else if (cutil.checkIsSerialTriple(cards)) {
		return const_val.TYPE_SERIAL_TRIPLE
	} else if (cutil.checkIsSerialSingle(cards)) {
		return const_val.TYPE_SERIAL_SINGLE
	} else if (cutil.checkIsNormalBomb(cards)) {
		return const_val.TYPE_BOMB
	} else if (cutil.checkIs3Joker(cards)) {
		return const_val.TYPE_3JOKER
	} else if (cutil.checkIs4Joker(cards)) {
		return const_val.TYPE_4JOKER
	} else if (cutil.checkIsSerialBomb(cards)) {
		return const_val.TYPE_SERIAL_BOMB
	}
	return const_val.TYPE_INVALID
};

// 0无牌 1非可出牌型 22对子 23连对 24三张 25连三张
// 26顺子 27炸弹
cutil.getInsteadCardsType = function(cardsButJoker, jokers){
	if (cardsButJoker.length + jokers.length <= 0) {
		return 0
	} else if (cutil.checkIsJokerPair(cardsButJoker, jokers)) {
		return 103
	} else if (cutil.checkIsJokerSerialPair(cardsButJoker, jokers)) {
		return 104
	} else if (cutil.checkIsJokerTriple(cardsButJoker, jokers)) {
		return 105
	} else if (cutil.checkIsJokerSerialTriple(cardsButJoker, jokers)) {
		return 106
	} else if (cutil.checkIsJokerSerialSingle(cardsButJoker, jokers)) {
		return 107
	} else if (cutil.checkIsJokerNormalBomb(cardsButJoker, jokers)) {
		return 108
	} else if (cutil.checkIsJokerSerialBomb(cardsButJoker, jokers)) {
		return 111
	}
	return 1
	
}

cutil.cmpSameLineSerialBomb = function(baseCards, selCards){
	cc.log("cmpSameLineSerialBomb")
	var baseLine = cutil.getSerialBombLine(baseCards);
	var selLine = cutil.getSerialBombLine(selCards);
	cc.log(baseCards, selCards)
	cc.log(baseLine, selLine)
	if (selLine > baseLine) {
		cc.log("11111111111111")
		return true
	}else if (selLine < baseLine) {
		cc.log("22222222222222222")
		return false
	} else if (baseCards.indexOf(const_val.CARD2) >= 0 && selCards.indexOf(const_val.CARD2) < 0) {
		cc.log("3333333333333333")
		return true
	} else if (baseCards.indexOf(const_val.CARD2) < 0 && selCards.indexOf(const_val.CARD2) >= 0) {
		cc.log("44444444444444444444")
		return false
	} else if (baseCards.indexOf(const_val.CARD2) >= 0 && selCards.indexOf(const_val.CARD2) >= 0) {
		cc.log("555555555555555555")
		var baseMin = cutil.getMinCard2SerialBombCard(baseCards);
		var selMin = cutil.getMinCard2SerialBombCard(selCards);
		cc.log(baseMin, selMin)
		if (selMin > baseMin) {
			return true
		}
		return false
	} else {
		cc.log("666666666666666666")
		var baseMin = cutil.getMinSerialBombCard(baseCards);
		var selMin = cutil.getMinSerialBombCard(selCards);
		cc.log(baseMin, selMin)
		if (selMin > baseMin) {
			return true;
		}
		return false
	}
};



cutil.getMinCard2SerialBombCard = function(cards){
	var minCard = const_val.CARD2;
	for (var i = const_val.CIRCLE.length - 1; i >= 0; i--) {
		if (cards.indexOf(const_val.CIRCLE[i]) >= 0) {
			minCard = const_val.CIRCLE[i];
		} else {
			break;
		}
	}
	return minCard;
};

cutil.getMinSerialBombCard = function(cards){
	var copyList = cutil.deepCopy(cards);
	copyList.sort(function(a,b){return a-b;})
	return copyList[0]
};

cutil.getSerialBombLine = function(cards){
	return cutil.getSerialBombNum(cards) + cutil.getSerialBombSerialNum(cards)
};

cutil.cmpSameTypeCards = function(baseCards, selCards, cardsType){
	cc.log("cmpSameTypeCards",baseCards, selCards, cardsType)
	if (cardsType == 0 || cardsType == 1) {
		return false
	} else if (cardsType == 2 || cardsType == 3 || cardsType == 4 || cardsType == 5 || cardsType == 6 || cardsType == 7) {
		if (baseCards.length == selCards.length && selCards[0] > baseCards[0]) {
			return true
		}
	} else if (cardsType == 8) {
		if (selCards.length == baseCards.length) {
			if (selCards[0] > baseCards[0]) {
				return true
			}
		} else if (selCards.length > baseCards.length) {
			return true
		}
	} else if (cardsType == 9 || cardsType == 10) {
		return false
	} else if (cardsType == 11) {
		return cutil.cmpSameLineSerialBomb(baseCards, selCards)
	}
	return false
};

cutil.makeCard = function(originCards, cardsType){
	var classifyList = cutil.classifyCards(originCards)
	cc.log("makeCard")
	cc.log(classifyList, cardsType)
	if (cardsType == 103) {
		return cutil.makeJokerPair(classifyList[0], classifyList[1]);
	} else if (cardsType == 104) {
		return cutil.makeJokerSerialPair(classifyList[0], classifyList[1]);
	} else if (cardsType == 105) {
		return cutil.makeJokerTriple(classifyList[0], classifyList[1]);
	} else if (cardsType == 106) {
		return cutil.makeJokerSerialTriple(classifyList[0], classifyList[1]);
	} else if (cardsType == 107) {
		return cutil.makeJokerSerialSingle(classifyList[0], classifyList[1]);
	} else if (cardsType == 108) {
		return cutil.makeJokerNormalBomb(classifyList[0], classifyList[1]);
	} else if (cardsType == 111) {
		return cutil.makeJokerSerialBomb(classifyList[0], classifyList[1]);
	}
	return originCards;
};

cutil.get_user_info = function(accountName, callback){
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	var user_info_xhr = cc.loader.getXMLHttpRequest();
    user_info_xhr.open("GET", switches.PHP_SERVER_URL + "/api/user_info", true);
    user_info_xhr.onreadystatechange = function(){
         if(user_info_xhr.readyState === 4 && user_info_xhr.status === 200){
            // cc.log(user_info_xhr.responseText);
            if(callback){
            	callback(user_info_xhr.responseText);
            }
        }
    };
    user_info_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    user_info_xhr.send();
};

cutil.test_funct = function*(n){
	for(var i = 0; i < n; i++){
		yield i;
	}
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 以下各方法用户计算牌型线数

cutil.cards2cardNums = function(cards){
	// 统计各张手牌的数目
	var cardNumDict = {};
	for(var card of cards){
		cardNumDict[card] = cardNumDict[card] || 0;
		cardNumDict[card] += 1;
	}
	return cardNumDict;
};

cutil.cardNums2baseLines = function(cardNumDict){
	// 不考虑王和连炸的情况下，牌型的基本线数信息
	var baseLineDict = {};
	for(var card of Object.keys(cardNumDict)){
		if(cardNumDict[card] < 4){
			continue;
		}
		baseLineDict[cardNumDict[card]] = baseLineDict[cardNumDict[card]] || 0;
		baseLineDict[cardNumDict[card]] += 1;
	}
	return baseLineDict;
};

cutil.cards2baseLines = function(cards){
	// 连炸和王已经处理的情况下，统计手牌初始情况下的线数
	return cutil.cardNums2baseLines(cards2cardNums(cards));
};

cutil.calcMaxLine = function(baseLineDict){
	// 用已有的手牌基本线数信息计算出的合并后的最大线数信息
	var lastBaseLine = 0;
	var curMaxLine = 0;
	var maxLineList = [];
	for(var line of ((Object.keys(baseLineDict)).concat([])).sort(function(a, b){return a-b;})){
		if(line > curMaxLine){
			if(curMaxLine > 5){
				maxLineList.push(curMaxLine);
			}
			lastBaseLine = curMaxLine = line + Math.max(baseLineDict[line] - (line==4?2:1), 0);
		} else {
			curMaxLine += baseLineDict[line];
		}
	}
	if (curMaxLine > 5){
		maxLineList.push(curMaxLine);
	}
	return maxLineList;
};

cutil.calcJokerBombInfoBranches = function(jokerCardList){
	// 返回一个可能的list，内容为兑换成的王炸数目和剩余可用王数
	if(jokerCardList.length == 3){
		var sumJoker = 0;
		for(var i = 0; i < jokerCardList.length; i++){
			if(jokerCardList[i] == const_val.JOKER[1]){
				sumJoker += 1;
			}
		}
		return [[6, 0], [0, sumJoker]];
	} else if (jokerCardList.length == 4){
		return [[7, 0], [6, 1], [0, 2]];
	} else {
		var sumJoker = 0;
		for(var i = 0; i < jokerCardList.length; i++){
			if(jokerCardList[i] == const_val.JOKER[1]){
				sumJoker += 1;
			}
		}
		return [[0, sumJoker]];
	}
};

cutil.cardsWithJokerBranches = function*(cardNumDict, jokerNum){
	// 生成拼王后的分支情况
	if(jokerNum == 1){
		for(var card of Object.keys(cardNumDict)){
			if (cardNumDict[card] >= 3){
				var newCardNumDict = {};
				for(var i of Object.keys(cardNumDict)){
					newCardNumDict[i] = cardNumDict[i];
				}
				newCardNumDict[card] += 1;
				cc.log(newCardNumDict)
				yield newCardNumDict;
			}
		}
	} else if(jokerNum == 2){
		for(var card of Object.keys(cardNumDict)){
			if(cardNumDict[card] >= 2){
				var tmpCardNumDict = {};
				for(var i of Object.keys(cardNumDict)){
					tmpCardNumDict[i] = cardNumDict[i];
				}
				tmpCardNumDict[card] += 1;
				for (var tmpCard of Object.keys(tmpCardNumDict)){
					if(tmpCardNumDict[tmpCard] >= 3){
						var newCardNumDict = {};
						for(var i of Object.keys(tmpCardNumDict)){
							newCardNumDict[i] = tmpCardNumDict[i];
						}
						newCardNumDict[tmpCard] += 1;
						yield newCardNumDict;
					}
				}
			}
		}
	} else {
		var newCardNumDict = {};
		for(var card of Object.keys(cardNumDict)){
			newCardNumDict[card] = cardNumDict[card];
		}
		yield newCardNumDict;
	}
};

cutil.divide2serialSections = function(cardNumDict){
	// 计算炸牌可以得到的连炸区间
	var bombCardList = [];
	for(var card of Object.keys(cardNumDict)){
		if(cardNumDict[card] >= 4){
			bombCardList.push(card);
		}
	}
	bombCardList.sort(function(a, b){return a-b;});
	var divideList = [];
	for(var card of bombCardList){
		if(divideList.length == 0){
			divideList.push([card]);
			continue;
		}
		if(card - divideList[divideList.length-1][divideList[divideList.length-1].length-1] <= 1){
			divideList[divideList.length-1].push(card)
		} else {
			divideList.push([card]);
		}
	}
	if(divideList.length > 1 && divideList[divideList.length-1][divideList[divideList.length-1].length-1] == 13 && divideList[0][0] == 1){
		// 首尾相接
		divideList[divideList.length-1].push.apply(divideList[divideList.length-1], divideList[0]);
		divideList.splice(0, 1);
	}
	var serialSections = [];
	for(var divide of divideList){
		if(divide.length >= 3){
			serialSections.push(divide);
		}
	}
	return serialSections;
};

cutil.cardNumDictDiscardSerialBomb = function(cardNumDict, cardList){
	// 丢掉手牌中的连炸，返回牌型的基本线数，并将兑换成的连炸线数加入
	var newCardNumDict = {};
	for(var card of Object.keys(cardNumDict)){
		newCardNumDict[card] = cardNumDict[card];
	}
	var minLine = 12;
	for(var card of cardList){
		if(newCardNumDict[card] < minLine){
			minLine = cardNumDict[card];
		}
	}
	for(var card of cardList){
		newCardNumDict[card] -= minLine;
		if(newCardNumDict[card] <= 0){
			delete newCardNumDict[card];
		}
	}
	var baseLineDict = cutil.cardNums2baseLines(newCardNumDict);
	var serialLine = (minLine - 4) + (cardList.length - 3) + 7;
	baseLineDict[serialLine] = baseLineDict[serialLine] || 0;
	baseLineDict[serialLine] += 1;
	return baseLineDict;
};

cutil.linesWithSerialBombBranches = function*(cardNumDict){
	// 生成排除连炸后的分支情况
	var serialSections = cutil.divide2serialSections(cardNumDict);
	if(serialSections.length == 0){
		// 没有炸弹
		yield cutil.cardNums2baseLines(cardNumDict);
	} else if(serialSections.length == 1){
		var serialSection = serialSections[0];
		for(var startIdx = 0; startIdx < serialSection.length-2; startIdx++){
			for(var endIdx = startIdx + 3; endIdx < serialSection.length + 1; endIdx++){
				yield cutil.cardNumDictDiscardSerialBomb(cardNumDict, serialSection.slice(startIdx, endIdx));
			}
		}
		// 不选择任何连炸
		yield cutil.cardNums2baseLines(cardNumDict);
	} else if(serialSections.length == 2){
		// 只有全4炸可能出现两组连炸，两组均为3连炸，不用讨论长度只选择要与不要
		// 两个连炸和不要连炸都构成8线，而不要连炸还有可能构成9炸，显然是不要连炸划算，不用计算选择两个连炸的情况
		yield cutil.cardNums2baseLines(cardNumDict);
		// 选择其中一个连炸
		yield cutil.cardNumDictDiscardSerialBomb(cardNumDict, serialSections[0]);
		// 选择另一个连炸
		yield cutil.cardNumDictDiscardSerialBomb(cardNumDict, serialSections[1]);
	}
};

cutil.calcContribute = function(maxLineList, topLine){
	topLine = topLine || 11;
	var contribute = 0;
	for(var line of maxLineList){
		if(line > 5){
			contribute += Math.pow(2, Math.min(line, topLine) - 5);
		}
	}
	return contribute;
};

cutil.calcMaxContribute = function(cards, single, pokerReplace, topLine, extraLineDict){
	single = (single == undefined?true:single);
	pokerReplace = (pokerReplace == undefined?false:pokerReplace);
	topLine = topLine || 11;
	extraLineDict = (extraLineDict == undefined?{}:extraLineDict);
};

cutil.canCutPokers = function(cards, single, pokerReplace, topLine){
    if(cards.length != 27){
        return false;
    }
    single = (single==undefined?true:single);
    pokerReplace = (pokerReplace==undefined?false:pokerReplace);
    topLine = topLine || 11;
    // cc.log(single, pokerReplace, topLine)
    // 将原牌分为两组
    var noJokerCards = []
    var jokerCards = []
    for (var card of cards){
        if (const_val.JOKER.indexOf(card) >= 0){
            jokerCards.push(card);
        } else {
            noJokerCards.push(card>>3 == 16?(((card>>3)-2)%13+1):(((card>>3)-1)%13+1));
        }
    }
    // 得到无王的基本牌型信息
    var cardNumDict = cutil.cards2cardNums(noJokerCards);

    // 计算可能的线数分支
    // var jokerBombInfoBranches = cutil.calcJokerBombInfoBranches(jokerCards);
    // for(var jokerBombInfo of jokerBombInfoBranches){
    // 得到王炸的可能分支jokerBombInfo:[jokerBombLineDict, jokerNum]
        // var jokerBombLine = jokerBombInfo[0];
        // var jokerNum = jokerBombInfo[1];
    var sumJokerNum = 0;
    for(var card of jokerCards){
    	if(card == const_val.JOKER[1]){
    		sumJokerNum += 1;
    	}
    }
    for(var jokerNum = 0; jokerNum < sumJokerNum + 1; jokerNum ++){
    	// cc.log((pokerReplace?jokerNum:0))
        for(var jokerCardNumDict of cutil.cardsWithJokerBranches(cardNumDict, (pokerReplace?jokerNum:0))){
            // 王已经替换牌，继续处理连炸
            // cc.log(jokerCardNumDict)
            for(var lineDict of cutil.linesWithSerialBombBranches(jokerCardNumDict)){
            	// cc.log(lineDict)
            	if(Object.keys(lineDict).length > 1){
            		continue;
                } else if(Object.keys(lineDict).length == 1){
                	var key = Object.keys(lineDict)[0];
                	if (lineDict[key] > 1){
                		continue;
                	}
                    return true;
                } else if(Object.keys(lineDict).length == 0){
                    return true;
                }
            }
        }
    }
    return false;
};

cutil.postDataFormat = function(obj){
    if(typeof obj != "object" ) {
        alert("输入的参数必须是对象");
        return;
    }

    // 支持有FormData的浏览器（Firefox 4+ , Safari 5+, Chrome和Android 3+版的Webkit）
    if(typeof FormData == "function") {
        var data = new FormData();
        for(var attr in obj) {
            data.append(attr,obj[attr]);
        }
        return data;
    }else {
        // 不支持FormData的浏览器的处理 
        var arr = new Array();
        var i = 0;
        for(var attr in obj) {
            arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
            i++;
        }
        return arr.join("&");
    }
};

cutil.app_bind_agent = function(accountName, invite_code, callback){
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	var bind_xhr = cc.loader.getXMLHttpRequest();
    bind_xhr.open("POST", switches.PHP_SERVER_URL + "/api/app_bind_agent", true);
    bind_xhr.onreadystatechange = function(){
         if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
            // cc.log(bind_xhr.responseText);
            if(callback){
            	callback(bind_xhr.responseText);
            }
        }
    };
    bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    bind_xhr.send(cutil.postDataFormat({"invite_code" : invite_code}));
};