"use strict";

var const_val = function(){}

const_val.Action_Enter = 0 // 进入游戏


// 为了便于UI管理，globalUIMgr的ZOrder一定要大于curUIMgrZOrder
const_val.globalUIMgrZOrder = 90000
const_val.curUIMgrZOrder = 10000

const_val.MAX_LAYER_NUM = 99999999



const_val.MISSION_OPERATION = 1
const_val.GM_OPERATION = 4
const_val.SUMMON_OPERATION = 6

// 排行榜更新时间
const_val.RANK_DELTA_TIME = 15 * 60 // 15min
const_val.QUERY_PALYER_INFO_TIME = 15 * 60 // 15min

// const_val strings
const_val.sDefaultPortraitPath = "res/ui/GUI/image.png"
const_val.sClientDatas = "kbengine_js_demo"
const_val.sHasCreateQuickLoginAccount = "ccud_bHasCreateQuickLoginAccount"
const_val.sUseUploadedPortraitPrefix = "ccud_bUseUploadedPortrait_"
const_val.sAvatarPrefix = "res/avatars/avatar_"


const_val.nAvatarNum = 15

const_val.GameDelayTime = 10.0

const_val.TrusteeShipTurnNum = 2

const_val.OP_PASS             = 0 // 过
const_val.OP_DISCARD          = 1 // 出牌


//黑红梅方
// const_val.HEI  = [15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 67] // 3-13 14 16
// const_val.HONG = [14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 66] // 3-13 14 16
// const_val.MEI  = [13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 65] // 3-13 14 16
// const_val.FANG = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64] // 3-13 14 16

// const_val.JOKER = [72, 76]


const_val.HEI  		= [28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 132] // 3-13 14 16
const_val.HONG 		= [27, 35, 43, 51, 59, 67, 75, 83, 91, 99, 107, 115, 131] // 3-13 14 16
const_val.MEI  		= [26, 34, 42, 50, 58, 66, 74, 82, 90, 98, 106, 114, 130] // 3-13 14 16
const_val.FANG 		= [25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 129] // 3-13 14 16

const_val.INSTEAD 	= [24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 128]
const_val.JOKER 	= [145, 153] // 18 19
const_val.SHADOW_JOKER = [144, 152]

const_val.CARD2 = 16
const_val.CIRCLE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16]

// const_val.MESSAGE_LIST = [
// 	"唉，一手烂牌臭到底",
// 	"不怕神一样的对手，就怕猪一样的队友",
// 	"和你合作真是太愉快啦",
// 	"投降输一半，速度投降吧",
// 	"快点吧，我等的花儿都谢了",
// 	"你的牌打得也太好了",
// 	"大清早的，鸡都还没叫，慌什么嘛",
// 	"吐了个槽的，整个一个杯具啊",
// 	"不要吵了，有什么好吵的，专心玩牌吧"
// ]

const_val.ROOM_MODE = ["普通双扣", "百变双扣"]
const_val.INSERT_CARD = ["3/5张", "2/6张", "8张"]
const_val.DEAL_MODE = ["3/6张", "6/7张", "9张"]
const_val.SCORE_MODE = ["多贡", "单贡"]
const_val.CHANGE_SEAT = ["不换搭档", "换搭档"]

const_val.MESSAGE_LIST = [
	"被扔砖头了",
	"被炸残了",
	"不好炸",
	"动作快点",
	"没吃不倒霉",
	"破牌",
	"全大",
	"全散",
	"三拖一",
	"神仙都打不住我",
	"双拖双",
	"痛苦",
	"我帮你瞄着",
	"要什么牌",
	"炸弹不炸带回家？",
	"啊呀，打错了",
	"就一副炸弹",
	"决战到天亮",
	"让他打吧",
]

const_val.SIGNIN_MAX = 10

const_val.GAME_RECORD_MAX = 10

const_val.DISMISS_ROOM_WAIT_TIME = 100 // 申请解散房间后等待的时间, 单位为秒

const_val.TYPE_NO_CARD = 0
const_val.TYPE_INVALID = 1
const_val.TYPE_SINGLE = 2
const_val.TYPE_PAIR = 3
const_val.TYPE_SERIAL_PAIR = 4
const_val.TYPE_TRIPLE = 5
const_val.TYPE_SERIAL_TRIPLE = 6
const_val.TYPE_SERIAL_SINGLE = 7
const_val.TYPE_BOMB = 8
const_val.TYPE_3JOKER = 9
const_val.TYPE_4JOKER = 10
const_val.TYPE_SERIAL_BOMB = 11