# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import utility
import const
import random

class iRoomRules(object):

	def __init__(self):
		# 房间的牌堆
		self.cards = []

	def initCards(self):
		shuffle_Cards = []
		newCards = [[] for i in range(13)]
		for i in range(13):
			newCards[i].append(const.HEI[i])
			newCards[i].append(const.HEI[i])

			newCards[i].append(const.HONG[i])
			newCards[i].append(const.HONG[i])

			newCards[i].append(const.MEI[i])
			newCards[i].append(const.MEI[i])

			newCards[i].append(const.FANG[i])
			newCards[i].append(const.FANG[i])
		DEBUG_MSG(str(newCards))

		if self.insert_card == 0:	
			DEBUG_MSG("newCards :"+str(len(newCards)))		
			for i in range(len(newCards)):
				left = newCards[i][0:3]
				right = newCards[i][3:9]
				shuffle_Cards.append(left)
				shuffle_Cards.append(right)	
		elif self.insert_card == 1:
			for i in range(len(newCards)):
				left = newCards[i][0:2]
				right = newCards[i][2:8]
				shuffle_Cards.append(left)
				shuffle_Cards.append(right)
		elif self.insert_card == 2:
			for i in range(len(newCards)):
				shuffle_Cards.append(newCards[i])

		shuffle_Cards.append([const.JOKER[0]])
		shuffle_Cards.append([const.JOKER[0]])
		shuffle_Cards.append([const.JOKER[1]])
		shuffle_Cards.append([const.JOKER[1]])	

		DEBUG_MSG(str(shuffle_Cards))
		self.shuffle_cards(shuffle_Cards)
		self.initAllCards(shuffle_Cards)

	def shuffle_cards(self, newCards):
		# random.shuffle(self.cards)
		for i in range(len(newCards)):
			DEBUG_MSG(str(newCards[i]))
			random.shuffle(newCards[i])
		random.shuffle(newCards)

	def initAllCards(self, newCards):
		for i in range(len(newCards)):
			self.cards.extend(newCards[i])

	def deal(self):
		""" 发牌 """
		if self.deal_mode == 0:
			for j in range(const.ROOM_PLAYER_NUMBER):
				self.players_list[j].cards.extend(self.cards[0:3])
				self.cards = self.cards[3:]
			while len(self.cards) > 0:
				for j in range(const.ROOM_PLAYER_NUMBER):
					self.players_list[j].cards.extend(self.cards[0:6])
					self.cards = self.cards[6:]
		elif self.deal_mode == 1:
			for j in range(const.ROOM_PLAYER_NUMBER):
				self.players_list[j].cards.extend(self.cards[0:6])
				self.cards = self.cards[6:]
			while len(self.cards) > 0:
				for j in range(const.ROOM_PLAYER_NUMBER):
					self.players_list[j].cards.extend(self.cards[0:7])
					self.cards = self.cards[7:]
		elif self.deal_mode == 2:			
			while len(self.cards) > 0:
				for j in range(const.ROOM_PLAYER_NUMBER):
					self.players_list[j].cards.extend(self.cards[0:9])
					self.cards = self.cards[9:]		
		else:
			for i in range(const.INIT_CARD_NUMBER):
				for j in range(const.ROOM_PLAYER_NUMBER):
					self.players_list[j].cards.append(self.cards[j])
				self.cards = self.cards[const.ROOM_PLAYER_NUMBER:]

		for i in range(const.ROOM_PLAYER_NUMBER):
			self.players_list[i].tidy()

	# def deal(self):
	# 	self.players_list[0].cards = [27, 28, 28, 44, 49, 50, 57, 57, 58, 58, 59, 67, 68, 68, 84, 98, 98, 105, 105, 106, 106, 107, 107, 108, 108, 114, 132]
	# 	self.players_list[1].cards = [25, 25, 26, 26, 27, 41, 42, 43, 51, 52, 52, 65, 65, 66, 81, 81, 82, 82, 83, 90, 97, 97, 99, 131, 132, 145, 145]
	# 	self.players_list[2].cards = [33, 34, 43, 44, 49, 50, 51, 60, 73, 73, 74, 74, 75, 83, 84, 91, 92, 92, 113, 113, 114, 115, 129, 129, 130, 131, 153]
	# 	self.players_list[3].cards = [33, 34, 35, 35, 36, 36, 41, 42, 59, 60, 66, 67, 75, 76, 76, 89, 89, 90, 91, 99, 100, 100, 115, 116, 116, 130, 153]
	# 	self.cards = []
	# 	for i in range(const.ROOM_PLAYER_NUMBER):
	# 		self.players_list[i].tidy()

	# def deal(self):
	# 	self.players_list[0].cards = [41,41,42,42,43,43, 49,49,50,50,51,51, 57,57,58,58,59,59,33,132,132,131,131,130,130,129,129]
	# 	self.players_list[1].cards = [113,113,114,114,115,115,116,116,145,145, 28, 36, 27, 35,26, 34, 25, 33,28, 36,27, 35, 26, 34,25, 52, 60]
	# 	self.players_list[2].cards = [65, 73, 81, 65, 73, 81,   66, 74, 82, 66, 74, 82,  67, 75, 83,67, 75, 83,   68, 76, 84, 68, 76, 84,  44, 52, 60] #8 9 10
	# 	self.players_list[3].cards = [89, 97, 105,   90, 98, 106,   91, 99, 107,    92, 100, 108,    89, 97, 105,   90, 98, 106,   91, 99, 107,   92, 100, 108, 44, 153,153]
	# 	self.cards = []
	# 	for i in range(const.ROOM_PLAYER_NUMBER):
	# 		self.players_list[i].tidy()
		

	def random_key_card(self):
		cards = const.HEI + const.HONG + const.MEI + const.FANG + const.JOKER
		self.key_card = random.choice(cards)

	def can_play_cards(self, playerCards, cards, idx):
		if len(cards) <= 0:
			return False, cards
		if not self.check_has_card(playerCards, cards):
			DEBUG_MSG("palyer not has all cards.")
			return False, cards
		if self.can_play_normal_cards(cards, idx):
			return True, cards
		elif self.room_mode == 1:
			notJokers, jokers = utility.classifyCards(cards)
			notJokerShift = utility.rightShiftCards(notJokers)
			jokerShift = utility.rightShiftCards(jokers)
			makeDisCardPoker = utility.makeCard(cards, utility.getInsteadCardsType(notJokerShift, jokerShift))
			DEBUG_MSG("notJokers:{0}, jokers:{1}".format(notJokers, jokers))
			DEBUG_MSG("notJokerShift:{0}, jokerShift:{1}".format(notJokerShift, jokerShift))
			DEBUG_MSG("makeDiscardPoker:{}".format(makeDisCardPoker))
			if self.can_play_normal_cards(makeDisCardPoker, idx):
				return True,makeDisCardPoker
		return False, cards

	def check_has_card(self, playerCards, cards):
		cardsDict = utility.getCard2NumDict(cards)
		playerCardsDict = utility.getCard2NumDict(playerCards)
		for card in cardsDict:
			if card not in playerCardsDict or cardsDict[card] > playerCardsDict[card]:
				return False
		return True

	def can_play_normal_cards(self, cards, idx):
		DEBUG_MSG("can_nomal_play_cards")

		discardType = utility.getNormalCardsType(utility.rightShiftCards(cards))
		controllerType = utility.getNormalCardsType(utility.rightShiftCards(self.controller_discard_list))

		if discardType == 0 or discardType == 1:
			DEBUG_MSG("error discard type.")
			return False

		#自由出牌
		if self.controller_idx == idx: #其他玩家要不起 ,如果牌打完 controller_idx 转移到了 对家身上
			DEBUG_MSG("free to play.")
			return True

		#牌型 判断是否 压过前一次出的牌
		DEBUG_MSG("controllerType:{0},discardType:{1}.".format(controllerType, discardType))
		if controllerType == discardType:
			return utility.cmpSameTypeCards(utility.rightShiftCards(self.controller_discard_list), utility.rightShiftCards(cards), discardType)
		else:
			if controllerType < 8 and discardType < 8:	#两个非炸弹
				return False
			elif controllerType < 8 and discardType >= 8 : #炸普通牌
				return True
			elif discardType < 8 and controllerType >= 8 : #普通牌不能 大过 炸
				return False

			selBombLine = 0
			contrBombLine = 0
			if discardType == 8:
				selBombLine = len(cards)
			elif discardType == 9:
				selBombLine = 6
			elif discardType == 10:
				selBombLine = 7
			else:
				selBombLine = utility.getSerialBombLine(utility.rightShiftCards(cards))

			if controllerType == 8:
				contrBombLine = len(self.controller_discard_list)
			elif controllerType == 9:
				contrBombLine = 6
			elif controllerType == 10:
				contrBombLine = 7
			else:
				contrBombLine = utility.getSerialBombLine(utility.rightShiftCards(self.controller_discard_list))
			DEBUG_MSG("selBombLine:{0},contrBombLine:{1},cards:{2},controller_discard_list:{3} ".format(selBombLine, contrBombLine,cards,self.controller_discard_list))
			if selBombLine > contrBombLine: #线数大
				return True
			elif selBombLine < contrBombLine: #线数小
				return False
			else:							#线数相等
				# 相同线数 连炸 小于 同样数字炸弹
				if discardType == 8 and controllerType == 11:
					return True
				elif discardType == 11 and controllerType == 8:
					return False
				if len(cards) > len(self.controller_discard_list):
					return True
		return False