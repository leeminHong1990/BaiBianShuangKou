"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impRoomOperation = impGameRules.extend({
	__init__ : function()
	{
		this._super();
		this.curGameRoom = undefined;
	    KBEngine.DEBUG_MSG("Create impRoomOperation");
  	},

  	//self.roomMode, self.gameRound, self.insertCard, self.dealMode, self.changeSeat, self.changeSeat, self.bestPhase, 0
	createRoom : function(roomMode, gameRound, insertCard, dealMode, scoreMode,changeSeat, bestPhase, is_agent) {
		cc.log("createRoom:",roomMode, gameRound, insertCard, dealMode, scoreMode, changeSeat, bestPhase, is_agent);
		this.baseCall("createRoom", roomMode, gameRound, insertCard, dealMode, scoreMode, changeSeat, bestPhase, is_agent);
	},

	createRoomSucceed : function(roomInfo){
		cc.log("createRoomSucceed!")
		this.curGameRoom = new GameRoomEntity();
		this.curGameRoom.updateRoomData(roomInfo);
		this.serverSeatNum = 0;
		if(roomInfo["isAgent"]){
			this.serverSeatNum = -1;
		}
		// else {
		// 	this.curGameRoom.updatePlayerState(this.serverSeatNum, 1);
		// }
	
		h1global.runScene(new GameRoomScene());
		// h1global.curUIMgr.gameroomprepare_ui.show();
		// h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(0, {});
	},

	createRoomFailed : function(err){
		cc.log("createRoomFailed!");
		if(err == -1){
			h1global.globalUIMgr.info_ui.show_by_info("房卡不足!", cc.size(300, 200));
		} else if(err == -2){
			h1global.globalUIMgr.info_ui.show_by_info("已经在房间中!", cc.size(300, 200));
		}
	},

	server2CurSitNum : function(serverSeatNum){
		if(this.curGameRoom){
			return (serverSeatNum + this.curGameRoom.playerInfoList.length - this.serverSeatNum) % this.curGameRoom.playerInfoList.length;
		} else {
			return -1;
		}
	},

	notifyChangeController : function(controllerIdx){
		cc.log("notifyChangeController",controllerIdx)
		this.curGameRoom.deskPokerList[this.curGameRoom.controllerIdx.controllerIdx] = []
		if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
			h1global.curUIMgr.gameroom_ui.update_discard_card_panel(this.server2CurSitNum(this.curGameRoom.controllerIdx), [])
		}
		this.curGameRoom.controllerIdx = controllerIdx
		
	},

	notifyCooperationCards : function(cooperationIdx, cards){
		//对家牌
		if (this.curGameRoom) {
			this.curGameRoom.playerPokerList[cooperationIdx] = cards
		}
		if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
			h1global.curUIMgr.gameroom_ui.update_cooperation_hand_card_panel(cards)
		}
	},

	enterRoom : function(roomId){
		this.baseCall("enterRoom", roomId);
	},

	enterRoomSucceed : function(serverSeatNum, roomInfo){
		cc.log("enterRoomSucceed!",serverSeatNum, roomInfo)
		this.curGameRoom = new GameRoomEntity();
		this.curGameRoom.updateRoomData(roomInfo);
		// this.serverSeatNum = 0;
		// for(var i = 0; i < roomInfo["player_info_list"].length; i++){
		// 	if(roomInfo["player_info_list"][i]["uuid"].compare(this.uuid) == 0){
		// 		this.serverSeatNum = roomInfo["player_info_list"][i]["idx"];
		// 		break;
		// 	}
		// }
		this.serverSeatNum = serverSeatNum;
		this.curGameRoom.playerStateList = roomInfo["player_state_list"];
		// h1global.runScene(new GameRoomScene());
		if(cc.director.getRunningScene().className == "GameRoomScene"){
			h1global.runScene(new GameRoomScene());
			cutil.unlock_ui();
		} else {
			// if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
			// 	h1global.runScene(new GameRoomScene());
			// } else {
			// 	h1global.reconnect = true;
			// }
			h1global.runScene(new GameRoomScene());
		}
		// h1global.curUIMgr.gameroomprepare_ui.show();
		// for(var i = 0; i < this.curGameRoom.playerInfoList.length; i++){
		// 	h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(i, this.curGameRoom.playerInfoList[i]);
		// }
	},

	enterRoomFailed : function(err){
		cc.log("enterRoomFailed!");
		if(err == -1){
			h1global.globalUIMgr.info_ui.show_by_info("房间不存在！", cc.size(300, 200));
		} else if(err == -2){
			h1global.globalUIMgr.info_ui.show_by_info("房间人数已满！", cc.size(300, 200));
		}
	},

	quitRoom : function(){
		if(!this.curGameRoom){
			return;
		}
		this.baseCall("quitRoom");
	},

	quitRoomSucceed : function(player_info_list){
		cc.log('quitRoomSucceed', player_info_list)
		var self = this
		if (onhookMgr) { 
            onhookMgr.setApplyCloseLeftTime(null);
        }
        // h1global.runScene(new GameHallScene());
    	h1global.curUIMgr.result_ui.show_by_info(player_info_list);
	},

	quitRoomFailed : function(err){
		cc.log("quitRoomFailed!");
	},

	othersQuitRoom : function(serverSeatNum){
		if(this.curGameRoom){
			this.curGameRoom.playerInfoList[serverSeatNum] = null;
			if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show){
				h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(serverSeatNum, this.curGameRoom.playerInfoList[serverSeatNum]);
			}
		}
	},

	othersEnterRoom : function(playerInfo){
		cc.log("othersEnterRoom")
		cc.log(playerInfo)
		this.curGameRoom.updatePlayerInfo(playerInfo["idx"], playerInfo);
		// this.curGameRoom.updatePlayerState(playerInfo["idx"], 1);
		if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show){
			h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(playerInfo["idx"], playerInfo);
			// h1global.curUIMgr.gameroomprepare_ui.update_player_state(playerInfo["idx"], 1);
		}
	},

	handleReconnect : function(recRoomInfo){
		this.curGameRoom = new GameRoomEntity();
		this.curGameRoom.reconnectRoomData(recRoomInfo);

		if(this.curGameRoom.isAgent && this.curGameRoom.agentInfo['userId'].compare(this.userId) == 0){
			this.serverSeatNum = -1;
		} else {
			var player_base_info_list = recRoomInfo["init_info"]["player_base_info_list"]
			for(var i = 0; i < player_base_info_list.length; i++){
				if(player_base_info_list[i]["userId"].compare(this.userId) == 0){
					this.serverSeatNum = i;
					break;
				}
			}
		}
		// cc.log("++++++++++++++++++++++++")
		// cc.log(this.serverSeatNum)
		// cc.log("handleReconnect:")
		// cc.log(this.userId)
		// cc.log(recRoomInfo)
		// if(cc.director.getRunningScene().className == "GameRoomScene"){
		// 	h1global.runScene(new GameRoomScene());
		// } else {
		// 	if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
		// 		h1global.runScene(new GameRoomScene());
		// 	} else {
		// 		h1global.reconnect = true;
		// 	}
		// }
		h1global.runScene(new GameRoomScene());
	},

	applyDismissRoom : function(){
		if(this.curGameRoom){
			this.baseCall("applyDismissRoom");
			this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME + 1; // 本地操作先于服务端，所以增加1s防止网络延迟
			this.curGameRoom.applyCloseFrom = this.serverSeatNum;
			this.curGameRoom.applyCloseStateList[this.serverSeatNum] = 1;
			h1global.curUIMgr.applyclose_ui.show_by_sitnum(this.serverSeatNum);
			onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME + 1); // 本地操作先于服务端，所以增加1s防止网络延迟
		}
	},

	reqDismissRoom : function(serverSeatNum){
		if(this.curGameRoom){
			this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME;
			this.curGameRoom.applyCloseFrom = serverSeatNum
			this.curGameRoom.applyCloseStateList = [0, 0, 0, 0];
			this.curGameRoom.applyCloseStateList[serverSeatNum] = 1;
			h1global.curUIMgr.applyclose_ui.show_by_sitnum(serverSeatNum);
			onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME);
		}
	},

	voteDismissRoom : function(vote){
		// cc.log("voteDismissRoom")
		this.baseCall("voteDismissRoom", vote);
	},

	voteDismissResult : function(serverSeatNum, vote){
		cc.log("voteDismissResult", serverSeatNum, vote)
		if(this.curGameRoom){
			this.curGameRoom.applyCloseStateList[serverSeatNum] = vote;
			var vote_agree_num = 0;
			var vote_disagree_num = 0;
			for(var i = 0; i < this.curGameRoom.playerInfoList.length; i++){
				if(this.curGameRoom.applyCloseStateList[i] == 1){
					vote_agree_num = vote_agree_num + 1;
				} else if(this.curGameRoom.applyCloseStateList[i] == 2){
					vote_disagree_num = vote_disagree_num + 1;
				}
			}
			// if(vote_agree_num >= 3){

			// }
			// if(vote_disagree_num >= 2){
			// 	if(h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show){
			// 		h1global.curUIMgr.applyclose_ui.hide();
			// 	}
			// 	return;
			// }
            if(vote_disagree_num >= 2 ){
                if(h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show){
                    h1global.curUIMgr.applyclose_ui.hide();
                    for(var i = 0; i < this.curGameRoom.playerInfoList.length; i++){
                        this.curGameRoom.applyCloseStateList[i] = 0;
                    }
                }
                return;
            }else if(vote_agree_num == this.curGameRoom.playerInfoList.length - 1){
                this.quitRoom();
            }
			if(h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show){
				h1global.curUIMgr.applyclose_ui.update_vote_state();
			}
		}
	},
});
