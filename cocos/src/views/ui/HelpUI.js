var HelpUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/HelpUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
    },

    initUI: function () {
        var self = this;
        var help_panel = this.rootUINode.getChildByName("help_panel");
        var close_btn = help_panel.getChildByName("close_btn");


        close_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });

 
    }
});