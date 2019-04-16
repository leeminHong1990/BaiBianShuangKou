"use strict"
var GameRoomUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/SKGameRoomUI.json";
		this.talk_img_num = 0;
	},
	initUI:function(){
		// var bg_img = ccui.helper.seekWidgetByName(this.rootUINode, "bg_img");
		// var bg_img_content_size = bg_img.getContentSize();
		// var scale = cc.winSize.width/bg_img_content_size.width;
		// if (cc.winSize.height/bg_img_content_size.height > scale){
		// 	scale = cc.winSize.height/bg_img_content_size.height;
		// }
		// bg_img.setScale(scale);
		// 打牌动画所需资源
		if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
			h1global.curUIMgr.gameplayerinfo_ui.hide()
		}
		var self = this;
		this.prepareCards = []
		h1global.curUIMgr.gameroominfo_ui.show();
		var player = h1global.entityManager.player();
		this.update_room_info_panel();
		this.initOprationPanel()

		this.update_hand_card_panel()
		this.update_key_card_panel()

		for (var i = 0; i < 4; i++) {
			var deskSeat = player.server2CurSitNum(i)
			this.update_player_info_panel(deskSeat, player.curGameRoom.playerInfoList[i])
			this.update_player_score(deskSeat,player.curGameRoom.player_advance_info_list[i])
			this.update_discard_card_panel(deskSeat, player.curGameRoom.deskPokerList[i])
			this.update_player_card_num(deskSeat, player.curGameRoom.playerPokerList[i].length)
			this.update_player_online_state(deskSeat, player.curGameRoom.playerInfoList[i]["online"])
		}

		if (player.curGameRoom.playerPokerList[player.serverSeatNum].length <= 0) {
			cc.log(player.curGameRoom.playerPokerList)
			cc.log(player.serverSeatNum)
			this.update_cooperation_hand_card_panel(player.curGameRoom.playerPokerList[(player.serverSeatNum + 2)%4])
		}
		if (player.curGameRoom.waitIdx == player.serverSeatNum) {
			player.getTipsCards()
		}
		this.update_opration_panel(false)
		this.show_yellow_frame(player.curGameRoom.waitIdx);

		if(!cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.resumeMusic();
        }
        var opration_panel = this.rootUINode.getChildByName("opration_panel");
        var discard_btn = ccui.helper.seekWidgetByName(opration_panel, "discard_btn")
        function touch_event(sender, eventType){
        	if (eventType === ccui.Widget.TOUCH_ENDED) {
        		self.resetPrepareCards()
        		discard_btn.setTouchEnabled(false)
				discard_btn.setBright(false)
        	}
        }
        this.rootUINode.getChildByName("touch_panel").addTouchEventListener(touch_event)
	},

	update_room_info_panel:function(){
		var player = h1global.entityManager.player();
		var room_info_panel = this.rootUINode.getChildByName("room_info_panel")

		var insert_card_label = ccui.helper.seekWidgetByName(room_info_panel, "insert_card_label");
		insert_card_label.ignoreContentAdaptWithSize(true);
		var deal_card_label = ccui.helper.seekWidgetByName(room_info_panel, "deal_card_label");
		deal_card_label.ignoreContentAdaptWithSize(true);
		var score_mode_label = ccui.helper.seekWidgetByName(room_info_panel, "score_mode_label");
		score_mode_label.ignoreContentAdaptWithSize(true);
		var change_seat_label = ccui.helper.seekWidgetByName(room_info_panel, "change_seat_label");
		change_seat_label.ignoreContentAdaptWithSize(true);
		var best_phase_label = ccui.helper.seekWidgetByName(room_info_panel, "best_phase_label");
		best_phase_label.ignoreContentAdaptWithSize(true);

		insert_card_label.setString(const_val.INSERT_CARD[player.curGameRoom.insert_card] + "插牌")
		deal_card_label.setString(const_val.DEAL_MODE[player.curGameRoom.deal_mode] + "发牌")
		score_mode_label.setString(const_val.SCORE_MODE[player.curGameRoom.scoreMode])
		change_seat_label.setString(const_val.CHANGE_SEAT[player.curGameRoom.changeSeat])
		best_phase_label.setString("最高相数:" + player.curGameRoom.best_phase.toString())
	},

	initOprationPanel:function(){
		var self = this;
		var player = h1global.entityManager.player()
		var opration_panel = this.rootUINode.getChildByName("opration_panel");
		ccui.helper.seekWidgetByName(opration_panel, "tips_btn").addTouchEventListener(function(sender, eventType){
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				cc.log("tips_btn")
				var tipsCards = player.getNextTips();
				if (tipsCards.length > 0) {
					self.setTipsCards(tipsCards)
				}else{
					if (player.curGameRoom.controllerIdx != player.serverSeatNum) {
						player.confirmOperation(const_val.OP_PASS, [])
						opration_panel.setVisible(false);
					}
					this.setVisible(false)
				}
				cc.log("tipsCards:",tipsCards)
			}
		})

		ccui.helper.seekWidgetByName(opration_panel, "pass_btn").addTouchEventListener(function(sender, eventType){
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				cc.log("pass_btn")
				if (player.curGameRoom.controllerIdx == player.serverSeatNum) {return}
				player.confirmOperation(const_val.OP_PASS, [])
				self.rootUINode.getChildByName("opration_panel").setVisible(false);
				self.update_hand_card_panel()
				self.prepareCards = []
				opration_panel.setVisible(false);
			}
		})

		ccui.helper.seekWidgetByName(opration_panel, "discard_btn").addTouchEventListener(function(sender, eventType){
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				cc.log("discard_btn")
				cc.log(self.prepareCards)
				var no_discards_img = self.rootUINode.getChildByName("no_discards_img");
				if (self.prepareCards.length > 0) {
					var resultList = player.canPlayCards(self.prepareCards)
					if (resultList[0]) {
						player.confirmOperation(const_val.OP_DISCARD, self.prepareCards, resultList[1])
						self.rootUINode.getChildByName("opration_panel").setVisible(false);
						no_discards_img.setVisible(false);
						opration_panel.setVisible(false);
					}else{
					    self.show_no_discards_tips();
					}
				}else{
					self.show_no_discards_tips();		
				}				
			}
		})

		ccui.helper.seekWidgetByName(opration_panel, "showhand_btn").addTouchEventListener(function(sender, eventType){
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				// 倒牌	
				player.showHand();
				opration_panel.setVisible(false);
			}
		})
	},

	show_no_discards_tips : function(){
		var self = this;
		var no_discards_img = self.rootUINode.getChildByName("no_discards_img");
		var moveBy = cc.moveBy(0.5,cc.p(0,cc.winSize.height*0.1));
		no_discards_img.setVisible(true);
		no_discards_img.loadTexture("res/ui/GameRoomUI/no_discards_img.png");
		no_discards_img.runAction(cc.Sequence.create(cc.fadeIn(0.5), cc.DelayTime.create(0.5), cc.Spawn.create(moveBy,cc.fadeOut(0.5))));
		no_discards_img.setPosition(cc.winSize.width * 0.5,cc.winSize.height * 0.4);
	},

	show_no_big_tips : function(){
		var self = this;
		var no_discards_img = self.rootUINode.getChildByName("no_discards_img");
		var moveBy = cc.moveBy(0.5,cc.p(0,cc.winSize.height*0.1));
		no_discards_img.setVisible(true);
		no_discards_img.loadTexture("res/ui/GameRoomUI/no_big_img.png");
		no_discards_img.runAction(cc.Sequence.create(cc.fadeIn(0.5), cc.DelayTime.create(0.5), cc.Spawn.create(moveBy,cc.fadeOut(0.5))));
		no_discards_img.setPosition(cc.winSize.width * 0.5,cc.winSize.height * 0.4);
	},

	resetPrepareCards:function(){
		if (this.prepareCards.length <= 0) {
			return
		}
		var player = h1global.entityManager.player();
		var card_list = player.curGameRoom.playerPokerList[player.serverSeatNum]
		var hand_card_panel = this.rootUINode.getChildByName("hand_card_panel");
		for (var i = 0; i < card_list.length; i++) {
			var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(i));
			this.unselect(card)
		}
	},


	setTipsCards:function(tipsCards){
		var showCard = tipsCards.concat([])
		if (showCard.length <= 0) {
			this.show_no_big_tips();
			return
		}
		var player = h1global.entityManager.player();
		var card_list = player.curGameRoom.playerPokerList[player.serverSeatNum]
		var hand_card_panel = this.rootUINode.getChildByName("hand_card_panel");

		this.resetPrepareCards()
		
		for (var i = 0; i < card_list.length; i++) {
			var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(i));
			if (showCard.indexOf(card.card_num) >= 0) {
				this.choose(card)
				showCard.splice(showCard.indexOf(card.card_num), 1)
			}
		}
	},

	choose:function(card){
		if (card.is_select) {
			this.unselect(card)
		}else{
			this.select(card)
		}
	},

	select:function(card){
		if (!card.is_select) {
			card.is_select = true
			card.setPositionY(25)
			this.insertPrepareCard([card.card_num])
			cc.audioEngine.playEffect("res/sound/effect/choose.mp3");
		}
	},

	unselect:function(card){
		if (card.is_select) {
			card.is_select = false
			card.setPositionY(0)
			this.removePrepareCard([card.card_num])
			cc.audioEngine.playEffect("res/sound/effect/choose.mp3");
		}
	},

	insertPrepareCard:function(cards_list){
		for (var i = 0; i < cards_list.length; i++) {
			this.prepareCards.push(cards_list[i])
		}
		this.prepareCards.sort(function(a, b){return a-b;})
		this.update_opration_panel(false)
	},

	removePrepareCard:function(cards_list){
		for (var i = 0; i < cards_list.length; i++) {
			var index = this.prepareCards.indexOf(cards_list[i])
			if (index >= 0) {
				this.prepareCards.splice(index, 1)
			}
		}
		this.update_opration_panel(false)
	},

	// 将牌转换为 显示 的顺序
	convert2DiscardSeatCards:function(deskSeat, cards){
		var newList = []

		if (deskSeat == 0 || deskSeat == 2) {
			var shadow_cards = []
			shadow_cards = shadow_cards.concat(cards).sort(cutil.cardSortFunc)
			var idx = Math.floor(shadow_cards.length/2)
			for (var i = 0; i < shadow_cards.length; i++) {
				if (i%2 == 0) {
					idx += i
				} else{
					idx -= i
				}
				newList.push(shadow_cards[idx])	
			}
			
		}else if (deskSeat == 1) {
			newList = newList.concat(cards).sort(cutil.cardSortFunc)
		}else if (deskSeat == 3) {
			newList = newList.concat(cards).sort(function(a,b){return a-b;})
		}
		return newList
	},

	convert2HandCards:function(cards){
		var newList = []
		var shadow_cards = []
		shadow_cards = shadow_cards.concat(cards).sort(function(a,b){return a-b;})
		var idx = Math.floor(shadow_cards.length/2)
		for (var i = 0; i < shadow_cards.length; i++) {
			if (i%2 == 0) {
				idx += i
			} else{
				idx -= i
			}
			newList.push(shadow_cards[idx])
		}
		return newList
	},

	resetHandCards:function(){
		var hand_card_panel = this.rootUINode.getChildByName("hand_card_panel");
		for (var i = 0; i < 27; i++) {
			var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(i));
			card.is_select = false;
			card.setPositionY(0)
			card.setVisible(false)
		}
		this.prepareCards = []
	},

	reset_discard_panel:function(deskSeat){
		var discard_card_panel = this.rootUINode.getChildByName("discard_card_panel_" + String(deskSeat));
		for (var i = 0; i < 27; i++) {
			var card = ccui.helper.seekWidgetByName(discard_card_panel, "card_" + String(i));
			card.setVisible(false)
		}
	},

	update_hand_card_panel:function(){
		var self = this
		var player = h1global.entityManager.player();
		var hand_card_panel = this.rootUINode.getChildByName("hand_card_panel");
		var hand_card_panel_width = hand_card_panel.getContentSize().width;
		this.resetHandCards();
		// 重置所有卡牌状态 
		var card_list = player.curGameRoom.playerPokerList[player.serverSeatNum]
		card_list = this.convert2HandCards(card_list)
		cc.log('update_hand_card_panel')
		cc.log(card_list)
		var half_card_width = 43
		var card_dis = 30
		function card_touch_event(sender, eventType){

			if (eventType == ccui.Widget.TOUCH_BEGAN) {
				self.choose(sender);
			} else if (eventType == ccui.Widget.TOUCH_MOVED) {
				let moved_pos = hand_card_panel.convertToNodeSpace(sender.getTouchMovePosition());
				if (moved_pos.y >= 0 && moved_pos.y <= 120 && moved_pos.x > hand_card_panel_width/2 - Math.floor((card_list.length-1)/2)*30 - 30 && moved_pos.x < hand_card_panel_width/2 + Math.floor(card_list.length/2)*30 - 13) {
					var i = Math.floor(moved_pos.x/30)
					if(i-13 <= 0){
						var card_num = Math.abs(i-13) * 2
						var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(card_num));
						if (card.is_select != sender.is_select) {
							self.choose(card)
						}
					} else{
						var card_num = Math.abs(i-13) * 2 - 1;
						var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(card_num));
						if (card.is_select != sender.is_select) {
							self.choose(card)
						}
					}
					
				}
			}
		}
		for (var i = 0; i < card_list.length; i++) {
			var card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(i));
			card.card_num = card_list[i];
			card.loadTexture("Card/" + card_list[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
			card.setVisible(true);
			card.addTouchEventListener(card_touch_event);
		}
	},

	update_cooperation_hand_card_panel:function(card_list){
		this.rootUINode.getChildByName("player_info_panel_2").setVisible(false);
		this.rootUINode.getChildByName("player_card_num_panel_2").setVisible(false);

		card_list = this.convert2HandCards(card_list)

		var cooperation_hand_card_panel = this.rootUINode.getChildByName("cooperation_hand_card_panel");
		for (var i = 0; i < 27; i++) {
			var card = ccui.helper.seekWidgetByName(cooperation_hand_card_panel, "card_" + String(i));
			card.is_select = false;
			card.setVisible(false)
		}

		for (var i = 0; i < card_list.length; i++) {
			var card = ccui.helper.seekWidgetByName(cooperation_hand_card_panel, "card_" + String(i));
			card.card_num = card_list[i];
			card.loadTexture("Card/" + card_list[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
			card.setVisible(true);
		}
	},

	update_discard_card_panel:function(deskSeat, cards){
		this.reset_discard_panel(deskSeat)
		var card_list = this.convert2DiscardSeatCards(deskSeat, cards)
		cc.log("update_discard_card_panel  :" + deskSeat);
		cc.log(" cards :" + cards);
		// cc.log(card_list)
		var discard_card_panel = this.rootUINode.getChildByName("discard_card_panel_" + String(deskSeat));
		for (var i = 0; i < card_list.length; i++) {
			var card = ccui.helper.seekWidgetByName(discard_card_panel, "card_" + String(i));
			card.loadTexture("Card/" + card_list[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
			card.setVisible(true)
		}
		discard_card_panel.setVisible(true)
	},

	update_key_card_panel:function(){
		return;
		if (!this.is_show) {return}
		var player = h1global.entityManager.player();
		var key_panel = this.rootUINode.getChildByName("key_panel");
		var key_card_img = key_panel.getChildByName("key_card_img");
		if (player.curGameRoom.keyCard <= 0) {
			key_panel.setVisible(false)
			return
		}
		key_panel.setVisible(true)
		key_card_img.ignoreContentAdaptWithSize(true);
		key_card_img.loadTexture("Card/" + player.curGameRoom.keyCard.toString() + ".png", ccui.Widget.PLIST_TEXTURE)
		key_panel.runAction(cc.Sequence.create(cc.DelayTime.create(3.0), cc.CallFunc.create(function(){key_panel.setVisible(false);})));
	},

	update_player_info_panel:function(deskSeat, playerBaseInfo){
		if(deskSeat < 0 || deskSeat > 3){
			return;
		}
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + deskSeat.toString());
		var name_label = ccui.helper.seekWidgetByName(player_info_panel, "name_label");
		var owner_img = ccui.helper.seekWidgetByName(player_info_panel, "owner_img");

		name_label.setString(playerBaseInfo["nickname"])
		cutil.loadPortraitTexture(playerBaseInfo["head_icon"], function(img){
			if(h1global.curUIMgr.gameroom_ui && h1global.curUIMgr.gameroom_ui.is_show && player_info_panel){
				player_info_panel.getChildByName("frame_img").removeFromParent();
				var portrait_sprite  = new cc.Sprite(img);
				portrait_sprite.setName("portrait_sprite");
				portrait_sprite.setScale(100/portrait_sprite.getContentSize().width);
				portrait_sprite.x = player_info_panel.getContentSize().width * 0.5;
				portrait_sprite.y = player_info_panel.getContentSize().height * 0.5;
    			player_info_panel.addChild(portrait_sprite);
    			player_info_panel.reorderChild(portrait_sprite, -99)
			}
		}, playerBaseInfo["uuid"].toString() + ".png");
		if (playerBaseInfo["idx"] == 0) {
			owner_img.setVisible(true);
			player_info_panel.reorderChild(owner_img, 99)
		} else {
			owner_img.setVisible(false);
		}
	},

	update_player_score:function(deskSeat, playerAdvanceInfo){
		// rank_img
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + deskSeat.toString());
		var score_label = ccui.helper.seekWidgetByName(player_info_panel, "score_label");
		score_label.ignoreContentAdaptWithSize(true);
		score_label.setString(playerAdvanceInfo["total_score"] || 0)
	},

	update_player_card_num:function(deskSeat, cardsNum){
		if(deskSeat < 1 || deskSeat > 3){
			return;
		}
		var player_card_num_panel = this.rootUINode.getChildByName("player_card_num_panel_" + deskSeat.toString());
		var num_label = ccui.helper.seekWidgetByName(player_card_num_panel, "num_label");
		num_label.setString(cardsNum)
		if (cardsNum <= 0) {
			player_card_num_panel.setVisible(false)
		}
	},

	update_player_online_state:function(deskSeat, state){
		if(deskSeat < 0 || deskSeat > 3){
			return;
		}
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + deskSeat.toString());
		var state_img = ccui.helper.seekWidgetByName(player_info_panel, "state_img")
		if (state == 1) {
			state_img.loadTexture("res/ui/GameRoomUI/state_online.png")
			state_img.setVisible(true)
		} else if (state == 0) {
			state_img.loadTexture("res/ui/GameRoomUI/state_offline.png")
			state_img.setVisible(true)
		} else{
			state_img.setVisible(false)
		}
	},

	update_opration_panel:function(isRestTipsBtn){
		var player = h1global.entityManager.player();
		var opration_panel = this.rootUINode.getChildByName("opration_panel");
		cc.log("update_opration_panel",player.curGameRoom.waitIdx , player.serverSeatNum)
		
		var tips_btn = ccui.helper.seekWidgetByName(opration_panel, "tips_btn")
		var pass_btn = ccui.helper.seekWidgetByName(opration_panel, "pass_btn")
		var discard_btn = ccui.helper.seekWidgetByName(opration_panel, "discard_btn")
		var showhand_btn = ccui.helper.seekWidgetByName(opration_panel, "showhand_btn")
		
		if (isRestTipsBtn) {
			tips_btn.setVisible(true)
		}
		if (player.curGameRoom.waitIdx == player.serverSeatNum) {
			opration_panel.setVisible(true)
			
			if (this.prepareCards.length <= 0) {
				discard_btn.setTouchEnabled(false)
				discard_btn.setBright(false)
			}else{
				discard_btn.setTouchEnabled(true)
				discard_btn.setBright(true)
			}
			if (player.curGameRoom.waitIdx == player.curGameRoom.controllerIdx) {
				pass_btn.setVisible(false)
			}else{
				pass_btn.setVisible(true)
			}
			if (player.curGameRoom.showHandFlag && cutil.canCutPokers(player.curGameRoom.playerPokerList[player.serverSeatNum], player.curGameRoom.scoreMode, player.curGameRoom.room_mode)){
				showhand_btn.setVisible(true);
			} else {
				showhand_btn.setVisible(false);
			}
		}else{
			opration_panel.setVisible(false)
		}
	},

	getMessagePos:function(playerInfoPanel){
		var anchor_point = playerInfoPanel.getAnchorPoint();
		var content_size = playerInfoPanel.getContentSize();
		var cur_pos = playerInfoPanel.getPosition();
		var x = cur_pos.x - content_size.width * anchor_point.x + 130;
		var y = cur_pos.y - content_size.height * anchor_point.y + 180;
		if(x + 134 > cc.winSize.width){
			x = cc.winSize.width - 134;
		}
		if(y + 99 > cc.winSize.height){
			y = cc.winSize.height - 99;
		}
		return cc.p(x, y);
	},

	playEmotionAnim:function(serverSitNum, eid){
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		var talk_img = ccui.ImageView.create();
		// talk_img.setScale(1.0);
		talk_img.setPosition(this.getMessagePos(player_info_panel));
		talk_img.loadTexture("res/ui/Default/common_talk_bg.png");
		this.rootUINode.addChild(talk_img);
		// 加载表情图片
		cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        var cache = cc.spriteFrameCache;
        var plist_path = "res/effect/biaoqing.plist";
        var png_path = "res/effect/biaoqing.png";
        cache.addSpriteFrames(plist_path, png_path);
    	cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    	var anim_frames = [];
        for (var i = 1; i <= 3; i++) {
            var frame = cache.getSpriteFrame("biaoqing_" + eid.toString() + "_" + i.toString() + ".png");
            if (frame) {
                anim_frames.push(frame);
            }
        }
        var effect_animation = new cc.Animation(anim_frames, 0.5);
        var effect_action = new cc.Animate(effect_animation);

        var emot_sprite = cc.Sprite.create();
        emot_sprite.setScale(1.0);
        emot_sprite.setPosition(cc.p(125, 80));
        talk_img.addChild(emot_sprite);
        emot_sprite.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2), cc.CallFunc.create(function(){
        	talk_img.removeFromParent();
        })));
	},

	playMessageAnim:function(serverSitNum, mid){
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		var talk_img = ccui.ImageView.create();
		// talk_img.setScale(1.0);
		talk_img.setPosition(this.getMessagePos(player_info_panel));
		talk_img.loadTexture("res/ui/Default/common_talk_bg.png");
		this.rootUINode.addChild(talk_img);

		var msg_label = cc.LabelTTF.create("", "Arial", 22);
		msg_label.setDimensions(200, 0);
		msg_label.setString(const_val.MESSAGE_LIST[mid]);
		msg_label.setColor(cc.color(0, 0, 0));
		msg_label.setAnchorPoint(cc.p(0.5, 0.5));
        msg_label.setPosition(cc.p(125, 80));
        talk_img.addChild(msg_label);
        if(h1global.entityManager.player().server2CurSitNum(serverSitNum) == 2){
        	talk_img.setFlippedY(true);
            msg_label.setFlippedY(true);
        }
        msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function(){
        	talk_img.removeFromParent();
        })));
	},

	playVoiceAnim:function(serverSitNum, record_time){
		var self = this;
		if(cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.pauseMusic();
        }
        var interval_time = 0.8;
		this.talk_img_num += 1;
		// var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		var player_info_panel = undefined;
		if(serverSitNum < 0){
			player_info_panel = this.rootUINode.getChildByName("agent_info_panel");
		} else {
			player_info_panel = this.rootUINode.getChildByName("player_info_panel_" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		}
		var talk_img = ccui.ImageView.create();
		// talk_img.setScale(1.0);
		talk_img.setPosition(this.getMessagePos(player_info_panel));
		talk_img.loadTexture("res/ui/Default/voice_img.png");
		this.rootUINode.addChild(talk_img);
		// 加载表情图片
        // var voice_img = ccui.ImageView.create();
        // voice_img.setScale(1.0);
        // voice_img.setPosition(cc.p(134, 120));
        // voice_img.loadTexture("res/ui/GameRoomInfoUI/gameroominfo_record_btn.png");
        // talk_img.addChild(voice_img);
        var voice_img1 = ccui.ImageView.create();
        voice_img1.loadTexture("res/ui/Default/voice_img1.png");
        voice_img1.setPosition(cc.p(50, 37));
        talk_img.addChild(voice_img1);
        var voice_img2 = ccui.ImageView.create();
        voice_img2.loadTexture("res/ui/Default/voice_img2.png");
        voice_img2.setPosition(cc.p(60, 37));
        voice_img2.setVisible(false);
        talk_img.addChild(voice_img2);
        voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img2.setVisible(true)}), cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img2.setVisible(false)}))));
        var voice_img3 = ccui.ImageView.create();
        voice_img3.loadTexture("res/ui/Default/voice_img3.png");
        voice_img3.setPosition(cc.p(70, 37));
        voice_img3.setVisible(false);
        talk_img.addChild(voice_img3);
        voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img3.setVisible(true)}), cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img3.setVisible(false)}))));
        talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function(){
        	talk_img.removeFromParent();
        	self.talk_img_num -= 1;
        	if(self.talk_img_num == 0){
        		if(!cc.audioEngine.isMusicPlaying()){
		            cc.audioEngine.resumeMusic();
		        }
        	}
        })));
        // return talk_img;
	},

	show_yellow_frame: function(waitidx){
		var self = this;
		cc.log("show_yellow_frame  is  running , waitIdx :" +h1global.entityManager.player().server2CurSitNum(waitidx));
		for(var i = 0 ;i< 4;i++){
			var player_info_panel = self.rootUINode.getChildByName("player_info_panel_" +i);
			var yellow_frame_img = player_info_panel.getChildByName("yellow_frame_img");
			if(i == h1global.entityManager.player().server2CurSitNum(waitidx)){
				yellow_frame_img.setVisible(true);
			}else{
				yellow_frame_img.setVisible(false);
			}
		}	
	},

	show_palyer_line : function(lineNum){
		cc.log("show_palyer_line is running");	
		if(lineNum == -1){
			return;
		}
		var desc_img = this.rootUINode.getChildByName("desc_img");
		desc_img.loadTexture("res/ui/GameRoomUI/line_" + lineNum + ".png");
		desc_img.ignoreContentAdaptWithSize(true);
		desc_img.setVisible(true);
		desc_img.runAction(cc.Sequence.create(cc.fadeIn(1), cc.DelayTime.create(1), cc.fadeOut(1)));
	},

	playLeftsCardsEffect : function(sex, leftsCardsNum, playCardsNum){
		cc.log("playLeftsCardsEffect", sex,leftsCardsNum, playCardsNum);
		if (leftsCardsNum <= 10 && leftsCardsNum > 0 && leftsCardsNum + playCardsNum > 10) {
			var soundIdx = cutil.randomContainBorder(0,1)
			this.runAction(cc.Sequence.create(cc.DelayTime.create(1.2), cc.CallFunc.create(function(){
				if (sex == 1) {
					cc.log("res/sound/voice/ThrowCards/Male/baopai_" + String(soundIdx) + "_" + leftsCardsNum.toString() +".mp3")
					cc.audioEngine.playEffect("res/sound/voice/ThrowCards/Male/baopai_" + String(soundIdx) + "_" + leftsCardsNum.toString() +".mp3")
				} else {
					cc.log("res/sound/voice/ThrowCards/Female/baopai_" + String(soundIdx) + "_" + leftsCardsNum.toString() +".mp3")
					cc.audioEngine.playEffect("res/sound/voice/ThrowCards/Female/baopai_" + String(soundIdx) + "_" + leftsCardsNum.toString() +".mp3")
				}
			})))
		}
	},

	playCardsEffect : function(sex, cards, cardsType){
		cc.log(cards)
		cc.log("agent")
		cc.log(h1global.entityManager.player().curGameRoom.agentInfo)
		var shiftCards = cutil.rightShiftCards(cards)
		var cardNum = shiftCards[0]
		if(sex == 1){
			if (cardsType == 2) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/" + cardNum.toString() + ".mp3");
			} else if (cardsType == 3) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/dui" + cardNum.toString() + ".mp3");
			} else if (cardsType == 4) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/liandui.mp3");
			} else if (cardsType == 5) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/san" + cardNum.toString() + ".mp3");
			} else if (cardsType == 6) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/feiji" + String(shiftCards.length/3) + ".mp3");
			} else if (cardsType == 7) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/shunzi.mp3");
			} else if (cardsType == 8) {
				if (cards.length <= 5) {
					cc.audioEngine.playEffect("res/sound/voice/CardType/Male/boom_"+ String(cards.length) + "_" + String(cardNum) +".mp3");
				} else{
					cc.audioEngine.playEffect("res/sound/voice/CardType/Male/boom_"+ String(cards.length) + ".mp3");
				}
			} else if (cardsType == 9) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/wangzha.mp3");
			} else if (cardsType == 10) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/tianwangzha.mp3");
			} else if (cardsType == 11){
				var card2NumDict = cutil.getCard2NumDict(shiftCards);
				var len = Object.keys(card2NumDict).length;
				var line = len + cards.length/len;
				cc.audioEngine.playEffect("res/sound/voice/CardType/Male/boom_" + String(line) +".mp3");
			}
			
		} else {
			if (cardsType == 2) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/" + cardNum.toString() + ".mp3");
			} else if (cardsType == 3) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/dui" + cardNum.toString() + ".mp3");
			} else if (cardsType == 4) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/liandui.mp3");
			} else if (cardsType == 5) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/san" + cardNum.toString() + ".mp3");
			} else if (cardsType == 6) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/feiji" + String(shiftCards.length/3) + ".mp3");
			} else if (cardsType == 7) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/shunzi.mp3");
			} else if (cardsType == 8) {
				if (cards.length <= 5) {
					cc.audioEngine.playEffect("res/sound/voice/CardType/Female/boom_"+ String(cards.length) + "_" + String(cardNum) +".mp3");
				}else{
					cc.audioEngine.playEffect("res/sound/voice/CardType/Female/boom_"+ String(cards.length) + ".mp3");
				}
			} else if (cardsType == 9) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/wangzha.mp3");
			} else if (cardsType == 10) {
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/tianwangzha.mp3");
			} else if (cardsType == 11) {
				var card2NumDict = cutil.getCard2NumDict(shiftCards);
				var len = Object.keys(card2NumDict).length;
				var line = len + cards.length/len;
				cc.audioEngine.playEffect("res/sound/voice/CardType/Female/boom_" + String(line) +".mp3");
			}
		}
	},

	play_key_card_anim:function(){
		if (!this.is_show) {return}
		var player = h1global.entityManager.player();
		var key_panel = this.rootUINode.getChildByName("key_panel");
		var key_card_img = key_panel.getChildByName("key_card_img");
		if (player.curGameRoom.keyCard <= 0) {
			key_panel.setVisible(false)
			return
		}
		key_panel.setVisible(true)
		key_card_img.ignoreContentAdaptWithSize(true);
		key_card_img.loadTexture("Card/" + player.curGameRoom.keyCard.toString() + ".png", ccui.Widget.PLIST_TEXTURE)
		key_panel.runAction(cc.Sequence.create(cc.DelayTime.create(3.9), cc.CallFunc.create(function(){key_panel.setVisible(false);})));
	},

	startBeginAnim:function(){
		var player = h1global.entityManager.player();
		var hand_card_panel = this.rootUINode.getChildByName("hand_card_panel");
		var opration_panel = this.rootUINode.getChildByName("opration_panel");
		if (player.curGameRoom.waitIdx == player.serverSeatNum) {
			opration_panel.setVisible(false)
		}
		this.play_key_card_anim();
		for (var k = 0; k < 27; k++) {
			let i = k;
			let card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(i));
			card.setVisible(false)
			card.setTouchEnabled(false)
			card.runAction(cc.Sequence.create(
				cc.DelayTime.create(0.15*i),
				cc.CallFunc.create(function(){
					card.setVisible(true)
					if (i == 26) {
						for (let j = 0; j < 27; j++){
							let card = ccui.helper.seekWidgetByName(hand_card_panel, "card_" + String(j));
							card.setTouchEnabled(true)
						}
						if (player.curGameRoom.waitIdx == player.serverSeatNum) {
							opration_panel.setVisible(true)
						}
					}
				})
			))
		}
		player.isPlayingStartAnimation = 0;
	},

	show_left_cards:function(leftCards){
		var player = h1global.entityManager.player();
		for (var i = 0; i < 4; i++) {
			this.update_discard_card_panel(i, []);
		}
		for (var i = 0; i < leftCards.length; i++) {
			if (i == player.serverSeatNum) {continue;}
			var deskSeat = player.server2CurSitNum(i);
			if (deskSeat == 2) {
				this.update_cooperation_hand_card_panel(leftCards[i]);
			}else{
				this.update_discard_card_panel(deskSeat, leftCards[i]);
			}
		}
	},
});