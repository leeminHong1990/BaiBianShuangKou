# -*- coding: utf-8 -*-

HTTP_SERVER_IP = 'qxjoy.cn'
HTTP_DEBUG_SERVER_IP = '112.124.111.15'

DB_NAME = "kbe_HongZhong"

SUBMISSION_NUM = 5

CONST_AVATAR_TYPE = 0
CONST_NORMALGAME_TYPE = 1
CONST_SPECGAME_TYPE = 2

CONST_SPACE_WIDTH = 256
CONST_SPACE_HEIGHT = 256

SERVER_REFRESH_TIME = [3,0,0]
ONEDAY_TIME = 24 * 60 * 60
TROOP_LIMIT = 4
CHARACTER_ID_LIST = [1400001, 1400002, 1400003]

# 服务端timer定义
TIMER_TYPE_AUTO_LOGIN 								= 0 # 等待玩家登录时创建Avatar
TIMER_TYPE_DESTROY									= 1 # 玩家操作计时器
TIMER_TYPE_REFRESH_TASK								= 2 # 刷新计时器
TIMER_TYPE_REFRESH_RANK								= 3 # 刷新排行榜计时器
TIMER_TYPE_RANK_REWARD								= 4 # 刷新排行榜计时器
TIMER_TYPE_BOARDCAST								= 5 # 在线玩家广播
TIMER_TYPE_ROOM_POLL                                = 6 # 房间基础轮询timer
TIMER_TYPE_OPERATION                                = 7 # 玩家操作倒计时
TIMER_TYPE_NEXT_GAME                                = 8 # 下一局游戏开始timer
TIMER_TYPE_DISMISS_WAIT                             = 9 # 解散房间后等待投票timer
TIMER_TYPE_BROADCAST                                = 10# 广播timer
TIMER_TYPE_START_GAME                               = 11# 进入房间第一局开始延迟timer
TIMER_TYPE_ROOM_EXIST                             	= 12# 房间存在倒计时
TIMER_TYPE_USER_DEFINE								= 1000 # 用户自定义

Latitude_Division = 1 # 维度在半球上的划分
Longitude_Division = 2 # 经度在半球上的划分

RankType_Wealth = 1 # 基于总体钱数排名
RankType_Charm = 2 # 基于总魅力值数排名
RankType_Week_MasterPoint = 3 # 基于周竞技分数排名
RankType_Week_Killing = 4 # 基于收人头数排名


##########################################

# 房间玩家数
ROOM_PLAYER_NUMBER = 4
# 初始手牌数目
INIT_CARD_NUMBER = 27
# 胡牌类型
WIN_TYPE_SELF_DRAW      = 1 # 自摸胡牌
WIN_TYPE_EXPOSE_KONG    = 2 # 抢杠胡牌

# 房间操作id #
OP_PASS             		= 0 # 过
OP_DISCARD					= 1 # 出牌

# 黑红梅方
# HEI  = [ 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 67] # 3 - 13 14 16
# HONG = [ 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 66] # 3 - 13 14 16
# MEI  = [ 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 65] # 3 - 13 14 16
# FANG = [ 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64] # 3 - 13 14 16

# JOKER = [72,76] # 18 19

HEI  	= [ 28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 132] # 3 - 13 14 16
HONG 	= [ 27, 35, 43, 51, 59, 67, 75, 83, 91, 99, 107, 115, 131] # 3 - 13 14 16
MEI  	= [ 26, 34, 42, 50, 58, 66, 74, 82, 90, 98, 106, 114, 130] # 3 - 13 14 16
FANG 	= [ 25, 33, 41, 49, 57, 65, 73, 81, 89, 97, 105, 113, 129] # 3 - 13 14 16
		 #[ 3,  4,  5,  6,  7,  8,  9,  10, J,  Q,   K,   A,   2]
INSTEAD = [ 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 128]
JOKER = [145,153] # 18 19
SHADOW_JOKER = [144,152]

CARD2 = 16
CIRCLE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16]

WIN_DRAW_BUCKLE = 0			#平扣
WIN_SINGLE_BUCKLE = 1		#单扣
WIN_DOUBLE_BUCKLE = 2		#双扣
WIN_SHOW_HAND = 3			#倒牌

PLAYER_OPERATION_WAIT_TIME = 12 # 玩家打出一张牌后, 其他玩家是否操作的等待时间
PLAYER_DISCARD_WAIT_TIME = 12 # 玩家摸一张牌后, 打牌的等待时间45
NEXT_GAME_WAIT_TIME = 90  # 一局结束后开始下一句游戏等待玩家准备的timer
START_GAME_WAIT_TIME = 1 # 玩家都进来了之后等待开局的timer
ROOM_EXIST_TIME = 3600 # 每一局房间的时间，时间结束房间不销毁

# 定义一些错误码
OP_ERROR_NOT_CURRENT    = 1 # 非当前控牌玩家
OP_ERROR_ILLEGAL        = 2 # 操作非法
OP_ERROR_TIMEOUT        = 3 # 操作超时
##########################################

# 牌局战绩保存上限
MAX_HISTORY_RESULT = 10

# 创建房间失败错误码
CREATE_FAILED_NO_ENOUGH_CARDS = -1 # 房卡不足
CREATE_FAILED_ALREADY_IN_ROOM = -2 # 已经在房间中
CREATE_FAILED_OTHER = -3

# 进入房间失败错误码
ENTER_FAILED_ROOM_NO_EXIST  = -1 # 房间不存在
ENTER_FAILED_ROOM_FULL      = -2 # 房间已经满员

###########################################
# 签到相关 #
SIGN_IN_ACHIEVEMENT_DAY = 10 # 签到几天得奖励
SIGN_IN_ACHIEVEMENT_NUM = 1  # 奖励几张房卡
###########################################

DISMISS_ROOM_WAIT_TIME = 100 # 申请解散房间后等待的时间, 单位为秒
