// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var SettlementUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/SettlementUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
	},
	initUI:function(){
		this.player_panels = [];
		this.player_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel0"));
		this.player_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel1"));
		this.player_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel2"));
		this.player_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel3"));
		var player = h1global.entityManager.player();
		var self = this;
		var confirm_btn = this.rootUINode.getChildByName("confirm_btn");
		function confirm_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				// TEST:
				// self.hide();
				// h1global.curUIMgr.gameroomprepare_ui.show();
				// h1global.curUIMgr.gameroom_ui.hide();
				// return;
				self.hide();
				// h1global.curUIMgr.gameroom_ui.hide();
				player.curGameRoom.updatePlayerState(player.serverSeatNum, 1);
				// player.curGameRoom.curRound = player.curGameRoom.curRound + 1;
				h1global.curUIMgr.gameroomprepare_ui.show();
				h1global.curUIMgr.gameroom_ui.hide();
				player.roundEndCallback();
			}
		}
		confirm_btn.addTouchEventListener(confirm_btn_event);
		this.kongTilesList = [[], [], [], []];

		var settlement_panel = this.rootUINode.getChildByName("settlement_panel");
		var settlement_bg_panel = this.rootUINode.getChildByName("settlement_bg_panel");
		var show_btn = this.rootUINode.getChildByName("show_btn");
		var hide_btn = this.rootUINode.getChildByName("hide_btn");
		show_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				show_btn.setVisible(false);
				hide_btn.setVisible(true);
				settlement_panel.setVisible(true);
				settlement_bg_panel.setVisible(true);
			}
		});
		show_btn.setVisible(false);
		hide_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				show_btn.setVisible(true);
				hide_btn.setVisible(false);
				settlement_panel.setVisible(false);
				settlement_bg_panel.setVisible(false);
			}
		});
	},
	
	show_by_info:function(roundRoomInfo, confirm_btn_func){
		cc.log("结算==========>:")
		cc.log("roundRoomInfo",roundRoomInfo)
		var self = this;
		this.show(function(){
			var playerInfoList = roundRoomInfo["player_info_list"];
			for(var i = 0; i < playerInfoList.length; i++){
				var roundPlayerInfo = playerInfoList[i];
				self.update_player_info(roundPlayerInfo["idx"]);
	
				self.update_score(roundPlayerInfo["idx"], roundPlayerInfo["score"]);
			}

			self.update_player_cal(roundRoomInfo["cal_score_list"])
			self.update_win_max_line(roundRoomInfo["cal_score_list"])

			self.show_title(roundRoomInfo["winType"])
			
			if(confirm_btn_func){
				self.rootUINode.getChildByName("confirm_btn").addTouchEventListener(function(sender, eventType){
					if(eventType ==ccui.Widget.TOUCH_ENDED){
						self.hide();
						confirm_btn_func();
					}
				});
			}
		});
	},

	show_title:function(winType){
		var serverSeatNum = h1global.entityManager.player().serverSeatNum
		var title_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("title_img");
		title_img.ignoreContentAdaptWithSize(true)
		title_img.loadTexture("res/ui/SettlementUI/win_"+ winType.toString() +".png")
	},

	update_player_info:function(serverSeatNum){
		if(!this.is_show) {return;}
		var player = h1global.entityManager.player();
		var cur_player_info_panel = this.player_panels[serverSeatNum];
		if(!cur_player_info_panel){
			return;
		}
		var playerInfo = player.curGameRoom.playerInfoList[serverSeatNum];
		cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
		var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
		cur_player_info_panel.reorderChild(frame_img, 1);
		cutil.loadPortraitTexture(playerInfo["head_icon"], function(img){
			cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
			var portrait_sprite  = new cc.Sprite(img);
			portrait_sprite.setName("portrait_sprite");
			portrait_sprite.setScale(86/portrait_sprite.getContentSize().width);
			portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.5;
			portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.5;
			cur_player_info_panel.addChild(portrait_sprite);
			portrait_sprite.setLocalZOrder(-1);
			frame_img.setLocalZOrder(0);
		}, playerInfo["uuid"].toString() + ".png");

		var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img")
		if (player.curGameRoom.playerInfoList["userId"] == player.curGameRoom.ownerId) {
			owner_img.setVisible(true)
		} else {
			owner_img.setVisible(false)
		}
	},

	update_player_cal:function(cal_score_list){
		if(!this.is_show) {return;}
		for (var i = 0; i < cal_score_list.length; i++) {
			var info = cal_score_list[i];
			var base_label = this.player_panels[i].getChildByName("base_label");
			var contribute_label = this.player_panels[i].getChildByName("contribute_label");
			var gap_label = this.player_panels[i].getChildByName("gap_label");

			if (info[1] > 4) {
				// base_label.setString(String(info[0]) + " X 2^(" + String(info[1]) + "-4) = " + String(info[0] * Math.pow(2, info[1]-4)))
				base_label.setString(String(info[0]) + " X " + String(Math.pow(2, info[1]-4)) + " = " + String(info[0] * Math.pow(2, info[1]-4)))
			}else{
				base_label.setString(String(info[0]) + " X 1 = " + String(info[0] * Math.pow(2, 0)))
			}

			contribute_label.setString(info[2])
			gap_label.setString(info[3])
		}
	},

	update_win_max_line:function(cal_score_list){
		var max_line_label = this.rootUINode.getChildByName("settlement_panel").getChildByName("max_line_label")
		max_line_label.ignoreContentAdaptWithSize(true)
		if (cal_score_list[0]) {
			max_line_label.setString("赢方最大线数：" + String(cal_score_list[0][1]))
		}
	},

	update_score:function(serverSeatNum, score){
		var score_label = this.player_panels[serverSeatNum].getChildByName("score_label");
		if(score >= 0){
			score_label.setTextColor(cc.color(62, 121, 77));
			score_label.setString("+" + score.toString());
		} else {
			score_label.setTextColor(cc.color(144, 71, 64));
			score_label.setString(score.toString());
		}
	},
});