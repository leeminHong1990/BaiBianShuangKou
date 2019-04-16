"use strict";

var GameRoomEntity = KBEngine.Entity.extend({
	ctor : function()
	{
		this._super();
		
		this.roomID = undefined;
		this.curRound = 0;
		this.maxRound = 8;
		this.ownerId = undefined;
		this.isAgent = false;
		this.room_mode = 1;
		this.insert_card = 1;
		this.deal_mode = 0;
		this.scoreMode = 1;
		this.changeSeat = 1;
		this.best_phase = 8;
		this.agentInfo = {};
		this.playerInfoList = [null, null, null, null];

		this.controllerIdx = -1
		this.controller_discard_list = []
		this.waitIdx = -1;
		this.playerPokerList = [[],[],[],[]] 	//玩家手牌
		this.deskPokerList = [[],[],[],[]] 		//桌面牌
		this.player_advance_info_list = [{}, {}, {}, {}]
		this.keyCard = 0

		this.showHandFlag = 1

		this.playerStateList = [0, 0, 0, 0];

		this.applyCloseLeftTime = 0;
		this.applyCloseFrom = 0;
		this.applyCloseStateList = [0, 0, 0, 0];

		// 每局不清除的信息
		this.playerScoreList = [0, 0, 0, 0];
	    KBEngine.DEBUG_MSG("Create GameRoomEntity")
  	},

  	reconnectRoomData : function(recRoomInfo){
  		cc.log("断线重连:reconnectRoomData",recRoomInfo)

  		this.controllerIdx = recRoomInfo["controllerIdx"]
  		this.controller_discard_list = recRoomInfo["controller_discard_list"]
  		this.deskPokerList = recRoomInfo["deskPokerList"]
  		this.isPlayingGame = recRoomInfo["isPlayingGame"]
  		this.playerStateList = recRoomInfo["player_state_list"]
  		this.waitIdx = recRoomInfo["waitIdx"]
  		this.keyCard = recRoomInfo["keyCard"]
  		this.showHandFlag = recRoomInfo["showHandFlag"]

  		this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
  		this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
		this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
		
		this.player_advance_info_list = recRoomInfo["player_advance_info_list"]
		for (var i = 0; i < this.player_advance_info_list.length; i++) {
			this.playerPokerList[i] = this.player_advance_info_list[i]["cards"]
		}

		this.playerPokerList[recRoomInfo["cooperation_idx"]] = recRoomInfo["cooperation_cards"]

		if(this.applyCloseLeftTime > 0){
			onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
		}

		this.updateRoomData(recRoomInfo["init_info"]);
  	},

  	updateRoomData : function(roomInfo){
  		cc.log("updateRoomData:", roomInfo)
  		this.roomID = roomInfo["roomID"];
  		this.ownerId = roomInfo["ownerId"];
  		this.curRound = roomInfo["curRound"]
  		this.maxRound = roomInfo["maxRound"];
  		this.room_mode = roomInfo["room_mode"];
  		this.insert_card = roomInfo["insert_card"];
		this.deal_mode = roomInfo["deal_mode"];
		this.scoreMode = roomInfo["score_mode"];
		this.changeSeat = roomInfo["changeSeat"];
		this.best_phase = roomInfo["best_phase"];
  		this.isAgent = roomInfo["isAgent"];
		this.agentInfo = roomInfo["agentInfo"];


  		for(var i = 0; i < roomInfo["player_base_info_list"].length; i++){
  			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}

		var self = this;
		if(!((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || switches.TEST_OPTION)){
			wx.onMenuShareAppMessage({
                title: '房間号【' + self.roomID.toString() + '】', // 分享标题
                desc: '我在[棋凌阁]开了' + self.maxRound.toString() + '局的房间，快来一起玩吧。最高翻线' + String(self.best_phase) +',' + const_val.INSERT_CARD[self.insert_card] +'插牌,' + const_val.DEAL_MODE[self.deal_mode] +'发牌,' + const_val.SCORE_MODE[self.scoreMode] + ',还缺' + String(self.getNeedPlayerNum()) + '人', // 分享描述
                link: switches.h5entrylink, // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("ShareAppMessage Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("ShareAppMessage Cancel!");
			    },
			    fail: function() {
			    	cc.log("ShareAppMessage Fail")
			    },
			});
			wx.onMenuShareTimeline({
                title: '房間號【' + self.roomID.toString() + '】', // 分享标题
                desc: '我在[棋凌阁]开了' + self.maxRound.toString() + '局的房间，快来一起玩吧。最高翻线' + String(self.best_phase) +',' + const_val.INSERT_CARD[self.insert_card] +'插牌,' + const_val.DEAL_MODE[self.deal_mode] +'发牌,' + const_val.SCORE_MODE[self.scoreMode] + ',还缺' + String(self.getNeedPlayerNum()) + '人', // 分享描述
                link: switches.h5entrylink, // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("onMenuShareTimeline Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("onMenuShareTimeline Cancel!");
			    },
			    fail: function() {
			    	cc.log("onMenuShareTimeline Fail")
			    },
			});
		}
  	},

  	getNeedPlayerNum:function(){
  		var num = 0;
  		for (var i = 0; i < this.playerInfoList.length; i++) {
  			if (this.playerInfoList[i]) {
  				num += 1;
  			}
  		}
  		return 4-num;
  	},

  	swapPlayerBaseInfo:function(swap_list){
  		var playerTempInfoList = []
  		var playerAdvanceInfoList = []
  		for (var i = 0; i < swap_list.length; i++) {
  			playerTempInfoList[i] = this.playerInfoList[swap_list[i]]
  			playerAdvanceInfoList[i] = this.player_advance_info_list[swap_list[i]]
  		}
  		this.playerInfoList = playerTempInfoList;
  		this.player_advance_info_list = playerAdvanceInfoList;
  	},

  	updatePlayerInfo : function(serverSeatNum, playerInfo){
  		this.playerInfoList[serverSeatNum] = playerInfo;
  	},

  	updatePlayerState : function(serverSeatNum, state){
  		this.playerStateList[serverSeatNum] = state;
  	},

  	updatePlayerOnlineState : function(serverSeatNum, state){
  		this.playerInfoList[serverSeatNum]["online"] = state;
  	},

  	startGame : function(){
  		this.curRound = this.curRound + 1;
  		this.isPlayingGame = 1;
		this.playerPokerList = [[0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0]]
		this.waitIdx = this.controllerIdx;
		this.controllerDiscard = []
		this.deskPokerList = [[],[],[],[]]
		this.showHandFlag = 1
  	},

  	endGame : function(){
  		// 重新开始准备
  		this.playerStateList = [0, 0, 0, 0];
  		this.isPlayingGame = 0;
  	},
});