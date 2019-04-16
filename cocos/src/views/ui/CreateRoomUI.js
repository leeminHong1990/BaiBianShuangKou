// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var CreateRoomUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/CreateRoomUI.json";
	},

	initUI:function(){
		this.roomMode = 1 ;  //房间模式 1：百变双扣  0：普通双扣
		this.gameRound = 8 ; // 局数
		this.insertCard = 0;  //插牌  0:3/5张 1:2/6张 3:8张
		this.dealMode = 0 ;   //发牌  0:3/6张  1：6/7张  2：9/张
		this.scoreMode = 1 ; //计分模式  0：多贡 1：单贡  
		this.changeSeat = 1 ;  //换搭档  0:是  1：否
		this.bestPhase = 8;   //最高相数 
		this.defaultRound = 16; //默认scroll局数
		this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");	

		this.initCreateRoomPanel()
		this.initCreateRoom()
		// create_btn
	},

	initCreateRoomPanel:function(){
		cc.log( "创建房间开始了--------")
		var self = this;
		var return_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "return_btn");
		function return_btn_event(sender, eventType){
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				self.hide();
			}
		}
		return_btn.addTouchEventListener(return_btn_event);

		//模式
		var mode_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "mode_chx_1")
		var mode_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "mode_chx_2")
		this.mode_chx_list = [mode_chx_2, mode_chx_1]   //房间模式
		function mode_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.mode_chx_list.length; i++) {
					if (sender != self.mode_chx_list[i]) {
						self.mode_chx_list[i].setSelected(false);
						self.mode_chx_list[i].setEnabled(true);
					}else{
						self.roomMode = i;
						sender.setEnabled(false);
						cc.log(self.roomMode);
					}
				}
			}
		}
		cc.log(self.mode_chx_list);

		for (var i = 0; i < this.mode_chx_list.length; i++) {
			this.mode_chx_list[i].addTouchEventListener(mode_chx_event);
		}
		this.mode_chx_list[1].setEnabled(false);

		//局数
		var round_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_1")
		var round_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_2")
		var round_chx_3 = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_3")
		this.round_chx_list = [round_chx_1, round_chx_2, round_chx_3]   //局数
		function round_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.round_chx_list.length; i++) {
					if (sender != self.round_chx_list[i]) {
						self.round_chx_list[i].setSelected(false);
						self.round_chx_list[i].setEnabled(true);
					}else{
						
						if (i < 2) {
							self.gameRound = (i+2)*4;
						} else {
							self.gameRound = self.defaultRound;
						}
						sender.setEnabled(false);
						cc.log(self.gameRound);
					}
				}
			}
		}

		for (var i = 0; i < this.round_chx_list.length; i++) {
			this.round_chx_list[i].addTouchEventListener(round_chx_event);
		}
		this.round_chx_list[0].setEnabled(false);

		//局数scroll
		var default_round_label = ccui.helper.seekWidgetByName(this.createroom_panel, "default_round_label")
		default_round_label.ignoreContentAdaptWithSize(true)
		var scroll_panel = ccui.helper.seekWidgetByName(this.createroom_panel, "scroll_panel")
		var scroll_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "scroll_btn")
		function scroll_btn_event(sender, eventType){
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				scroll_panel.setVisible(!scroll_panel.isVisible())
			}
		}
		scroll_btn.addTouchEventListener(scroll_btn_event)
		var scrollList = [16, 20, 24, 4]
		function init_scroll_func(item, round, idx){
			var round_label = ccui.helper.seekWidgetByName(item, "round_label")
			round_label.ignoreContentAdaptWithSize(true);
			item.round = round
			round_label.setString(round)
			function touch_event(sender, eventType){
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.gameRound == self.defaultRound) {
						self.gameRound = sender.round
					}
					self.defaultRound = sender.round
					default_round_label.setString(self.defaultRound.toString()+"局")
					scroll_panel.setVisible(false)
				}
			}
			item.addTouchEventListener(touch_event)
		}
		UICommonWidget.update_scroll_items(scroll_panel, scrollList, init_scroll_func)

		//插牌
		var shuffle_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "shuffle_chx_1")
		var shuffle_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "shuffle_chx_2")
		var shuffle_chx_3 = ccui.helper.seekWidgetByName(this.createroom_panel, "shuffle_chx_3")
		this.shuffle_chx_list = [shuffle_chx_1, shuffle_chx_2, shuffle_chx_3]  //插牌
		function shuffle_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.shuffle_chx_list.length; i++) {
					if (sender != self.shuffle_chx_list[i]) {
						self.shuffle_chx_list[i].setSelected(false)
						self.shuffle_chx_list[i].setEnabled(true)
					}else{
						self.insertCard = i
						sender.setEnabled(false)
						cc.log(self.insertCard)
					}
				}
			}
		}

		for (var i = 0; i < this.shuffle_chx_list.length; i++) {
			var shuffle_chx = this.shuffle_chx_list[i]
			shuffle_chx.addTouchEventListener(shuffle_chx_event)
		}
		this.shuffle_chx_list[0].setEnabled(false)

		//发牌		
		var deal_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "deal_chx_1")
		var deal_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "deal_chx_2")
		var deal_chx_3 = ccui.helper.seekWidgetByName(this.createroom_panel, "deal_chx_3")
		this.deal_chx_list = [deal_chx_1, deal_chx_2, deal_chx_3]  //发牌
		function deal_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.deal_chx_list.length; i++) {
					if (sender != self.deal_chx_list[i]) {
						self.deal_chx_list[i].setSelected(false)
						self.deal_chx_list[i].setEnabled(true)
					}else{
						self.dealMode = i
						sender.setEnabled(false)
						cc.log(self.dealMode)
					}
				}
			}
		}

		for (var i = 0; i < this.deal_chx_list.length; i++) {
			var deal_chx = this.deal_chx_list[i]
			deal_chx.addTouchEventListener(deal_chx_event)
		}
		this.deal_chx_list[0].setEnabled(false)


		//计分模式
		var bomb_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_chx_1")
		var bomb_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_chx_2")
		this.bomb_chx_list = [bomb_chx_1, bomb_chx_2]   //计分模式
		function bomb_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.bomb_chx_list.length; i++) {
					if (sender != self.bomb_chx_list[i]) {
						self.bomb_chx_list[i].setSelected(false)
						self.bomb_chx_list[i].setEnabled(true)
					}else{					
						if(i===0){
							self.scoreMode = 1
						}else{
							self.scoreMode = 0
						}										
						sender.setEnabled(false)
						cc.log(self.scoreMode)
					}
				}
			}
		}

		for (var i = 0; i < this.bomb_chx_list.length; i++) {
			var bomb_chx = this.bomb_chx_list[i];
			bomb_chx.addTouchEventListener(bomb_chx_event);
		}
		this.bomb_chx_list[0].setEnabled(false);

		//换搭档		
		var change_copration_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "change_copration_chx_2")
		var change_copration_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "change_copration_chx_1")
		this.change_copration_chx_list = [change_copration_chx_1, change_copration_chx_2]  //换搭档
		function change_copration_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.change_copration_chx_list.length; i++) {
					if (sender != self.change_copration_chx_list[i]) {
						self.change_copration_chx_list[i].setSelected(false);
						self.change_copration_chx_list[i].setEnabled(true);
					}else{
						if (i == 0) {
							self.changeSeat = 1;
						}else{
							self.changeSeat = 0;
						}
						sender.setEnabled(false);
						cc.log(self.changeSeat);
					}
				}
			}
		}

		for (var i = 0; i < this.change_copration_chx_list.length; i++) {
			var change_copration_chx = this.change_copration_chx_list[i];
			change_copration_chx.addTouchEventListener(change_copration_chx_event);
		}
		this.change_copration_chx_list[0].setEnabled(false);

		//最高相数
		var bomb_line_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_line_chx_1")
		var bomb_line_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_line_chx_2")
		var bomb_line_chx_3 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_line_chx_3")
		var bomb_line_chx_4 = ccui.helper.seekWidgetByName(this.createroom_panel, "bomb_line_chx_4")
		this.bomb_line_chx_list = [bomb_line_chx_1, bomb_line_chx_2, bomb_line_chx_3, bomb_line_chx_4]  //最高相数
		function bomb_line_chx_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.bomb_line_chx_list.length; i++) {
					if (sender != self.bomb_line_chx_list[i]) {
						self.bomb_line_chx_list[i].setSelected(false);
						self.bomb_line_chx_list[i].setEnabled(true);
					}else{
						self.bestPhase = (i + 8);
						sender.setEnabled(false);
						cc.log(self.changeSeat);
					}
				}
			}
		}

		for (var i = 0; i < this.bomb_line_chx_list.length; i++) {
			var bomb_line_chx = this.bomb_line_chx_list[i]
			bomb_line_chx.addTouchEventListener(bomb_line_chx_event)
		}
		this.bomb_line_chx_list[0].setEnabled(false)

	},

	initCreateRoom:function(){
		var self = this
		var create_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "create_btn")
		function create_btn_event(sender, eventType){
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				cutil.lock_ui();
				// this.roomMode = 0 ;  //房间模式 0：普通双扣  1：百变双扣
				// this.gameRound = 4 ; // 局数
				// this.insertCard = 1;  //插牌  0:3/5张 1:2/6张 3:8张
				// this.dealMode = 0 ;   //发牌  0:3/6张  1：6/7张  2：9/张
				// this.scoreMode = 0 ; //计分模式  1：单贡  0：多贡
				// this.changeSeat = 1 ;  //换搭档  0:是  1：否
				// this.bestPhase = 8;   //最高相数 
				cc.log("房间模式 : "+ self.roomMode +" 局数: "+ self.gameRound +"  插牌 :"+ self.insertCard +" 发牌: "+ self.dealMode + 
					" 换搭档: "+ self.changeSeat +"  计分模式:"+ self.scoreMode +"  最高相数: "+self.bestPhase);
				h1global.entityManager.player().createRoom(self.roomMode, self.gameRound, self.insertCard, self.dealMode, self.scoreMode, self.changeSeat, self.bestPhase, 0);
				self.hide()
			}
		}
		create_btn.addTouchEventListener(create_btn_event)
	}
});