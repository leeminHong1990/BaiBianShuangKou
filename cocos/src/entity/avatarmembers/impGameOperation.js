"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameOperation = impCommunicate.extend({
	__init__ : function()
	{
		this._super();
		this.isPlayingStartAnimation = 0
		this.diceList = [[0,0],[0,0],[0,0],[0,0]]
	    KBEngine.DEBUG_MSG("Create impRoomOperation");
  	},

	startGame : function(controllerIdx, keyCard, cards, swap_list){
		cc.log("startGame")
		cc.log(controllerIdx, keyCard, cards, swap_list)
		// cc.log(dealerIdx, tileList, kingTile, diceList)
		
		if(!this.curGameRoom){
			return;
		}
		cc.log(this.serverSeatNum)
		//重置
		this.serverSeatNum = swap_list.indexOf(this.serverSeatNum)
		this.curGameRoom.startGame();
		this.curGameRoom.playerPokerList[this.serverSeatNum] = cards
		this.curGameRoom.keyCard = keyCard
		this.curGameRoom.controllerIdx = controllerIdx
		this.curGameRoom.waitIdx = controllerIdx

		//玩家交换位置
		cc.log("this.serverSeatNum", this.serverSeatNum)
		this.curGameRoom.swapPlayerBaseInfo(swap_list)


		cc.log(this.curGameRoom.playerPokerList)

		if(h1global.curUIMgr.gameroomprepare_ui){
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}
		this.isPlayingStartAnimation = 1
		if(h1global.curUIMgr.gameroom_ui){
			h1global.curUIMgr.gameroom_ui.hide();
			h1global.curUIMgr.gameroom_ui.show(function(){
				// h1global.curUIMgr.gameroom_ui.startBeginAnim(diceList, dealerIdx);
				h1global.curUIMgr.gameroom_ui.startBeginAnim()
				h1global.curUIMgr.gameroom_ui.update_key_card_panel();
			});
		}
		if(h1global.curUIMgr.gameroominfo_ui){
			h1global.curUIMgr.gameroominfo_ui.update_round();
			h1global.curUIMgr.gameroominfo_ui.update_lefttile();
		}
		if(h1global.curUIMgr.gameconfig_ui && h1global.curUIMgr.gameconfig_ui.is_show){
			h1global.curUIMgr.gameconfig_ui.update_state();
		}
		// 关闭结算界面
		if(h1global.curUIMgr.settlement_ui){
			h1global.curUIMgr.settlement_ui.hide();
		}
		if(h1global.curUIMgr.result_ui){
			h1global.curUIMgr.result_ui.hide();
		}
	},

	readyForNextRound : function(serverSeatNum){
		if(!this.curGameRoom){
			return;
		}
		this.curGameRoom.updatePlayerState(serverSeatNum, 1);
		if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show){
			h1global.curUIMgr.gameroomprepare_ui.update_player_state(serverSeatNum, 1);
		}
	},

	postMultiOperation : function(idx_list, aid_list, tile_list){
		// 用于特殊处理多个人同时胡牌的情况
		if(h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show){
			for(var i = 0; i < idx_list.length; i++){
				h1global.curUIMgr.gameroom_ui.playOperationEffect(const_val.OP_KONG_WIN, idx_list[i]);
			}
		}
		// if(this.curGameRoom.playerInfoList[serverSeatNum]["sex"] == 1){
		// 	cc.audioEngine.playEffect("res/sound/voice/male/sound_man_win.mp3");
		// } else {
		cc.audioEngine.playEffect("res/sound/voice/female/sound_woman_win.mp3");
		// }
	},

	postOperation : function(serverSeatNum, aid, realCards, insteadCards){
		cc.log("postOperation: ", serverSeatNum, aid, realCards, insteadCards);
		if(!this.curGameRoom){
			return;
		}
		// this.curGameRoom.waitIdx = (this.curGameRoom.waitIdx + 1)%4
		if (aid == const_val.OP_PASS) {
			if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
				if (serverSeatNum == this.serverSeatNum) {
					// this.curGameRoom.waitIdx = -1;
					this.curGameRoom.showHandFlag = 0
					h1global.curUIMgr.gameroom_ui.update_hand_card_panel()
					// h1global.curUIMgr.gameroom_ui.update_opration_panel()
				}
				if (this.curGameRoom.playerInfoList[serverSeatNum]["sex"] == 1) {
					var soundIdx = cutil.randomContainBorder(1,2)
					cc.audioEngine.playEffect("res/sound/voice/ThrowCards/Male/pass" + soundIdx.toString() + ".mp3");
				} else{
					var soundIdx = cutil.randomContainBorder(1,2)
					cc.audioEngine.playEffect("res/sound/voice/ThrowCards/Female/pass" + soundIdx.toString() + ".mp3");
				}
				// // h1global.curUIMgr.gameroom_ui.update_discard_card_panel(this.server2CurSitNum(serverSeatNum), insteadCards)
			}
		} else if (aid == const_val.OP_DISCARD) {
			this.curGameRoom.deskPokerList[serverSeatNum] = insteadCards
			var cardsType = cutil.getNormalCardsType(cutil.rightShiftCards(insteadCards))
			if (serverSeatNum == this.serverSeatNum) {
				this.curGameRoom.showHandFlag = 0
				// this.curGameRoom.waitIdx = -1
				if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show){
					h1global.curUIMgr.gameroom_ui.prepareCards = []
					h1global.curUIMgr.gameroom_ui.update_hand_card_panel()
					// h1global.curUIMgr.gameroom_ui.update_opration_panel()
				}
				cc.log("玩家"+String(serverSeatNum)+"出牌:"+String(insteadCards)+"剩余:"+String(this.curGameRoom.playerPokerList[serverSeatNum]))
			}else{
				if (this.curGameRoom.playerPokerList[this.serverSeatNum].length <= 0 && (this.serverSeatNum + 2)%4 == serverSeatNum) {
					for (var i = 0; i < realCards.length; i++) {
						var index = this.curGameRoom.playerPokerList[serverSeatNum].indexOf(realCards[i])
						if (index >= 0) {
							this.curGameRoom.playerPokerList[serverSeatNum].splice(index, 1)
						}
					}
					if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
						h1global.curUIMgr.gameroom_ui.update_cooperation_hand_card_panel(this.curGameRoom.playerPokerList[serverSeatNum])
					}
				}else{
					this.curGameRoom.playerPokerList[serverSeatNum].splice(0, insteadCards.length)
				}
			}
			if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
				h1global.curUIMgr.gameroom_ui.update_player_card_num(this.server2CurSitNum(serverSeatNum), this.curGameRoom.playerPokerList[serverSeatNum].length)
				h1global.curUIMgr.gameroom_ui.update_discard_card_panel(this.server2CurSitNum(serverSeatNum), this.chansferShowCards(insteadCards, cardsType))
				h1global.curUIMgr.gameroom_ui.show_palyer_line(cutil.judgeCardsLine(insteadCards, cardsType))
				h1global.curUIMgr.gameroom_ui.playCardsEffect(this.curGameRoom.playerInfoList[serverSeatNum]["sex"], insteadCards, cardsType)
				h1global.curUIMgr.gameroom_ui.playLeftsCardsEffect(this.curGameRoom.playerInfoList[serverSeatNum]["sex"], this.curGameRoom.playerPokerList[serverSeatNum].length, realCards.length)
			}
			
			this.curGameRoom.controllerIdx = serverSeatNum;
			this.curGameRoom.controller_discard_list = insteadCards

			
		}
	},

	chansferShowCards : function(cards, cardsType){
		if (cardsType == 11) {
			cards.sort(function(a,b){return a-b})
			var shiftCards = cutil.rightShiftCards(cards);
			if (shiftCards.indexOf(const_val.CARD2) >= 0) {
				var index = 0
				for (var i = 0; i < shiftCards.length-1; i++) {
					if (const_val.CIRCLE.indexOf(shiftCards[i]) +1 != const_val.CIRCLE.indexOf(shiftCards[i+1]) && const_val.CIRCLE.indexOf(shiftCards[i]) != const_val.CIRCLE.indexOf(shiftCards[i+1])) {
						index = i+1
					}
				}
				if (index > 0) {
					var newList = cards.slice(index,cards.length)
					newList = newList.concat(cards.slice(0,index))
					return newList
				}
			}
		}
		return cards
	},

	selfPostOperation : function(aid, cards_list, instead_list){
		// 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己
		// 而doOperation和postOperation的参数不同，这里讲doOperation的参数改为postOperation的参数
		var copy_cards_list = [];
		copy_cards_list = copy_cards_list.concat(cards_list)

		var copy_instead_list = [];
		copy_instead_list = copy_instead_list.concat(instead_list)

		if(aid == const_val.OP_PASS){

		}else if(aid == const_val.OP_DISCARD) {
			
		}
		// 用于转换doOperation到postOperation的参数
		this.postOperation(this.serverSeatNum, aid, copy_cards_list, copy_instead_list);
	},

	doOperation : function(aid, cards_list){
		cc.log("doOperation: ", aid, cards_list)
		if(!this.curGameRoom){
			return;
		}
	},

	doOperationFailed : function(err){
		cc.log("doOperationFailed: " + err.toString());
	},

	confirmOperation : function(aid, cards_list, instead_list){
		cc.log("confirmOperation", aid, cards_list, instead_list)
		
		if(!this.curGameRoom){
			return;
		}
		for (var i = 0; i < cards_list.length; i++) {
			var index = this.curGameRoom.playerPokerList[this.serverSeatNum].indexOf(cards_list[i])
			this.curGameRoom.playerPokerList[this.serverSeatNum].splice(index, 1)
		}
		// 自己的操作直接本地执行，不需要广播给自己
		this.curGameRoom.waitIdx = -1;
		this.selfPostOperation(aid, cards_list, instead_list);
		this.baseCall("confirmOperation", aid, cards_list);
	},

	//等待出牌
	waitForOperation : function(waitIdx, aid, cards){
		cc.log("waitForOperation",waitIdx, aid, cards)
		if(!this.curGameRoom){
			return;
		}
		this.curGameRoom.waitIdx = waitIdx;
		this.curGameRoom.deskPokerList[waitIdx] = []
		if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
			//显示黄框
			h1global.curUIMgr.gameroom_ui.show_yellow_frame(waitIdx);
		}
		if(aid == const_val.OP_DISCARD){
			if (h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show) {
				if (waitIdx == this.serverSeatNum) {
					h1global.curUIMgr.gameroom_ui.update_opration_panel(true);
					this.getTipsCards()
				}
				h1global.curUIMgr.gameroom_ui.update_discard_card_panel(this.server2CurSitNum(waitIdx), []);
				h1global.curUIMgr.gameroom_ui.update_discard_card_panel(this.server2CurSitNum((this.curGameRoom.controllerIdx +1) % 4), []);
			}
		}
	},

	roundResult : function(roundRoomInfo){
		if(!this.curGameRoom){
			return;
		}
		cc.log("roundResult")
		cc.log(roundRoomInfo)
		this.curGameRoom.endGame();
		var playerInfoList = roundRoomInfo["player_info_list"];
		// for(var i = 0; i < playerInfoList.length; i++){
		// 	this.curGameRoom.playerInfoList[i]["score"] = playerInfoList[i]["score"];
		// 	this.curGameRoom.playerInfoList[i]["total_score"] = playerInfoList[i]["total_score"];
		// }
		for (var i = 0; i < playerInfoList.length; i++) {
			this.curGameRoom.player_advance_info_list[i]["score"] = playerInfoList[i]["score"]
			this.curGameRoom.player_advance_info_list[i]["total_score"] = playerInfoList[i]["total_score"]
		}
		if(h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show){
			// h1global.curUIMgr.gameroom_ui.play_luckytiles_anim(roundRoomInfo["lucky_tiles"], function(){
			// 	if(h1global.curUIMgr.settlement_ui){
			// 		h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo);
			// 	}
			// });
			h1global.curUIMgr.gameroom_ui.show_left_cards(roundRoomInfo["leftCards"])
			if(h1global.curUIMgr.settlement_ui){
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo);
			}
		}
	},

	finalResult : function(finalPlayerInfoList, roundRoomInfo){
		cc.log("finalResult",finalPlayerInfoList, roundRoomInfo)
		if(!this.curGameRoom){
			return;
		}
		if(h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show){
			// h1global.curUIMgr.gameroom_ui.play_luckytiles_anim(roundRoomInfo["lucky_tiles"], function(){
				
			// });
			h1global.curUIMgr.gameroom_ui.show_left_cards(roundRoomInfo["leftCards"])
			if(h1global.curUIMgr.settlement_ui){
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, function(){
					if(h1global.curUIMgr.result_ui){
						h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList);
					}
				});
			}
		}
	},

	roundEndCallback:function(){
		if(!this.curGameRoom){
			return;
		}
		this.baseCall("roundEndCallback");
	},
	
	notifyPlayerOnlineStatus:function(serverSeatNum, status){
		if(!this.curGameRoom){
			return;
		}
		this.curGameRoom.updatePlayerOnlineState(serverSeatNum, status);
		if(h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show){
			h1global.curUIMgr.gameroom_ui.update_player_online_state(this.server2CurSitNum(serverSeatNum), status);
		}
	},

	showHand:function(){
		this.baseCall("showHand");
	},

});
