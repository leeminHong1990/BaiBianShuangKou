# -*- coding: utf-8 -*-

import time
import re
import const
import copy
from KBEDebug import *
from datetime import datetime
from KBEDebug import *
import hashlib
import time
import AsyncRequest
import json
import switch
import random

def is_same_day(ts1, ts2):
	d1 = datetime.fromtimestamp(ts1)
	d2 = datetime.fromtimestamp(ts2)

	if (d1.year, d1.month, d1.day) == (d2.year, d2.month, d2.day):
		return True
	return False

def gen_room_id():
	randomId = random.randint(100000, 999999)
	for i in range(899999):
		val = randomId + i
		if val > 999999:
			val = val%1000000 + 100000
		if val not in KBEngine.globalData["GameWorld"].rooms:
			return val
	return 999999

def filter_emoji(nickname):
	try:
		# UCS-4
		highpoints = re.compile(u'[\U00010000-\U0010ffff]')
	except re.error:
		# UCS-2
		highpoints = re.compile(u'[\uD800-\uDBFF][\uDC00-\uDFFF]')
	nickname = highpoints.sub(u'', nickname)
	return nickname

# 发送网络请求
def get_user_info(accountName, callback):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	url = switch.PHP_SERVER_URL + 'user_info_server'
	suffix = '?timestamp=' + str(ts) + '&unionid=' + accountName + '&sign=' + sign
	AsyncRequest.Request(url + suffix, lambda x:callback(x.read()) if x else DEBUG_MSG(url + suffix + " error!"))

def update_card_diamond(accountName, deltaCard, deltaDiamond, callback, reason = ""):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + str(deltaCard) + "_" + str(deltaDiamond) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	DEBUG_MSG("MD5::" +sign)
	url = switch.PHP_SERVER_URL + 'update_card_diamond'
	data = {
		"timestamp" : ts,
		"delta_card" : deltaCard,
		"delta_diamond" : deltaDiamond,
		"unionid" : accountName,
		"sign" : sign,
		"reason" : reason
	}
	AsyncRequest.Post(url, data, lambda x:callback(x.read()) if x else DEBUG_MSG(url + str(data) + " error!"))

def getMaxSerialCard():
	return const.HEI[-2]

def getMinSerialCard():
	return const.HEI[0]

def classifyCards(cards):
	notJokers = []
	jokers = []
	for i in range(len(cards)):
		if cards[i] in const.HEI or cards[i] in const.HONG or cards[i] in const.MEI or cards[i] in const.FANG or (cards[i] in const.JOKER and const.JOKER.index(cards[i]) == 0):
			notJokers.append(cards[i])
		elif cards[i] in const.JOKER and const.JOKER.index(cards[i]) == 1:
			jokers.append(cards[i])
		else:
			DEBUG_MSG("error-error not has this card:{}".format(cards[i]))
	return notJokers, jokers

def checkIsCircleSerialThan3(lis):
	serial = sorted(lis)
	if const.CARD2 in serial:
		copySerial = copy.deepcopy(serial)
		for i in range(len(const.CIRCLE)):
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		for i in range(len(const.CIRCLE))[::-1]:
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		if len(copySerial) <= 0:
			return True
		return False
	else:
		for i in range(len(serial) - 1):
			if serial[i] + 1 != serial[i+1]:
				return False
		return True


def getCard2NumDict(cards):
	card2NumDict = {}
	for t in cards:
		if t not in card2NumDict:
			card2NumDict[t] = 1
		else:
			card2NumDict[t] += 1
	return card2NumDict

def checkIsSingle(cards):
	if len(cards) == 1:
		return True
	return False

def checkIsPair(cards):
	if len(cards) == 2 and cards[0] == cards[1]:
		return True
	return False

def checkIsSerialPair(cards):
	if len(cards) < 6 or len(cards)%2 != 0:
		return False
	card2NumDict = getCard2NumDict(cards)
	#张数
	for card in card2NumDict:
		if card2NumDict[card] != 2:
			return False
	#顺序
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) -1):
		if serial[i] + 1 != serial[i+1]:
			return False
	return True

def checkIsTriple(cards):
	card2NumDict = getCard2NumDict(cards)
	if len(cards) == 3 and len(card2NumDict) == 1:
		return True
	return False

def checkIsSerialTriple(cards):
	card2NumDict = getCard2NumDict(cards)
	# 3 * 3 以上
	if len(card2NumDict) < 3:
		return False
	# 每样3张
	for card in card2NumDict:
		if card2NumDict[card] != 3:
			return False
	# 是否连续
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) - 1):
		if serial[i] + 1 != serial[i+1]: 
			return False
	return True

def checkIsSerialSingle(cards):
	if len(cards) < 5:
		return False
	card2NumDict = getCard2NumDict(cards)
	for card in card2NumDict:
		if card2NumDict[card] != 1:
			return False
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) - 1):
		if serial[i] + 1 != serial[i+1]:
			return False
	return True

def checkIsNormalBomb(cards):
	card2NumDict = getCard2NumDict(cards)
	if len(cards) >= 4 and len(card2NumDict) == 1:
		return True
	return False

def getSerialBombNum(cards): # 连炸, 每个炸弹张数
	card2NumDict = getCard2NumDict(cards)
	for card in card2NumDict:
		return card2NumDict[card]

def getSerialBombSerialNum(cards): # 连炸, X连炸
	card2NumDict = getCard2NumDict(cards)
	serial = card2NumDict.keys()
	return len(serial)

def checkIsSerialBomb(cards):
	if len(cards) < 12:
		return False
	#数量
	card2NumDict = getCard2NumDict(cards)
	cardNum = getSerialBombNum(cards)
	for card in card2NumDict:
		if card2NumDict[card] != cardNum or card2NumDict[card] < 4:
			return False
	#连续
	serial = card2NumDict.keys()
	serial = sorted(serial)
	if len(serial) < 3:
		return False
	# 有2要特殊处理(仅限两王)
	if const.CARD2 in serial:
		#往后
		copySerial = copy.deepcopy(serial)
		for i in range(len(const.CIRCLE)):
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		for i in range(len(const.CIRCLE))[::-1]:
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		if len(copySerial) <= 0:
			return True
		# beforeList = []
		# isEndSerial = True
		# for i in range(len(serial)):
		# 	if not isEndSerial:
		# 		beforeList.append(serial[i])
		# 	if i != const.CIRCLE.index(serial[i]):
		# 		isEndSerial = False
		# 		beforeList.append(serial[i])
		# #往前
		# beforeList = sorted(beforeList)
		# needList = const.CIRCLE[-len(beforeList):]
		# needList = sorted(needList)
		# if beforeList != needList:
		# 	return False
		
	for i in range(len(serial) - 1):
		if serial[i] + 1 != serial[i+1]:
			return False
	return True

def checkIs3Joker(cards):
	if len(cards) != 3:
		return False
	jokerList = []
	for i in range(len(const.JOKER)):
		jokerList.append(const.JOKER[i] >> 3)
	for i in range(len(cards)):
		if cards[i] not in jokerList:
			return False
	return True


def chekIs4Joker(cards):
	if len(cards) != 4:
		return False
	jokerList = []
	for i in range(len(const.JOKER)):
		jokerList.append(const.JOKER[i] >> 3)
	card2NumDict = getCard2NumDict(cards)
	if len(card2NumDict) != 2:
		return False
	for card in card2NumDict:
		if card not in jokerList:
			return False
		if card2NumDict[card] != 2:
			return False
	return True

#百变双扣计算
def checkIsJokerPair(cardsButJoker, jokers): #对子
	DEBUG_MSG("checkIsJokerPair")
	if len(cardsButJoker) == 1 and len(jokers) == 1:
		return True
	return False

def checkIsJokerSerialPair(cardsButJoker, jokers): #连对
	DEBUG_MSG("checkIsJokerSerialPair")
	if len(cardsButJoker) + len(jokers) < 6 or (len(cardsButJoker) + len(jokers))%2 != 0:
		return False
	if len(cardsButJoker) + len(jokers) > 24: #最多不能超过 3-A
		return False
	jokerNum = len(jokers)
	card2NumDict = getCard2NumDict(cardsButJoker)
	#数量是否满足
	for card in card2NumDict:
		if card2NumDict[card] > 2:
			return False
		elif card2NumDict[card] < 2:
			needNum = 2 - card2NumDict[card]
			if jokerNum < needNum:
				return False
			jokerNum -= needNum
	#是否连续
	isSerial = True
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) - 1):
		j = 1
		while serial[i] + j != serial[i+1]:
			if jokerNum < 2:
				isSerial = False
				break
			j += 1
			jokerNum -= 2
	if isSerial and jokerNum%2 == 0:
		return True
	return False

def checkIsJokerTriple(cardsButJoker, jokers): # 三张 三张王不是三张一样的
	DEBUG_MSG("checkIsJokerTriple")
	if len(cardsButJoker) + len(jokers) != 3:
		return False
	if len(cardsButJoker) == 2:
		if cardsButJoker[0] == cardsButJoker[1]:
			return True
		return False
	elif len(jokers) == 3:
		return False
	return True

def checkIsJokerSerialTriple(cardsButJoker, jokers): # 连三张
	DEBUG_MSG("checkIsJokerSerialTriple")
	if len(cardsButJoker) + len(jokers) < 9 or (len(cardsButJoker) + len(jokers))%3 != 0:
		return False
	if len(cardsButJoker) + len(jokers) > 36: #最多不能超过 3-A
		return False
	jokerNum = len(jokers)
	card2NumDict = getCard2NumDict(cardsButJoker)
	#数量
	for card in card2NumDict:
		if card2NumDict[card] > 3:
			return False
		elif card2NumDict[card] < 3:
			needNum = 3 - card2NumDict[card]
			if jokerNum < needNum:
				return False
			jokerNum -= needNum
	#连续
	isSerial = True
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) - 1):
		j = 1
		while serial[i] + j != serial[i+1]:
			if jokerNum < 3:
				isSerial = False
				break
			j += 1
			jokerNum -= 3
	if isSerial and jokerNum%3 == 0:
		return True
	return False

def checkIsJokerSerialSingle(cardsButJoker, jokers): #顺子
	DEBUG_MSG("checkIsJokerSerialSingle")
	if len(cardsButJoker) + len(jokers) < 5:
		return False
	if len(cardsButJoker) + len(jokers) > 12: #最多不能超过 3-A
		return False
	card2NumDict = getCard2NumDict(cardsButJoker)
	# 数量
	for card in card2NumDict:
		if card2NumDict[card] != 1:
			return False
	#连续
	isSerial = True
	jokerNum = len(jokers)
	serial = card2NumDict.keys()
	serial = sorted(serial)
	for i in range(len(serial) - 1):
		j = 1
		while serial[i] + j != serial[i+1]:
			if jokerNum <= 0:
				isSerial = False
				break
			j += 1
			jokerNum -= 1
	return isSerial

def checkIsJokerNormalBomb(cardsButJoker, jokers): #普通炸弹 四王炸 不算普通炸弹
	DEBUG_MSG("checkIsJokerNormalBomb")
	if len(cardsButJoker) + len(jokers) < 4:
		return False
	if len(cardsButJoker) <= 0:
		return False
	card2NumDict = getCard2NumDict(cardsButJoker)
	if len(card2NumDict) != 1:
		return False
	return True

def checkIsJokerSerialBomb(cardsButJoker, jokers):
	DEBUG_MSG("checkIsJokerSerialBomb")
	if len(cardsButJoker) + len(jokers) < 12:
		return False
	jokerNum = len(jokers)
	card2NumDict = getCard2NumDict(cardsButJoker)
	# --数量--
	maxBombNum = 0 # 最大数量
	for card in card2NumDict:
		if card2NumDict[card] > maxBombNum:
			maxBombNum = card2NumDict[card]

	#先填成一样的
	for card in card2NumDict:
		if card2NumDict[card] < maxBombNum:
			if jokerNum < maxBombNum - card2NumDict[card]:
				return False
			jokerNum -= maxBombNum - card2NumDict[card]
	#如果不是炸弹 填成炸弹(默认填成4 因为线数相同 张数越多 炸弹越大)
	if maxBombNum < 4:
		if jokerNum < len(card2NumDict) * (4 - maxBombNum):
			return False
		jokerNum -= len(card2NumDict) * (4 - maxBombNum)
		maxBombNum = 4
	#是否拼成3连炸以上
	if len(card2NumDict) + jokerNum//maxBombNum < 3:
		return False
	# --连续--
	serial = card2NumDict.keys()
	serial = sorted(serial)
	needSerialNum = len(serial)
	# 有2要特殊判断 (只限 2个王可替换的情况)
	if const.CARD2 in serial:
		copySerial = copy.deepcopy(serial)
		for i in range(len(const.CIRCLE)):
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		for i in range(len(const.CIRCLE))[::-1]:
			if const.CIRCLE[i] in copySerial:
				copySerial.remove(const.CIRCLE[i])
			else:
				break
		if len(copySerial) <= 0 and jokerNum % maxBombNum == 0:
			return True

	isSerial = True
	for i in range(len(serial) - 1):
		j = 1
		while serial[i] + j != serial[i+1]:
			if jokerNum <= 0:
				isSerial = False
				break
			j += 1
			needSerialNum += 1
			jokerNum -= maxBombNum
	#是否刚好拼成炸弹
	if jokerNum != 0 and jokerNum != maxBombNum:
		return False
	if isSerial and (jokerNum % needSerialNum == 0 or jokerNum % maxBombNum == 0):
		return True
	return False

def getOriginCardInsteadNum(originCard):
	notJokerList = [const.HEI, const.HONG, const.MEI, const.FANG]
	if originCard in const.JOKER:
		return const.SHADOW_JOKER[const.JOKER.index(originCard)]
	for i in range(len(notJokerList)):
		if originCard in notJokerList[i]:
			return const.INSTEAD[notJokerList[i].index(originCard)]
	return originCard

def getRightShiftCardInsteadNum(shiftCard):
	originCard = shiftCard << 3
	return getOriginCardInsteadNum(originCard)

#按最大牌型生成新牌(必须满足可以生成)

def makeJokerPair(originCardsButJoker, originJokers):
	#王不能替王 两个王的情况(一大一小)
	newOriginPair = []
	newOriginPair.append(originCardsButJoker[0])
	newOriginPair.append(getOriginCardInsteadNum(originCardsButJoker[0]))
	# DEBUG_MSG("makeJokerPair==>:{0},{1},{2}".format(originCardsButJoker[0], originJokers[0], getOriginCardInsteadNum(originCardsButJoker[0])))
	newOriginPair = sorted(newOriginPair)
	return newOriginPair

def getInsteadMidSerialCard(shiftSerialCard, jokerNum): #往中间填
	insteadCards = []
	shiftSerialCard = sorted(shiftSerialCard)
	for i in range(len(shiftSerialCard) - 1):
		j = 1
		while shiftSerialCard[i] + j !=  shiftSerialCard[i+1]:
			insteadCards.append(getRightShiftCardInsteadNum(shiftSerialCard[i] + j))
			jokerNum -= 1
			j += 1
	return insteadCards, jokerNum

def getInsteadEndSerialCard(shiftSerialCard, jokerNum): #往后填
	insteadCards = []
	shiftSerialCard = sorted(shiftSerialCard)
	maxCard = shiftSerialCard[-1]
	while maxCard < (getMaxSerialCard() >> 3) and jokerNum > 0:
		maxCard += 1
		jokerNum -= 1
		insteadCards.append(getRightShiftCardInsteadNum(maxCard))
	return insteadCards, jokerNum

def getInsteadBeforeSerialCard(shiftSerialCard, jokerNum): #往前填
	insteadCards = []
	shiftSerialCard = sorted(shiftSerialCard)
	minCard = shiftSerialCard[0]
	while minCard > (getMinSerialCard() >> 3) and jokerNum > 0:
		minCard -= 1
		jokerNum -= 1
		insteadCards.append(getRightShiftCardInsteadNum(minCard))
	return insteadCards, jokerNum

def makeJokerSerialPair(originCardsButJoker, originJokers):
	makeCards = copy.deepcopy(originCardsButJoker)
	shiftCards = rightShiftCards(originCardsButJoker)
	shiftCards = sorted(shiftCards)
	jokerNum = len(originJokers)
	
	card2NumDict = getCard2NumDict(shiftCards)
	#成对
	for card in card2NumDict:
		if card2NumDict[card] == 1:
			makeCards.append(getRightShiftCardInsteadNum(card))
			jokerNum -= 1
	#连续
	serial = card2NumDict.keys()
	serial = sorted(serial)
	#中间连续
	insteadCards, restJokerNum = getInsteadMidSerialCard(serial, jokerNum)
	midRestJokerNum = restJokerNum - (jokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	#往后连续
	insteadCards, restJokerNum = getInsteadEndSerialCard(serial, midRestJokerNum)
	endRestJokerNum = restJokerNum  - (midRestJokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	#往前连续
	insteadCards, restJokerNum = getInsteadBeforeSerialCard(serial, endRestJokerNum)
	beforeRestJokerNum = restJokerNum  - (endRestJokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)

	makeCards = sorted(makeCards)
	return makeCards

def makeJokerTriple(originCardsButJoker, originJokers):
	jokerNum = len(originJokers)
	makeCards = copy.deepcopy(originCardsButJoker)
	for i in range(len(originJokers)):
		makeCards.append(getOriginCardInsteadNum(originCardsButJoker[0]))
	return makeCards

def makeJokerSerialTriple(originCardsButJoker, originJokers):
	makeCards = copy.deepcopy(originCardsButJoker)
	shiftCards = rightShiftCards(originCardsButJoker)
	shiftCards = sorted(shiftCards)
	jokerNum = len(originJokers)

	card2NumDict = getCard2NumDict(shiftCards)
	#成 * 3
	for card in card2NumDict:
		if card2NumDict[card] == 1:
			makeCards.append(getRightShiftCardInsteadNum(card))
			makeCards.append(getRightShiftCardInsteadNum(card))
			jokerNum -= 1
			jokerNum -= 1
		elif card2NumDict[card] == 2:
			makeCards.append(getRightShiftCardInsteadNum(card))
			jokerNum -= 1
	#连续
	serial = card2NumDict.keys()
	serial = sorted(serial)

	#中间连续
	insteadCards, restJokerNum = getInsteadMidSerialCard(serial, jokerNum)
	midRestJokerNum = restJokerNum - 2*(jokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	#往后连续
	insteadCards, restJokerNum = getInsteadEndSerialCard(serial, midRestJokerNum)
	endRestJokerNum = restJokerNum  - 2*(midRestJokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	#往前连续
	insteadCards, restJokerNum = getInsteadBeforeSerialCard(serial, endRestJokerNum)
	beforeRestJokerNum = restJokerNum  - 2*(endRestJokerNum-restJokerNum)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)
	makeCards.extend(insteadCards)

	makeCards = sorted(makeCards)
	return makeCards

def makeJokerSerialSingle(originCardsButJoker, originJokers):
	makeCards = copy.deepcopy(originCardsButJoker)
	shiftCards = rightShiftCards(originCardsButJoker)
	shiftCards = sorted(shiftCards)
	jokerNum = len(originJokers)

	card2NumDict = getCard2NumDict(shiftCards)
	#连续
	serial = card2NumDict.keys()
	serial = sorted(serial)

	#中间连续
	insteadCards, restJokerNum = getInsteadMidSerialCard(serial, jokerNum)
	makeCards.extend(insteadCards)

	#往后连续
	insteadCards, restJokerNum = getInsteadEndSerialCard(serial, restJokerNum)
	makeCards.extend(insteadCards)

	#往前连续
	insteadCards, restJokerNum = getInsteadBeforeSerialCard(serial, restJokerNum)
	makeCards.extend(insteadCards)

	makeCards = sorted(makeCards)
	return makeCards

def makeJokerNormalBomb(originCardsButJoker, originJokers):
	makeCards = copy.deepcopy(originCardsButJoker)
	jokerNum = len(originJokers)
	for i in range(jokerNum):
		makeCards.append(getOriginCardInsteadNum(originCardsButJoker[0]))
	return makeCards

def getLeftOffset(i, seq): # 返回需要 的list
	sequence = copy.deepcopy(seq)
	if const.CARD2 in sequence:
		sequence.remove(const.CARD2)
	sequence = sorted(sequence, reverse = True)
	if i < 0:
		lis = []
		for j in range(3, 15)[::-1]:
			if j > sequence[0]:
				lis.append(j)
		return lis
	# elif i >= len(sequence)
	# 	lis = []
	# 	for j in range(3, 15)[::-1]:
	# 		if j < sequence[-1]:
	# 			lis.append(j)
	# 	return lis
	lis = []
	for j in range(3, 15)[::-1]:
		if sequence[i+1] < j and j < sequence[i]:
			lis.append(j)
	return lis

def getRightOffset(i, seq):
	sequence = copy.deepcopy(seq)
	if const.CARD2 in sequence:
		sequence.remove(const.CARD2)
	sequence = sorted(sequence)
	if i < 0:
		lis = []
		for j in range(3, 15):
			if j < sequence[0]:
				lis.append(j)
		return lis
	# elif i >= len(sequence):
	# 	lis = []
	# 	for j in range(3, 15):
	# 		if j > sequence[-1]:
	# 			lis.append(j)
	# 	return lis
	lis = []
	for j in range(3, 15):
		if sequence[i] < j and j < sequence[i+1]:
			lis.append(j)
	return lis

def makeJokerSerialBomb(originCardsButJoker, originJokers):
	makeCards = copy.deepcopy(originCardsButJoker)
	shiftCards = rightShiftCards(originCardsButJoker)
	shiftCards = sorted(shiftCards)
	jokerNum = len(originJokers)

	card2NumDict = getCard2NumDict(shiftCards)

	#连续
	serial = card2NumDict.keys()
	serial = sorted(serial)

	maxBombNum = 0 # 最大数量
	for card in card2NumDict:
		if card2NumDict[card] > maxBombNum:
			maxBombNum = card2NumDict[card]

	# 填成 一致
	for card in card2NumDict:
		if card2NumDict[card] < maxBombNum:
			needNum = maxBombNum - card2NumDict[card]
			for i in range(needNum):
				jokerNum -= 1
				makeCards.append(getRightShiftCardInsteadNum(card))
	#填成炸弹
	if maxBombNum < 4:
		needNum = 4 - maxBombNum
		for i in range(len(serial)):
			for j in range(needNum):
				jokerNum -= 1
				makeCards.append(getRightShiftCardInsteadNum(serial[i]))

	temp = copy.deepcopy(makeCards)
	tempJokerNum = jokerNum
	#普通类型  有多余王先往中间填 然后往A填(也就是往后)  最后往前填
	if jokerNum > 0 and const.CARD2 not in serial:
		insteadCards, restJokerNum = getInsteadMidSerialCard(serial, jokerNum)
		midRestJokerNum = restJokerNum - (maxBombNum - 1)*(jokerNum-restJokerNum)
		for i in range(maxBombNum):
			makeCards.extend(insteadCards)

		endRestJokerNum = 0
		if midRestJokerNum > 0:
			insteadCards, restJokerNum = getInsteadEndSerialCard(serial, midRestJokerNum)
			endRestJokerNum = restJokerNum - (maxBombNum - 1)(midRestJokerNum-restJokerNum)
			for i in range(maxBombNum):
				makeCards.extend(insteadCards)

		if endRestJokerNum > 0:
			insteadCards, restJokerNum = getInsteadBeforeSerialCard(serial, endRestJokerNum)
			beforeRestJokerNum = restJokerNum  - (maxBombNum - 1)*(endRestJokerNum-restJokerNum)
			for i in range(maxBombNum):
				makeCards.extend(insteadCards)
	#特殊类型 KA23
	tryRightShift = rightShiftCards(makeCards)
	tryCard2NumDict = getCard2NumDict(tryRightShift)
	trySerial = tryCard2NumDict.keys()
	trySerial = sorted(trySerial)
	isTrySerial = True
	for i in range(len(trySerial) - 1):
		if trySerial[i] + 1 != trySerial[i+1]:
			isTrySerial = False
	if not isTrySerial:
		makeCards = temp
		jokerNum = tempJokerNum

	if jokerNum > 0 and not isTrySerial:
		#若2没有
		if const.CARD2 not in serial:
			for i in range(maxBombNum):
				jokerNum -= 1
				makeCards.append(const.CARD2 << 3)

		leftOffset = -1
		rightOffset = -1
		while jokerNum > 0:
			if leftOffset >= len(serial) and rightOffset >= len(serial):
				break
			if leftOffset >= len(serial):
				rightNeedList = getRightOffset(rightOffset, serial)
				rightOffset += 1
				for i in range(len(rightNeedList)):
					for j in range(maxBombNum):
						if jokerNum <= 0:
							break
						jokerNum -= 1
						makeCards.extend(rightNeedList[i] << 3)
				continue
			if rightOffset >= len(serial):
				leftNeedList = getLeftOffset(leftOffset, serial)
				leftOffset += 1
				for i in range(len(leftNeedList)):
					for j in range(maxBombNum):
						if jokerNum <= 0:
							break
						jokerNum -= 1
						makeCards.extend(leftNeedList[i] << 3)
				continue
			leftNeedList = getLeftOffset(leftOffset, serial)
			rightNeedList = getRightOffset(rightOffset, serial)
			if len(rightNeedList) <= len(leftNeedList): #往右填
				leftOffset += 1
				for i in range(len(rightNeedList)):
					for j in range(maxBombNum):
						if jokerNum <= 0:
							break
						jokerNum -= 1
						makeCards.extend(rightNeedList[i] << 3)
			else:										#往左填
				rightOffset += 1
				for i in range(len(leftNeedList)):
					for j in range(maxBombNum):
						if jokerNum <= 0:
							break
						jokerNum -= 1
						makeCards.extend(leftNeedList[i] << 3)

	makeCards = sorted(makeCards)
	return makeCards

def checkIsCard2Serial(serial, minCardNum = 5):
	copySerial = copy.deepcopy(serial)
	if const.CARD2 not in copySerial or len(serial) >= len(const.CIRCLE) or len(serial) < minCardNum:
		return False
	copySerial.remove(const.CARD2)
	for i in range(len(const.CIRCLE)):
		if const.CIRCLE[i] in copySerial:
			copySerial.remove(const.CIRCLE[i])
		else:
			break

	for i in range(len(const.CIRCLE)- 1)[::-1]:
		if const.CIRCLE[i] in copySerial:
			copySerial.remove(const.CIRCLE[i])
		else:
			break
	if len(copySerial) > 0:
		return False
	return True

def rightShiftCards(cards):
	result = [0] * len(cards)
	for i in range(len(cards)):
		result[i] = cards[i] >> 3
	return result

# 0无牌 1非可出牌型 2单张 3对子 4连对 5三张 6连三张 
# 7顺子 8炸弹 9四王炸
def getNormalCardsType(cards): #cards 为右移2位后的 牌
	if len(cards) <= 0:
		return 0
	elif checkIsSingle(cards):
		return 2
	elif checkIsPair(cards):
		return 3
	elif checkIsSerialPair(cards):
		return 4
	elif checkIsTriple(cards):
		return 5
	elif checkIsSerialTriple(cards):
		return 6
	elif checkIsSerialSingle(cards):
		return 7
	elif checkIsNormalBomb(cards):
		return 8
	elif checkIs3Joker(cards):
		return 9
	elif chekIs4Joker(cards):
		return 10
	elif checkIsSerialBomb(cards):
		return 11
	return 1

# 0无牌 1非可出牌型 22对子 23连对 24三张 25连三张 
# 26顺子 27炸弹 
def getInsteadCardsType(cardsButJoker, jokers):
	if len(cardsButJoker) + len(jokers) <= 0:
		return 0
	elif checkIsJokerPair(cardsButJoker, jokers): #一大一小王 不能 算对子
		return 103
	elif checkIsJokerSerialPair(cardsButJoker, jokers):
		return 104
	elif checkIsJokerTriple(cardsButJoker, jokers):
		return 105
	elif checkIsJokerSerialTriple(cardsButJoker, jokers):
		return 106
	elif checkIsJokerSerialSingle(cardsButJoker, jokers):
		return 107
	elif checkIsJokerNormalBomb(cardsButJoker, jokers):
		return 108
	elif checkIsJokerSerialBomb(cardsButJoker, jokers):
		return 111
	return 1

#必须传入 类型相等 且 >= 2 牌型
# 0 小于等于  1 大于
def cmpSameTypeCards(baseCards, selCards, cardsType): #baseCards, selCards 为右移2位后的 牌
	if cardsType == 0 or cardsType == 1:
		return False
	elif cardsType == 2 or cardsType == 3 or cardsType == 4 or cardsType == 5 or cardsType == 6 or cardsType == 7:
		if len(selCards) == len(baseCards) and selCards[0] > baseCards[0]:
			return True
	elif cardsType == 8:
		if len(selCards) == len(baseCards):
			if selCards[0] > baseCards[0]:
				return True
		elif len(selCards) > len(baseCards):
			return True

	elif cardsType == 9 or  cardsType == 10:
		return False
	elif cardsType == 11:
		return cmpSameLineSerialBomb(baseCards, selCards)
	return False

def getMinCard2SerialBombCard(cards):
	minCard = const.CARD2
	for i in range(len(const.CIRCLE))[::-1]:
		if const.CIRCLE[i] in cards:
			minCard = const.CIRCLE[i]
		else:
			break
	return minCard

def getMinSerialBombCard(cards):
	copyList = copy.deepcopy(cards)
	copyList = sorted(copyList)
	return copyList[0]

def getSerialBombLine(cards):
	return getSerialBombNum(cards) + getSerialBombSerialNum(cards)

def cmpSameLineSerialBomb(baseCards, selCards):
	DEBUG_MSG("cmpSameLineSerialBomb")
	baseLine = getSerialBombLine(baseCards)
	selLine = getSerialBombLine(selCards)
	
	if selLine > baseLine:
		DEBUG_MSG("111111")
		return True
	elif selLine < baseLine:
		DEBUG_MSG("22222")
		return False
	elif const.CARD2 in baseCards and const.CARD2 not in selCards:
		DEBUG_MSG("33333")
		return True
	elif const.CARD2 not in baseCards and const.CARD2 in selCards:
		DEBUG_MSG("44444")
		return False
	elif const.CARD2 in baseCards and const.CARD2 in selCards:
		DEBUG_MSG("55555")
		baseMin = getMinCard2SerialBombCard(baseCards)
		selMin = getMinCard2SerialBombCard(selCards)
		if selMin > baseMin:
			return True
		return False
	else:
		DEBUG_MSG("66666")
		baseMin = getMinSerialBombCard(baseCards)
		selMin = getMinSerialBombCard(selCards)
		if selMin > baseMin:
			return True
		return False



def makeCard(originCards, cardsType):
	cardsButJoker, jokers = classifyCards(originCards)
	if cardsType == 103:
		return makeJokerPair(cardsButJoker, jokers)
	elif cardsType == 104:
		return makeJokerSerialPair(cardsButJoker, jokers)
	elif cardsType == 105:
		return makeJokerTriple(cardsButJoker, jokers)
	elif cardsType == 106:
		return makeJokerSerialTriple(cardsButJoker, jokers)
	elif cardsType == 107:
		return makeJokerSerialSingle(cardsButJoker, jokers)
	elif cardsType == 108:
		return makeJokerNormalBomb(cardsButJoker, jokers)
	elif cardsType == 111:
		return makeJokerSerialBomb(cardsButJoker, jokers)
	return originCards



####################################################################################################################################################
# 以下各方法用户计算牌型线数

def cards2cardNums(cards):
	# 统计各张手牌的数目
	cardNumDict = {}
	for card in cards:
		cardNumDict.setdefault(card, 0)
		cardNumDict[card] += 1
	return cardNumDict

def cardNums2baseLines(cardNumDict):
	# 不考虑王和连炸的情况下，牌型的基本线数信息
	baseLineDict = {}
	for card in cardNumDict:
		if cardNumDict[card] < 4:
			continue
		baseLineDict.setdefault(cardNumDict[card], 0)
		baseLineDict[cardNumDict[card]] += 1
	return baseLineDict

def cards2baseLines(cards):
	# 连炸和王已经处理的情况下，统计手牌初始情况下的线数
	return cardNums2baseLines(cards2cardNums(cards))

def calcMaxLine(baseLineDict):
	# 用已有的手牌基本线数信息计算出的合并后的最大线数信息
	lastBaseLine = 0
	curMaxLine = 0
	maxLineList = []
	for line in sorted(baseLineDict.keys()):
		if line > curMaxLine:
			if curMaxLine > 5:
				maxLineList.append(curMaxLine)
			lastBaseLine = curMaxLine = line + max(baseLineDict[line] - (2 if line == 4 else 1), 0)
		else:
			curMaxLine += baseLineDict[line]
	if curMaxLine > 5:
		maxLineList.append(curMaxLine)
	return maxLineList

def calcJokerBombInfoBranches(jokerCardList):
	# 返回一个可能的list，内容为兑换成的王炸数目和剩余可用王数
	if len(jokerCardList) == 3:
		return [[6, 0], [0, sum([1 for val in jokerCardList if val == const.JOKER[1]])]]
	elif len(jokerCardList) == 4:
		return [[7, 0], [6, 1], [0, 2]]
	else:
		return [[0, sum([1 for val in jokerCardList if val == const.JOKER[1]])]]

def cardsWithJokerBranches(cardNumDict, jokerNum):
	# 生成拼王后的分支情况
	# print(cardNumDict)
	if jokerNum == 1:
		for card in cardNumDict:
			if cardNumDict[card] >= 3:
				newCardNumDict = cardNumDict.copy()
				newCardNumDict[card] += 1
				yield newCardNumDict
	elif jokerNum == 2:
		for card in cardNumDict:
			if cardNumDict[card] >= 2:
				tmpCardNumDict = cardNumDict.copy()
				tmpCardNumDict[card] += 1
				for tmpCard in tmpCardNumDict:
					if tmpCardNumDict[tmpCard] >= 3:
						newCardNumDict = tmpCardNumDict.copy()
						newCardNumDict[tmpCard] += 1
						yield newCardNumDict
	else:
		yield cardNumDict.copy()

def divide2serialSections(cardNumDict):
	# 计算炸牌可以得到的连炸区间
	bombCardList = []
	for card in cardNumDict:
		if cardNumDict[card] >= 4:
			bombCardList.append(card)
	bombCardList.sort()
	# bombCardList已排序
	divideList = []
	for card in bombCardList:
		if len(divideList) == 0:
			divideList.append([card])
			continue
		if card - divideList[-1][-1] <= 1:
			divideList[-1].append(card)
		else:
			divideList.append([card])
	if len(divideList) > 1 and divideList[-1][-1] == 13 and divideList[0][0] == 1:
		# 首尾相接
		divideList[-1].extend(divideList[0])
		divideList = divideList[1:]
	serialSections = []
	for divide in divideList:
		if len(divide) >= 3:
			serialSections.append(divide)
	# print(serialSections)
	return serialSections

def cardNumDictDiscardSerialBomb(cardNumDict, cardList):
	# 丢掉手牌中的连炸，返回牌型的基本线数，并将兑换成的连炸线数加入
	newCardNumDict = cardNumDict.copy()
	minLine = 12
	for card in cardList:
		if cardNumDict[card] < minLine:
			minLine = cardNumDict[card]
	for card in cardList:
		newCardNumDict[card] -= minLine
		if newCardNumDict[card] <= 0:
			del newCardNumDict[card]
	baseLineDict = cardNums2baseLines(newCardNumDict)
	serialLine = (minLine - 4) + (len(cardList) - 3) + 7
	# print("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
	# print(minLine, serialLine, cardList)
	baseLineDict.setdefault(serialLine, 0)
	baseLineDict[serialLine] += 1
	return baseLineDict

def linesWithSerialBombBranches(cardNumDict):
	# 生成排除连炸后的分支情况
	serialSections = divide2serialSections(cardNumDict)
	if len(serialSections) == 0:
		# 没有连炸
		yield cardNums2baseLines(cardNumDict)
	elif len(serialSections) == 1:
		serialSection = serialSections[0]
		# print(serialSection)
		for startIdx in range(0, len(serialSection)-2):
			for endIdx in range(startIdx + 3, len(serialSection) + 1):
				# print(serialSection[startIdx:endIdx])
				yield cardNumDictDiscardSerialBomb(cardNumDict, serialSection[startIdx:endIdx])
		# 不选择任何连炸
		# print(str(cardNumDict))
		yield cardNums2baseLines(cardNumDict)
	elif len(serialSections) == 2:
		# 只有全4炸可能出现两组连炸，两组均为3连炸，不用讨论长度只选择要与不要
		# 两个连炸和不要连炸都构成8线，而不要连炸还有可能构成9炸，显然是不要连炸划算，不用计算选择两个连炸的情况
		yield cardNums2baseLines(cardNumDict)
		# 选择其中一个连炸
		yield cardNumDictDiscardSerialBomb(cardNumDict, serialSections[0])
		# 选择另一个连炸
		yield cardNumDictDiscardSerialBomb(cardNumDict, serialSections[1])

def calcContribute(maxLineList, topLine = 11):
	contribute = 0
	for line in maxLineList:
		if line > 5:
			contribute += 2 ** (min(line, topLine) - 5)
	return contribute

def calcMaxContribute(cards, single = True, pokerReplace = False, topLine = 11, extraLineDict = {}):
	# 计算原始手牌的最大贡献值：cards是手牌的List, single表示单贡还是多贡, pokerReplace表示是否为百变玩法
	maxContribute = 0
	maxLine = 0
	# 将原牌分为两组
	noJokerCards = []
	jokerCards = []
	for card in cards:
		if card in const.JOKER:
			jokerCards.append(card)
		else:
			noJokerCards.append((((card>>3)-2)%13+1) if card>>3 == 16 else (((card>>3)-1)%13+1))
	# 得到无王的基本牌型信息
	cardNumDict = cards2cardNums(noJokerCards)
	# baseLineDict = cardNums2baseLines(cardNumDict)

	# 计算可能的线数分支
	jokerBombInfoBranches = calcJokerBombInfoBranches(jokerCards)
	for jokerBombInfo in jokerBombInfoBranches:
		# 得到王炸的可能分支jokerBombInfo:[jokerBombLineDict, jokerNum]
		jokerBombLine = jokerBombInfo[0]
		jokerNum = jokerBombInfo[1]
		for jokerCardNumDict in cardsWithJokerBranches(cardNumDict, jokerNum if pokerReplace else 0):
			# 王已经替换牌，继续处理连炸
			# print(str(jokerCardNumDict))
			for lineDict in linesWithSerialBombBranches(jokerCardNumDict):
				# print(str(lineDict))
				# 讨论所有连炸组合加入刚刚计算的王炸
				if jokerBombLine > 0:
					lineDict.setdefault(jokerBombLine, 0)
					lineDict[jokerBombLine] += 1
				if extraLineDict:
					for line in extraLineDict:
						lineDict.setdefault(line, 0)
						lineDict[line] += extraLineDict[line]
				# print(str(lineDict))
				maxLineList = calcMaxLine(lineDict)
				# print(str(maxLineList))
				if len(maxLineList) != 0 and (maxLineList[-1] > maxLine if single else True):
					if maxLineList[-1] > maxLine:
						maxLine = maxLineList[-1]
					curMaxContri = calcContribute([maxLineList[-1]], topLine) if single else calcContribute(maxLineList, topLine)
					if curMaxContri > maxContribute:
						maxContribute = curMaxContri
	return (maxContribute, maxLine)

def calcCutMaxContribute(cards, single = True, pokerReplace = False, topLine = 11):
	if len(cards) != 27:
		return -1
	maxContribute = -1
	maxLine = 0
	# 将原牌分为两组
	noJokerCards = []
	jokerCards = []
	for card in cards:
		if card in const.JOKER:
			jokerCards.append(card)
		else:
			# print(card>>3)
			# print((((card>>3)-2)%13+1) if card>>3 == 16 else (((card>>3)-1)%13+1))
			noJokerCards.append((((card>>3)-2)%13+1) if card>>3 == 16 else (((card>>3)-1)%13+1))
	# 得到无王的基本牌型信息
	cardNumDict = cards2cardNums(noJokerCards)
	# baseLineDict = cardNums2baseLines(cardNumDict)

	# 计算可能的线数分支
	# jokerBombInfoBranches = calcJokerBombInfoBranches(jokerCards)
	# for jokerBombInfo in jokerBombInfoBranches:
	# 	# 得到王炸的可能分支jokerBombInfo:[jokerBombLineDict, jokerNum]
	# 	jokerBombLine = jokerBombInfo[0]
	# 	jokerNum = jokerBombInfo[1]
	for jokerNum in range(0, sum([1 for val in jokerCards if val == const.JOKER[1]]) + 1):
		jokerBombLine = 0
		if len(jokerCards) - jokerNum == 3:
			jokerBombLine = 6
		elif len(jokerCards) - jokerNum == 4:
			jokerBombLine = 7
		for jokerCardNumDict in cardsWithJokerBranches(cardNumDict, jokerNum if pokerReplace else 0):
			# 王已经替换牌，继续处理连炸
			# print(str(jokerCardNumDict))
			for lineDict in linesWithSerialBombBranches(jokerCardNumDict):
				# print(str(lineDict))
				if len(lineDict) > 1:
					continue
				elif len(lineDict) == 1:
					key = list(lineDict.keys())[0]
					if lineDict[key] > 1:
						continue
					if key < 10:
						lineDict = {}
				elif len(lineDict) == 0:
					if jokerBombLine > 0:
						lineDict.setdefault(jokerBombLine, 0)
						lineDict[jokerBombLine] += 1
					else:
						lineDict[6] = 1
				maxLineList = calcMaxLine(lineDict)
				if len(maxLineList) != 0 and maxLineList[-1] > maxLine:
					maxLine = maxLineList[-1]
					curMaxContri = calcContribute([maxLineList[-1]], topLine) if single else calcContribute(maxLineList, topLine)
					if curMaxContri > maxContribute:
						maxContribute = curMaxContri
				if maxContribute < 0:
					maxContribute = 0
	return maxContribute