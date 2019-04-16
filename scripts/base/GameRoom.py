# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import time
from datetime import datetime
from interfaces.GameObject import GameObject
from entitymembers.iRoomRules import iRoomRules
from entitymembers.PlayerProxy import PlayerProxy
import const
import random
import math
import switch
import utility

class GameRoom(KBEngine.Base, GameObject, iRoomRules):
	"""
	这是一个游戏房间/桌子类
	该类处理维护一个房间中的实际游戏， 例如：斗地主、麻将等
	该房间中记录了房间里所有玩家的mailbox，通过mailbox我们可以将信息推送到他们的客户端。
	"""
	def __init__(self):
		GameObject.__init__(self)
		iRoomRules.__init__(self)

		self.owner_uid = 0
		self.agent = None
		self.roomID = None

		# 状态0：未开始游戏， 1：某一局游戏中
		self.state = 0

		# 存放该房间内的玩家mailbox
		self.players_dict = {}
		self.players_list = [None] * const.ROOM_PLAYER_NUMBER
		self.origin_players_list = [None] * const.ROOM_PLAYER_NUMBER
		# 控牌玩家
		self.controller_idx = -1
		# 控牌玩家出的牌
		self.controller_discard_list = []
		# 等待出牌玩家
		self.wait_idx = -1
		# 桌牌
		self.deskPokerList = [[] for i in range(const.ROOM_PLAYER_NUMBER)]
		#玩家出完牌的顺序
		self.show_empty_list = []
		# 当前局数
		self.current_round = 0
		# 翻牌
		self.key_card = 0
		# 交换顺序
		self.swap_list = [i for i in range(const.ROOM_PLAYER_NUMBER)]
		# 房间开局所有操作的记录(idx, op, cards, insteadCards)
		self.op_record = []
		# 房间基础轮询timer
		self._poll_timer = None
		# 玩家操作限时timer
		self._op_timer = None
		# 一局游戏结束后, 玩家准备界面等待玩家确认timer
		self._next_game_timer = None
		# 确认继续的玩家
		self.confirm_next_idx = []
		# 解散房间操作的发起者
		self.dismiss_room_from = -1
		# 解散房间操作开始的时间戳
		self.dismiss_room_ts = 0
		# 解散房间操作投票状态
		self.dismiss_room_state_list = [0, 0, 0, 0]
		self.dismiss_timer = None

		self.roomOpenTime = time.time()

	@property
	def isFull(self):
		count = sum([1 for i in self.players_list if i is not None])
		return count == const.ROOM_PLAYER_NUMBER

	@property
	def isEmpty(self):
		count = sum([1 for i in self.players_list if i is not None])
		return count == 0 and self.agent is None

	def getNextWaitIdx(self, cur_wait_idx):
		next_wait_idx = cur_wait_idx
		for i in range(1, const.ROOM_PLAYER_NUMBER + 1):
			next_wait_idx = (next_wait_idx + 1)%const.ROOM_PLAYER_NUMBER
			if self.controller_idx == next_wait_idx and len(self.players_list[self.controller_idx].cards) <= 0:
				return (next_wait_idx + 2)%4, True
			if len(self.players_list[next_wait_idx].cards) > 0:
				return next_wait_idx, False
		return next_wait_idx, False

	def getSit(self):
		for i, j in enumerate(self.players_list):
			if j is None:
				return i

	def _reset(self):
		self.state = 0
		self.agent = None
		self.players_list = [None] * const.ROOM_PLAYER_NUMBER
		self.controller_idx = -1
		self.wait_idx = -1
		self.swap_list = [i for i in range(const.ROOM_PLAYER_NUMBER)]
		self.controller_discard_list = []
		self.deskPokerList = [[] for i in range(const.ROOM_PLAYER_NUMBER)]
		self._poll_timer = None
		self._op_timer = None
		self._next_game_timer = None
		self.current_round = 0
		self.confirm_next_idx = []
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0, 0, 0, 0]
		self.key_card = 0
		KBEngine.globalData["GameWorld"].delRoom(self)

	def onTimer(self, id, userArg):
		DEBUG_MSG("Room.onTimer called: id %i, userArg: %i" % (id, userArg))

		if userArg == const.TIMER_TYPE_DISMISS_WAIT:
			self.delTimer(id)
			self.dropRoom()
		# if userArg == const.TIMER_TYPE_ROOM_EXIST:
		# 	self.game_round = self.current_round
		# 	self.delTimer(id)


	def reqEnterRoom(self, avt_mb, first=False):
		"""
		defined.
		客户端调用该接口请求进入房间/桌子
		"""
		if self.isFull:
			avt_mb.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
			return

		# 代开房
		if first and self.is_agent == 1:
			self.agent = PlayerProxy(avt_mb, self, -1)
			self.players_dict[avt_mb.userId] = self.agent
			avt_mb.enterRoomSucceed(self, -1)
			return

		for i, p in enumerate(self.players_list):
			if p and p.mb and p.mb.userId == avt_mb.userId:
				p.mb = avt_mb
				avt_mb.enterRoomSucceed(self, i)
				return

		DEBUG_MSG("Room.reqEnterRoom: %s" % (self.roomID))
		idx = self.getSit()
		n_player = PlayerProxy(avt_mb, self, idx)
		self.players_dict[avt_mb.userId] = n_player
		self.players_list[idx] = n_player
		# 确认准备
		# if idx not in self.confirm_next_idx:
		# 	self.confirm_next_idx.append(idx)

		if not first:
			self.broadcastEnterRoom(idx)
			self.check_same_ip()

		if self.isFull:
			self.origin_players_list = self.players_list[:]
		# if self.isFull:
		# 	if self.is_agent == 1 and self.agent and self.agent.mb:
		# 		try:
		# 			self.agent.mb.quitRoomSucceed()
		# 			leave_tips = "您代开的房间已经开始游戏, 您已被请离.\n房间号【{}】".format(self.roomID)
		# 			self.agent.mb.showTip(leave_tips)
		# 		except:
		# 			pass
		# 	self.startGame()
			# self.addTimer(const.START_GAME_WAIT_TIME, 0, const.TIMER_TYPE_START_GAME)

	def reqReconnect(self, avt_mb):
		DEBUG_MSG("GameRoom reqReconnect userid = {}".format(avt_mb.userId))
		if avt_mb.userId not in self.players_dict.keys():
			return

		DEBUG_MSG("GameRoom reqReconnect player is in room".format(avt_mb.userId))
		# 如果进来房间后牌局已经开始, 就要传所有信息
		# 如果还没开始, 跟加入房间没有区别
		player = self.players_dict[avt_mb.userId]
		if self.agent and player.userId == self.agent.userId:
			self.agent.mb = avt_mb
			self.agent.online = 1
			avt_mb.enterRoomSucceed(self, -1)
			return
		
		player.mb = avt_mb
		player.online = 1
		if self.state == 1 or 0 < self.current_round <= self.game_round:
			if self.state == 0:
				# 重连回来直接准备
				self.roundEndCallback(avt_mb)
			rec_room_info = self.get_reconnect_room_dict(player.mb.userId)
			player.mb.handle_reconnect(rec_room_info)
		else:
			sit = 0
			for idx, p in enumerate(self.players_list):
				if p and p.mb:
					if p.mb.userId == avt_mb.userId:
						sit = idx
						break
			avt_mb.enterRoomSucceed(self, sit)

		# self.check_same_ip()

	def reqLeaveRoom(self, player):
		"""
		defined.
		客户端调用该接口请求离开房间/桌子
		"""
		DEBUG_MSG("Room.reqLeaveRoom:{0}, is_agent={1}".format(self.roomID, self.is_agent))
		if player.userId in self.players_dict.keys():
			n_player = self.players_dict[player.userId]
			idx = n_player.idx


			if idx == -1 and self.is_agent == 1:
				self.dropRoom()
			elif idx == 0 and self.is_agent == 0:
				# 房主离开房间, 则解散房间
				self.dropRoom()
			else:
				n_player.mb.quitRoomSucceed([p.get_final_client_dict() for p in self.players_list if p is not None])
				self.players_list[idx] = None
				del self.players_dict[player.userId]
				if idx in self.confirm_next_idx:
					self.confirm_next_idx.remove(idx)
				# 通知其它玩家该玩家退出房间
				for i, p in enumerate(self.players_list):
					if i != idx and p and p.mb:
						p.mb.othersQuitRoom(idx)
				if self.agent and self.agent.mb:
					self.agent.mb.othersQuitRoom(idx)

		if self.isEmpty:
			self._reset()

	def dropRoom(self):
		for p in self.players_list:
			if p and p.mb:
				try:
					p.mb.quitRoomSucceed([p.get_final_client_dict() for p in self.players_list if p is not None])
				except:
					pass

		if self.agent and self.agent.mb:
			try:
				self.agent.mb.quitRoomSucceed([p.get_final_client_dict() for p in self.players_list if p is not None])
			except:
				pass

		self._reset()

	def startGame(self):
		""" 开始游戏 """
		self.op_record = []
		self.controller_discard_list = []
		self.deskPokerList = [[] for i in range(const.ROOM_PLAYER_NUMBER)]
		self.state = 1
		self.current_round += 1
		self.key_card = 0

		#扣费后开始游戏的回调
		def callback(content):
			content = content.decode()
			# try:
			if content[0] != '{':
				DEBUG_MSG(content)
				self.dropRoom()
				return
			for p in self.players_list:
				p.reset()
			self.initCards()
			self.deal()
			if self.changeSeat:
				if True or self.current_round == 1 or len(self.show_empty_list) == 2:
					# 根据需求每次重新换座位
					self.random_key_card()
					first_key_idx, second_key_idx = self.getKeyCardSeat()
					self.swap_list = self.swapSeat(first_key_idx, second_key_idx)
					self.controller_idx = self.swap_list.index(first_key_idx)
					self.wait_idx = self.controller_idx
				else:
					self.key_card = 0
					self.controller_idx = self.show_empty_list[0]
					self.wait_idx = self.controller_idx
			else:
				if len(self.show_empty_list) > 0:
					self.controller_idx = self.show_empty_list[0]
					self.wait_idx = self.controller_idx
				else:
					self.controller_idx = 0
					self.wait_idx = self.controller_idx
			self.show_empty_list = []

			#DEBUG_MSG
			for i, p in enumerate(self.players_list):
				DEBUG_MSG("player [{0}] cards: {1}".format(p.idx, p.cards))
			for p in self.players_list:
				if p and p.mb:
					p.start()
					p.mb.startGame(self.controller_idx, self.key_card, p.cards, self.swap_list)
			# except:
			# 	DEBUG_MSG("consume failed!")

		if self.current_round == 1 and self.is_agent == 0:
			# 仅仅在第1局扣房卡, 不然每局都会扣房卡
			card_cost, diamond_cost = switch.calc_cost(self.game_round, self.room_mode)
			if switch.DEBUG_BASE:
				callback('{"card":99, "diamond":999}'.encode())
			else:
				utility.update_card_diamond(self.players_list[0].mb.accountName, -card_cost, -diamond_cost, callback, "BaiBianShuangKou RoomID:{}".format(self.roomID))
			return

		DEBUG_MSG("start Game: Room{0} - Round{1}".format(self.roomID, str(self.current_round)+'/'+str(self.game_round)))

		callback('{"card":99, "diamond":999}'.encode())

	def swapSeat(self, first_key_idx, second_key_idx):
		swap_seat_list = [i for i in range(len(self.players_list))]
		
		if first_key_idx == second_key_idx or abs(first_key_idx - second_key_idx) == 2 :
			return swap_seat_list
		tmpList = self.players_list
		self.players_list = [None] * const.ROOM_PLAYER_NUMBER
		if first_key_idx == 0 or second_key_idx == 0:
			others = []
			for i in range(len(swap_seat_list)):
				if swap_seat_list[i] != first_key_idx and swap_seat_list[i] != second_key_idx:
					others.append(swap_seat_list[i])
		else:
			others = [first_key_idx, second_key_idx]
			others = sorted(others)

		if others[0] - 1 > 0: 	# 1 2换
			self.players_list[0] = tmpList[0]
			self.players_list[1] = tmpList[2]
			self.players_list[2] = tmpList[1]
			self.players_list[3] = tmpList[3]

			swap_seat_list[1], swap_seat_list[2] = swap_seat_list[2], swap_seat_list[1]
		else:					# 2 3换
			self.players_list[0] = tmpList[0]
			self.players_list[1] = tmpList[1]
			self.players_list[2] = tmpList[3]
			self.players_list[3] = tmpList[2]

			swap_seat_list[2], swap_seat_list[3] = swap_seat_list[3], swap_seat_list[2]

		for i in range(len(self.players_list)):
			self.players_list[i].idx = i
		return swap_seat_list
		
	def getKeyCardSeat(self):
		DEBUG_MSG("key card:{}".format(self.key_card))
		keyIdxList = []
		for i in range(len(self.players_list)):
			for card in self.players_list[i].cards:
				if card == self.key_card:
					DEBUG_MSG(i)
					keyIdxList.append(i)
		DEBUG_MSG(str(keyIdxList))
		return keyIdxList[0], keyIdxList[1]

	def swapTileToTop(self, tile):
		pass
		# if tile in self.tiles:
		# 	tileIdx = self.tiles.index(tile)
		# 	self.tiles[0], self.tiles[tileIdx] = self.tiles[tileIdx], self.tiles[0]

	def reqStopGame(self, player):
		"""
		客户端调用该接口请求停止游戏
		"""
		DEBUG_MSG("Room.reqLeaveRoom: %s" % (self.roomID))
		self.state = 0
		# self.delTimer(self._poll_timer)
		# self._poll_timer = None

	def doOperation(self, avt_mb, aid, cards):
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < const.DISMISS_ROOM_WAIT_TIME:
			# 说明在准备解散投票中,不能进行其他操作
			return

		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.mb == avt_mb:
				idx = i

		if idx != self.wait_idx:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return

	def confirmOperation(self, avt_mb, aid, cards):
		DEBUG_MSG("confirmOperatin,aid:{0},cards:{1}.".format(aid, cards))
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < const.DISMISS_ROOM_WAIT_TIME:
			# 说明在准备解散投票中,不能进行其他操作
			return
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.mb == avt_mb:
				idx = i

		if idx != self.wait_idx:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return

		p = self.players_list[idx]
		if aid == const.OP_PASS and self.controller_idx != self.wait_idx:
			p.turnPass()
			self.wait_idx, isChangeController = self.getNextWaitIdx(self.wait_idx)
			DEBUG_MSG("confirmOperation,wait_idx:{0},isChangeController:{1}".format(self.wait_idx, isChangeController))
			if isChangeController:
				self.deskPokerList[self.controller_idx] = []
				self.controller_idx = self.wait_idx 
				for i, p in enumerate(self.players_list):
					if p.mb is not None:
						p.mb.notifyChangeController(self.wait_idx)
			self.deskPokerList[self.wait_idx] = []
			self.waitForOperation(self.wait_idx)
		elif aid == const.OP_DISCARD:
			isCanPlay, insteadCard = self.can_play_cards(p.cards, cards, idx)
			if isCanPlay:
				p.discard(cards, insteadCard)
				self.deskPokerList[idx] = insteadCard
				if self.checkWin(p):
					self.winGame()
				else:
					#玩家出完牌 游戏没有结束 显示对家手上牌
					if len(p.cards) <= 0:
						cooperation_idx = (idx + 2)%4
						p.mb.notifyCooperationCards(cooperation_idx, self.players_list[cooperation_idx].cards)
					self.wait_idx, isChangeController = self.getNextWaitIdx(self.wait_idx)
					self.deskPokerList[(self.controller_idx + 1) % 4] = []
					self.deskPokerList[self.wait_idx] = []
					self.waitForOperation(self.wait_idx)
			else:
				avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
		else:
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)

	def waitForOperation(self, wait_idx):
		for i, p in enumerate(self.players_list):
			if p and p.mb is not None:
				p.mb.waitForOperation(wait_idx, const.OP_DISCARD, [])

	def checkWin(self, p):
		if len(p.cards) > 0 or p.idx in self.show_empty_list:
			return False
		self.show_empty_list.append(p.idx)
		if len(self.show_empty_list) == 3 or (len(self.show_empty_list) == 2 and self.show_empty_list[0]%2 == self.show_empty_list[1]%2):
			return True
		return False

	def showHand(self, avt_mb):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.mb == avt_mb:
				idx = i
		single = True if self.score_mode == 1 else False
		pokerReplace = True if self.room_mode == 1 else False
		if len(self.players_list[idx].op) <= 0 and utility.calcCutMaxContribute(self.players_list[idx].cards, single, pokerReplace, 11) >= 0:
			info = dict()
			info['win_idx_list'] = self.show_empty_list
			calInfoList, winType = self.calShowHandScore(idx)
			info['cal_score_list'] = calInfoList
			info['winType'] = winType
			info['leftCards'] = [p.cards for i,p in enumerate(self.players_list)]
			if self.current_round < self.game_round:
				self.broadcastRoundEnd(info)
			else:
				self.endAll(info)

	def calShowHandScore(self, pushIdx):
		single = True if self.score_mode == 1 else False
		pokerReplace = True if self.room_mode == 1 else False

		info_list = []
		for i, p in enumerate(self.players_list):
			if i == pushIdx:
				maxContribute = utility.calcCutMaxContribute(p.cards, single, pokerReplace, 11)
				info_list.append([maxContribute])
			else:
				maxContribute, maxLine = utility.calcMaxContribute(p.cards, single, pokerReplace, 11, p.bombNumDict)
				info_list.append([maxContribute])
			DEBUG_MSG("calShowHandScore calcMaxContribute{0},{1},{2},{3},{4},{5}".format(p.cards, single, pokerReplace, self.best_phase, p.bombNumDict, maxContribute))
			

		def getContribution(info_list, idx):
			contribution = 0
			for i in range(len(info_list)):
				if i == idx:
					contribution += 3 * info_list[i][0]
				else:
					contribution -= info_list[i][0]
			return int(contribution)

		def getGapPrice(info_list, curIdx, cop_idx):
			val = round(((self.players_list[curIdx].original_line_score - info_list[curIdx][0]) - (self.players_list[cop_idx].original_line_score - info_list[cop_idx][0])) * 2)
			return int(val)

		calList = [None] * len(self.players_list)
		for i,p in enumerate(self.players_list):
			p.addscore(0 + getContribution(info_list, i) + getGapPrice(info_list, i, (i+2)%4))
			calList[i] = [0, 0, int(getContribution(info_list, i)), getGapPrice(info_list, i, (i+2)%4)]
		return calList, const.WIN_SHOW_HAND

	def calWinScore(self, show_empty_list): #平扣 1分 单扣 2分 双扣 3分
		single = True if self.score_mode == 1 else False
		pokerReplace = True if self.room_mode == 1 else False

		info_list = []
		for p in self.players_list:
			maxContribute, maxLine = utility.calcMaxContribute(p.cards, single, pokerReplace, 11, p.bombNumDict)
			DEBUG_MSG("calWinScore calcMaxContribute{0},{1},{2},{3},{4},{5},{6}".format(p.cards, single, pokerReplace, self.best_phase, p.bombNumDict, maxContribute, maxLine))
			info_list.append([maxContribute, maxLine])

		def getContribution(info_list, idx):
			contribution = 0
			for i in range(len(info_list)):
				if i == idx:
					contribution += 3 * info_list[i][0]
					DEBUG_MSG("+3*{}".format(info_list[i][0]))
				else:
					contribution -= info_list[i][0]
					DEBUG_MSG("-{}".format(info_list[i][0]))
			DEBUG_MSG("getContribution:{0}-{1}".format(idx, contribution))
			return int(contribution)

		def getGapPrice(info_list, curIdx, cop_idx):
			val = round(((self.players_list[curIdx].original_line_score - info_list[curIdx][0]) - (self.players_list[cop_idx].original_line_score - info_list[cop_idx][0])) * 2)
			return int(val)
		
		if len(show_empty_list) == 2: #双扣
			baseScore = 3
			allMaxLine = info_list[show_empty_list[0]][1] if info_list[show_empty_list[0]][1] > info_list[show_empty_list[1]][1] else info_list[show_empty_list[1]][1]
			allMaxLine = self.best_phase if allMaxLine > self.best_phase else allMaxLine
			allMaxLine_mul = 2 ** (allMaxLine-4 if allMaxLine >= 4 else 0)
			DEBUG_MSG("doubleWin,allMaxLine:{0},allMaxLine_mul:{1}".format(allMaxLine, allMaxLine_mul))

			calList = [None] * len(self.players_list)
			for i,p in enumerate(self.players_list):
				if i in show_empty_list:
					cop_idx = show_empty_list[0] if show_empty_list.index(i) == 1 else show_empty_list[1]
					p.addscore(baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				else:
					cop_idx = [idx for idx in range(len(self.players_list)) if idx not in show_empty_list and idx != i][0]
					p.addscore(-baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(-baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
			return calList, const.WIN_DOUBLE_BUCKLE
		elif len(show_empty_list) == 3 and (show_empty_list[0]+2)%4 == show_empty_list[2]: #单扣
			baseScore = 2
			allMaxLine = info_list[show_empty_list[0]][1] if info_list[show_empty_list[0]][1] > info_list[show_empty_list[2]][1] else info_list[show_empty_list[2]][1]
			allMaxLine = self.best_phase if allMaxLine > self.best_phase else allMaxLine
			allMaxLine_mul = 2 ** (allMaxLine-4 if allMaxLine >= 4 else 0)
			DEBUG_MSG("singleWin,allMaxLine:{0},allMaxLine_mul:{1}".format(allMaxLine, allMaxLine_mul))

			calList = [None] * len(self.players_list)
			for i,p in enumerate(self.players_list):
				if i == show_empty_list[0]:
					cop_idx = show_empty_list[2]
					p.addscore(baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				elif i == show_empty_list[1]:
					cop_idx = [idx for idx in range(len(self.players_list)) if idx not in show_empty_list][0]
					p.addscore(-baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(-baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				elif i == show_empty_list[2]:
					cop_idx = show_empty_list[0]
					p.addscore(baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				else:
					cop_idx = show_empty_list[1]
					p.addscore(-baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(-baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
			return calList, const.WIN_SINGLE_BUCKLE
		elif len(show_empty_list) == 3 and (show_empty_list[1]+2)%4 == show_empty_list[2]: #平扣
			baseScore = 1
			first_cop = [idx for idx in range(len(self.players_list)) if idx not in show_empty_list][0]
			allMaxLine = info_list[show_empty_list[0]][1] if info_list[show_empty_list[0]][1] > info_list[first_cop][1] else info_list[first_cop][1]
			allMaxLine = self.best_phase if allMaxLine > self.best_phase else allMaxLine
			allMaxLine_mul = 2 ** (allMaxLine-4 if allMaxLine >= 4 else 0)
			DEBUG_MSG("peaceWin,allMaxLine:{0},allMaxLine_mul:{1}".format(allMaxLine, allMaxLine_mul))

			calList = [None] * len(self.players_list)
			for i,p in enumerate(self.players_list):
				if i == show_empty_list[0]:
					cop_idx = first_cop
					p.addscore(baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				elif i == show_empty_list[1]:
					cop_idx = show_empty_list[2]
					p.addscore(-baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(-baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				elif i == show_empty_list[2]:
					cop_idx = show_empty_list[1]
					p.addscore(-baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(-baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]
				else:
					cop_idx = show_empty_list[0]
					p.addscore(baseScore * allMaxLine_mul + getContribution(info_list, i) + getGapPrice(info_list, i, cop_idx))
					calList[i] = [int(baseScore), int(allMaxLine), int(getContribution(info_list, i)), getGapPrice(info_list, i, cop_idx)]

			return calList, const.WIN_DRAW_BUCKLE
	def winGame(self):
		DEBUG_MSG("winGame")
		info = dict()
		info['win_idx_list'] = self.show_empty_list
		calInfoList, winType = self.calWinScore(self.show_empty_list)
		info['cal_score_list'] = calInfoList
		info['winType'] = winType
		info['leftCards'] = [p.cards for i,p in enumerate(self.players_list)]
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def endAll(self, info):
		DEBUG_MSG("endAll")
		self.record_round_result()
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		for p in self.players_list:
			if p and p.mb:
				p.mb.finalResult(player_info_list, info)
		self._reset()

	def sendEmotion(self, avt_mb, eid):
		""" 发表情 """
		# DEBUG_MSG("Room.Player[%s] sendEmotion: %s" % (self.roomID, eid))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb == p.mb:
				idx = i
				break
		else:
			if self.agent and self.agent.userId == avt_mb.userId:
				idx = -1

		if idx is None:
			return

		if self.agent and idx != -1 and self.agent.mb:
			self.agent.mb.recvEmotion(idx, eid)

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.recvEmotion(idx, eid)

	def sendMsg(self, avt_mb, mid):
		""" 发消息 """
		# DEBUG_MSG("Room.Player[%s] sendMsg: %s" % (self.roomID, mid))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb == p.mb:
				idx = i
				break
		else:
			if self.agent and self.agent.userId == avt_mb.userId:
				idx = -1

		if idx is None:
			return

		if self.agent and idx != -1 and self.agent.mb:
			self.agent.mb.recvMsg(idx, mid)

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.recvMsg(idx, mid)

	def sendVoice(self, avt_mb, url):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomID))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		else:
			if self.agent and self.agent.userId == avt_mb.userId:
				idx = -1

		if idx is None:
			return
		if self.agent and idx != -1 and self.agent.mb:
			self.agent.mb.recvVoice(idx, url)

		for i, p in enumerate(self.players_list):
			if p and p.mb:
				p.mb.recvVoice(idx, url)

	def sendAppVoice(self, avt_mb, url, time):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomID))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		else:
			if self.agent and self.agent.userId == avt_mb.userId:
				idx = -1

		if idx is None:
			return
		if self.agent and idx != -1 and self.agent.mb:
			self.agent.mb.recvAppVoice(idx, url, time)

		for i, p in enumerate(self.players_list):
			if p and p.mb:
				p.mb.recvAppVoice(idx, url, time)

	def broadcastOperation(self, idx, aid, real_card_list = [], instead_card_list = []):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param cards: 出牌的cards
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.mb.postOperation(idx, aid, real_card_list, instead_card_list)

	def broadcastOperation2(self, idx, aid, real_card_list = [], instead_card_list = []):
		""" 将操作广播除了自己之外的其他人 """
		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.mb.postOperation(idx, aid, real_card_list, instead_card_list)

	def broadcastMultiOperation(self, idx_list, aid_list, card_list=None):
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.mb.postMultiOperation(idx_list, aid_list, card_list)

	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		self.state = 0
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

		DEBUG_MSG("&" * 30)
		DEBUG_MSG("RoundEnd info = {}".format(info))
		self.confirm_next_idx = []
		for p in self.players_list:
			if p:
				p.mb.roundResult(info)

		# self._next_game_timer = self.addTimer(const.NEXT_GAME_WAIT_TIME, 0, const.TIMER_TYPE_NEXT_GAME)

	def get_init_client_dict(self):
		agent_d = {
			'nickname': "",
			'userId': 0,
			'head_icon': "",
			'ip': '0.0.0.0',
			'sex': 1,
			'idx': -1,
			'uuid': 0,
			'online': 1,
		}
		if self.is_agent and self.agent:
			d = self.agent.get_init_client_dict()
			agent_d.update(d)

		return {
			'roomID': self.roomID,
			'ownerId': self.owner_uid,
			'isAgent': self.is_agent,
			'agentInfo': agent_d,
			'curRound': self.current_round,
			'maxRound': self.game_round,
			'room_mode' : self.room_mode,
			'insert_card' : self.insert_card,
			'deal_mode' : self.deal_mode,
			'score_mode' : self.score_mode,
			'changeSeat' : self.changeSeat,
			'best_phase' : self.best_phase,
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(const.ROOM_PLAYER_NUMBER)],

		}

	def get_reconnect_room_dict(self, userId):
		dismiss_left_time = int(time.time() - self.dismiss_room_ts)
		if self.dismiss_room_ts == 0 or dismiss_left_time >= const.DISMISS_ROOM_WAIT_TIME:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p and p.userId == userId:
				idx = p.idx

		return {
			'init_info' : self.get_init_client_dict(),
			'controllerIdx': self.controller_idx,
			'controller_discard_list' : self.controller_discard_list,
			'deskPokerList' : self.deskPokerList,
			'isPlayingGame': self.state,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(const.ROOM_PLAYER_NUMBER)],
			'waitIdx': self.wait_idx,
			'keyCard' : self.key_card,
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'cooperation_cards' : self.players_list[(idx+2)%4].cards if len(self.players_list[idx].cards)<=0 else [0]*len(self.players_list[(idx+2)%4].cards), # 若自己的牌已经打完 则需要知道 队友的牌
			'cooperation_idx' : (idx+2)%4,
			'showHandFlag' : 1 if len(self.players_list[idx].op) <= 0 else 0,
		}

	def broadcastEnterRoom(self, idx):
		new_p = self.players_list[idx]

		if self.is_agent == 1:
			if self.agent and self.agent.mb:
				self.agent.mb.othersEnterRoom(new_p.get_init_client_dict())

		for i, p in enumerate(self.players_list):
			if p is None:
				continue
			if i == idx:
				p.mb.enterRoomSucceed(self, idx)
			else:
				p.mb.othersEnterRoom(new_p.get_init_client_dict())

	def cal_score(self, idx, aid, lucky_tile = 0, multiple = 0):
		pass

	def roundEndCallback(self, avt_mb):
		""" 一局完了之后玩家同意继续游戏 """
		if self.state == 1:
			return
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.userId == avt_mb.userId:
				idx = i
				break
		if idx not in self.confirm_next_idx:
			self.confirm_next_idx.append(idx)
			for p in self.players_list:
				if p and p.idx != idx:
					p.mb.readyForNextRound(idx)

		if len(self.confirm_next_idx) == const.ROOM_PLAYER_NUMBER and self.isFull:
			if self.current_round == 0 and self.is_agent == 1 and self.agent and self.agent.mb:
				try:
					self.agent.mb.quitRoomSucceed()
					leave_tips = "您代开的房间已经开始游戏, 您已被请离.\n房间号【{}】".format(self.roomID)
					self.agent.mb.showTip(leave_tips)
				except:
					pass
			self.startGame()

	def record_round_result(self):
		# 玩家记录当局战绩
		d = datetime.fromtimestamp(time.time())
		round_result_d = {
			'date': '-'.join([str(d.year), str(d.month), str(d.day)]),
			'time': ':'.join([str(d.hour), str(d.minute)]),
			'round_record': [p.get_round_result_info() for p in self.origin_players_list if p],
		}

		# 第一局结束时push整个房间所有局的结构, 以后就增量push
		if self.current_round == 1:
			game_result_l = [[round_result_d]]
			for p in self.players_list:
				if p:
					p.record_all_result(game_result_l)
		else:
			for p in self.players_list:
				if p:
					p.record_round_game_result(round_result_d)

	def check_same_ip(self):
		ip_list = []
		for p in self.players_list:
			if p and p.mb and p.ip != '0.0.0.0':
				ip_list.append(p.ip)
			else:
				ip_list.append(None)

		tips = []
		checked = []
		for i in range(const.ROOM_PLAYER_NUMBER):
			if ip_list[i] is None or i in checked:
				continue
			checked.append(i)
			repeat = []
			repeat.append(i)
			for j in range(i+1, const.ROOM_PLAYER_NUMBER):
				if ip_list[j] is None or j in checked:
					continue
				if ip_list[i] == ip_list[j]:
					repeat.append(j)
			if len(repeat) > 1:
				name = []
				for k in repeat:
					checked.append(k)
					name.append(self.players_list[k].nickname)
				tip = '和'.join(name) + '有相同的ip地址'
				tips.append(tip)
		if tips:
			tips = '\n'.join(tips)
			# DEBUG_MSG(tips)
			for p in self.players_list:
				if p and p.mb:
					p.mb.showTip(tips)

	def apply_dismiss_room(self, avt_mb):
		""" 游戏开始后玩家申请解散房间 """
		self.dismiss_room_ts = time.time()
		src = None
		for i, p in enumerate(self.players_list):
			if p.userId == avt_mb.userId:
				src = p
				break

		# 申请解散房间的人默认同意
		self.dismiss_room_from = src.idx
		self.dismiss_room_state_list[src.idx] = 1

		self.dismiss_timer = self.addTimer(const.DISMISS_ROOM_WAIT_TIME, 0, const.TIMER_TYPE_DISMISS_WAIT)

		for p in self.players_list:
			if p and p.mb and p.userId != avt_mb.userId:
				p.mb.req_dismiss_room(src.idx)

	def vote_dismiss_room(self, avt_mb, vote):
		""" 某位玩家对申请解散房间的投票 """
		src = None
		for p in self.players_list:
			if p and p.userId == avt_mb.userId:
				src = p
				break

		self.dismiss_room_state_list[src.idx] = vote
		for p in self.players_list:
			if p and p.mb:
				p.mb.vote_dismiss_result(src.idx, vote)

		yes = self.dismiss_room_state_list.count(1)
		no = self.dismiss_room_state_list.count(2)
		if yes >= 3:
			self.delTimer(self.dismiss_timer)
			self.dismiss_timer = None
			self.dropRoom()

		if no >= 2:
			self.delTimer(self.dismiss_timer)
			self.dismiss_timer = None
			self.dismiss_room_from = -1
			self.dismiss_room_ts = 0
			self.dismiss_room_state_list = [0,0,0,0]

	def notify_player_online_status(self, userId, status):
		src = -1
		for idx, p in enumerate(self.players_list):
			if p and p.userId == userId:
				p.online = status
				src = idx
				break

		if src == -1:
			return

		for idx, p in enumerate(self.players_list):
			if p and p.mb and p.userId != userId:
				p.mb.notifyPlayerOnlineStatus(src, status)
