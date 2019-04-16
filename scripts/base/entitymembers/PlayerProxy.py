# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import weakref
import utility
import const

class PlayerProxy(object):

	def __init__(self, avt_mb, owner, idx):
		# 玩家的mailbox
		self.mb = avt_mb
		# 所属的游戏房间
		self.owner = owner if isinstance(owner, weakref.ProxyType) else weakref.proxy(owner)
		# 玩家的座位号
		self.idx = idx
		# 玩家在线状态
		self.online = 1
		# 玩家的手牌
		self.cards = []
		# 玩家自己操作
		self.op = []
		# 玩家打过的牌
		self.discard_cards = [] 
		# 玩家当局的得分
		self.score = 0
		# 玩家总得分
		self.total_score = 0
		
		#初始 分数
		self.original_line_score = 0
		#初始 最大线数
		self.original_max_line = 0

		#玩家出牌线数表
		self.bombNumDict = {}

	# 用于UI显示的信息
	@property
	def head_icon(self):
		DEBUG_MSG("PlayerProxy get head_icon = {}".format(self.mb.head_icon))
		return self.mb.head_icon

	@property
	def nickname(self):
		return self.mb.name

	@property
	def sex(self):
		return self.mb.sex

	@property
	def userId(self):
		return self.mb.userId

	@property
	def uuid(self):
		return self.mb.uuid

	@property
	def ip(self):
		return self.mb.ip

	def start(self):
		single = True if self.owner.score_mode == 1 else False
		pokerReplace = True if self.owner.room_mode == 1 else False
		DEBUG_MSG(str(self.cards), str(single), str(pokerReplace), str(self.owner.best_phase))
		self.original_line_score, self.original_max_line = utility.calcMaxContribute(self.cards, single, pokerReplace, 11, {})


	def tidy(self):
		self.cards = sorted(self.cards)
		DEBUG_MSG("Player{0} original cards: {1}".format(self.idx, self.cards))

	def reset(self):
		""" 每局开始前重置 """
		self.cards = []
		self.discard_cards = []
		self.op = []
		self.score = 0
		self.original_line_score = 0
		self.original_max_line = 0
		self.bombNumDict = {}

	def addscore(self, score):
		DEBUG_MSG("addscore:{0},{1},{2},{3}".format(self.idx, self.total_score, self.score, score))
		self.score += int(score)
		self.total_score += int(score)

	def turnPass(self):
		self.discard_cards.append([])
		self.op.append([const.OP_PASS, [], []])
		self.owner.op_record.append((self.idx, const.OP_PASS, [], []))
		self.owner.broadcastOperation2(self.idx, const.OP_PASS, [], [])

	def discard(self, card_list, instead_card_list):
		""" 打牌 """
		DEBUG_MSG("Player[%s] owncards:[%s],discard: %s,instead:%s" % (self.idx, str(self.cards), str(card_list), str(instead_card_list)))
		for card in card_list:
			self.cards.remove(card)
		self.tidy()
		self.countCard(card_list, instead_card_list)
		self.discard_cards.append(instead_card_list)
		self.owner.op_record.append((self.idx, const.OP_DISCARD, card_list, instead_card_list))
		self.op.append([const.OP_DISCARD, card_list, instead_card_list])
		self.owner.controller_idx = self.idx
		self.owner.controller_discard_list = instead_card_list
		self.owner.broadcastOperation2(self.idx, const.OP_DISCARD, card_list, instead_card_list)

	def countCard(self, ard_list, instead_card_list):
		cardType = utility.getNormalCardsType(utility.rightShiftCards(instead_card_list))
		DEBUG_MSG("countCard:{0}".format(cardType))
		if cardType == 8:
			line = len(instead_card_list)
			self.bombNumDict.setdefault(line, 0)
			self.bombNumDict[line] += 1
			DEBUG_MSG("8:{0},{1}".format(line, self.bombNumDict))
		elif cardType == 9:
			self.bombNumDict.setdefault(6, 0)
			self.bombNumDict[6] += 1
			DEBUG_MSG("9:{0},{1}".format(6, self.bombNumDict))
		elif cardType == 10:
			self.bombNumDict.setdefault(7, 0)
			self.bombNumDict[7] += 1
			DEBUG_MSG("10:{0},{1}".format(7, self.bombNumDict))
		elif cardType == 11:
			card2NumDict = utility.getCard2NumDict(utility.rightShiftCards(instead_card_list))
			line = len(card2NumDict) + len(instead_card_list)/len(card2NumDict)
			self.bombNumDict.setdefault(line, 0)
			self.bombNumDict[line] += 1
			DEBUG_MSG("11:{0},{1}".format(line, self.bombNumDict))

	# def getMaxBombMutilple(self):
	# 	#四王炸四倍
	# 	# 其他炸 倍数 = x张 - 4 + 1
	# 	maxMutiple = self.bomb4Joker
	# 	for num in self.bombNumDict:
	# 		if num - 3 > maxMutiple:
	# 			maxMutiple = num - 3
	# 	return maxMutiple

	# def getAllBombMutiple(self):
	# 	allMutiple = self.bomb4Joker
	# 	for num in self.bombNumDict:
	# 		allMutiple += num - 3
	# 	return allMutiple
			

	def get_init_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'idx': self.idx,
			'userId': self.userId,
			'uuid': self.uuid,
			'online': self.online,
			'ip': self.ip,
		}

	def get_round_client_dict(self):
		return {
			'idx': self.idx,
			'score': self.score,
			'total_score': self.total_score,
		}

	def get_final_client_dict(self):
		return {
			'idx': self.idx,
			'score': self.total_score,
		}

	def get_reconnect_client_dict(self, userId):
		# 掉线重连时需要知道所有玩家打过的牌以及自己的手牌
		return {
			'score': self.score,
			'total_score': self.total_score,
			'cards': self.cards if userId == self.userId else [0]*len(self.cards),
			'discard_cards': self.discard_cards, 
		}

	def get_round_result_info(self):
		# 记录信息后累计得分
		DEBUG_MSG('get_round_result_info,score:{0}, total_score:{1}'.format(self.score, self.total_score))
		return {
			'nickname': self.nickname,
			'score': self.score,
		}

	def record_round_game_result(self, round_record_dict):
		self.mb.recordRoundResult(round_record_dict)

	def record_all_result(self, game_record_list):
		self.mb.recordGameResult(game_record_list)