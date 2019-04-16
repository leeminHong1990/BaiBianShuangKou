"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameRules = impGameOperation.extend({
    __init__ : function(){
  		this._super();
  	  KBEngine.DEBUG_MSG("Create impGameRules");

      this.tipsList = []
      this.tips_indx = -1
    },

    getNextTips:function(){
      this.tips_indx += 1
      if (this.tips_indx >= this.tipsList.length) {
        return []
      }
      return this.tipsList[this.tips_indx]
    },

    getTipsCards:function(){
      // var tips = this.getSingleTips()
      // var tips = this.getPairTips()
      // var tips = this.getSerialPairTips(3, 4)
      // var tips = this.getTripleTips()
      // var tips = this.getSerialTripleTips(3)
      // var tips = this.getSingelSerialTips(5)
      // var tips = this.getBombTips()
      this.tips_indx = -1
      if (this.curGameRoom.controllerIdx == this.serverSeatNum) {
        var tips = this.getSingleTips(0, true)
        tips = tips.concat(this.getPairTips(0, true))
        tips = tips.concat(this.getTripleTips())
        tips = tips.concat(this.getBombTips())
        this.tipsList = tips
        cc.log("getTipsCards", this.tipsList)
      }else{
        //压过上家
        var controllerCards = cutil.rightShiftCards(this.curGameRoom.controller_discard_list)
        var controllerCardsType = cutil.getNormalCardsType(controllerCards)
        controllerCards.sort(function(a,b){return a-b;})
        
        var tips = []
        if (controllerCardsType == const_val.TYPE_SINGLE) {
          tips = this.getSingleTips(controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_PAIR) {
          tips = this.getPairTips(controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_SERIAL_PAIR) {
          tips = this.getSerialPairTips(controllerCards.length/2, controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_TRIPLE) {
          tips = this.getTripleTips(controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_SERIAL_TRIPLE) {
          tips = this.getSerialTripleTips(controllerCards.length/3, controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_SERIAL_SINGLE) {
          tips = this.getSingelSerialTips(controllerCards.length, controllerCards[0])
          tips = tips.concat(this.getBombTips())
        } else if (controllerCardsType == const_val.TYPE_BOMB || controllerCardsType == const_val.TYPE_3JOKER || controllerCardsType == const_val.TYPE_4JOKER || controllerCardsType == const_val.TYPE_SERIAL_BOMB) {
          tips = this.getBombTips(controllerCards)
        }
        this.tipsList = tips
        cc.log("2222getTipsCards", this.tipsList)
      }
    },

    getSingleTips:function(min_card, isOnlySingle){
      //手牌
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列
      var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
      var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)
      
      var tipList = []
      var allList = []
      // 仅有一张优先
      for (var i = 0; i < shiftCards.length; i++) {
        if ((!min_card || shiftCards[i] > min_card) && shiftCards2NumDict[shiftCards[i]] == 1) {
          if (const_val.JOKER.indexOf(cards[i]) >= 0) { //大王 小王 ，必须 不能是3王炸以上
            if (cutil.getJokerNum(cards) >= 3) {
              continue;
            }
          }
          tipList.push([cards[i]])
          allList.push(cards[i] >> 3)
        }
      }
      // 2张 
      if (!isOnlySingle) {
        for (var i = 0; i < shiftCards.length; i++) {
          if ((!min_card || shiftCards[i] > min_card) && shiftCards2NumDict[shiftCards[i]] == 2 && allList.indexOf(shiftCards[i]) < 0) {
            if (const_val.JOKER.indexOf(cards[i]) >= 0) { //对大王 对小王 ，必须 不能是3王炸以上
              if (cutil.getJokerNum(cards) >= 3) {
                continue;
              }
            }
            tipList.push([cards[i]])
            allList.push(cards[i] >> 3)
          }
        }
      }
      // 3张
      if (!isOnlySingle) {
        for (var i = 0; i < shiftCards.length; i++) {
          if ((!min_card || shiftCards[i] > min_card) && shiftCards2NumDict[shiftCards[i]] == 3 && allList.indexOf(shiftCards[i]) < 0) {
            tipList.push([cards[i]])
            allList.push(cards[i] >> 3)
          }
        }
      }
      cc.log("单张提示:", tipList)
      return tipList 
    },

    getPairTips:function(min_card, isOnlyPair){
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列
      var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
      var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)


      //区分大王和其他
      var classifyList = cutil.classifyCards(cards)
      var bigJokerNum = classifyList[1].length

      var tipList = []

      // 仅有一对优先
      for (var i = 0; i < shiftCards.length - 1; i++) {
        if (shiftCards[i] == shiftCards[i+1] && (!min_card || shiftCards[i] > min_card) && shiftCards2NumDict[shiftCards[i]] == 2) {
          if (const_val.JOKER.indexOf(cards[i]) >= 0) { //对大王 对小王 ，必须 不能是3王炸以上
            if (cutil.getJokerNum(cards) >= 3) {
              continue;
            }
          }
          tipList.push([cards[i], cards[i+1]])
        }
      }

      // 3张第二
      if (!isOnlyPair) {
        for (var i = 0; i < shiftCards.length - 1; i++) {
          if (shiftCards[i] == shiftCards[i+1] && (!min_card || shiftCards[i] > min_card) && shiftCards2NumDict[shiftCards[i]] == 3) {
            i++;
            tipList.push([cards[i], cards[i+1]])
          }
        }
      }

      // 百变情况下 有大王+单张 ,该单张不是大王
      if (bigJokerNum > 0 && cutil.getJokerNum(cards) < 3 && this.curGameRoom.room_mode == 1) {
        for (var i = 0; i < shiftCards.length; i++) {
          if ((!min_card || shiftCards[i] > min_card) && shiftCards[i] != const_val.JOKER[1] >> 3 && shiftCards2NumDict[shiftCards[i]] == 1) {
             tipList.push([cards[i], cards[cards.length - 1]])
          }
        }
      }
      cc.log("对子提示:", tipList)
      return tipList
    },

    getSerialPairTips:function(pairNum, min_card){
      min_card = min_card || 0
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列

      //区分大王和其他
      var classifyList = cutil.classifyCards(cards)
      var bigJokerNum = classifyList[1].length
      var card2ListDict = cutil.getCard2ListDict(cards)

      var tipList = []
      // 先不考虑 大王的替换
      for (var i = min_card + 3; i <= 14 - pairNum + 1; i++) {
        var isHasSerialPair = true;
        for (var j = 0; j < pairNum; j++) {
          if (!card2ListDict[i+j] || card2ListDict[i+j].length < 2) {
            isHasSerialPair = false;
          }
        }
        if (isHasSerialPair) {
          var suggestList = []
          for (var j = 0; j < pairNum; j++) {
            suggestList.push(card2ListDict[i+j][0])
            suggestList.push(card2ListDict[i+j][1])
          }
          suggestList.sort(function(a,b){return a-b;})
          tipList.push(suggestList)
        }

      }
      //考虑大王的替换
      if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1 && cutil.getJokerNum(cards) < 3) {
        for (var i = min_card + 3; i <= 14 - pairNum + 1; i++) {
          var useNum = bigJokerNum
          var isHasSerialPair = true;
          for (var j = 0; j < pairNum; j++) {
            if (!card2ListDict[i+j] || card2ListDict[i+j].length < 2) {
              useNum -= 2;
            }else if (card2ListDict[i+j].length < 2) {
              useNum -= 1;
            }
            if (useNum < 0) {
              isHasSerialPair = false
              break
            }
          }

          if (isHasSerialPair) {
            var suggestList = []
            for (var j = 0; j < pairNum; j++){
              if (card2ListDict[i+j]){
                cc.log(i+j, card2ListDict[i+j])
                if (card2ListDict[i+j][0]) {
                  suggestList.push(card2ListDict[i+j][0])
                }
                if (card2ListDict[i+j][1]) {
                  suggestList.push(card2ListDict[i+j][1])
                }
              }
            }
            var isContain = false
            for (var k = 0; k < tipList.length; k++) {
              if (suggestList[0] == tipList[k][0]) {
                isContain = true
                break
              }
            }
            if (isContain) {
              continue;
            }
            for (var x = 0; x < bigJokerNum-useNum; x++) {
              suggestList.push(const_val.JOKER[1])
            }
            tipList.push(suggestList)
          }
        }
      }
      cc.log("连对提示:", tipList)
      return tipList
    },

    getTripleTips:function(min_card){
      //手牌
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列
      var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
      var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)

      //区分大王和其他
      var classifyList = cutil.classifyCards(cards)
      var bigJokerNum = classifyList[1].length

      var tipList = []
      //仅有三张优先
      for (var i = 0; i < shiftCards.length - 2; i++) {
        if ((!min_card || shiftCards[i] > min_card) && shiftCards[i] == shiftCards[i+1] && shiftCards[i+1] == shiftCards[i+2] && shiftCards2NumDict[shiftCards[i]] == 3) {
          tipList.push([cards[i], cards[i+1], cards[i+2]]);
        }
      }
      // 百变情况下 有大王+对子 ,该对子不是王对
      if (bigJokerNum >= 1 && cutil.getJokerNum(cards) < 3 && this.curGameRoom.room_mode == 1) {
        for (var i = 0; i < shiftCards.length - 1; i++) {
          if (shiftCards[i] == shiftCards[i+1] && (!min_card || shiftCards[i] > min_card) && shiftCards[i] != const_val.JOKER[1] >> 3 && shiftCards2NumDict[shiftCards[i]] == 2) {
            tipList.push([cards[i], cards[i+1], classifyList[1][0]]);
          }
        }
      }
      // 百变情况下 有大王对子+单张, 该单张不是大王
      if (bigJokerNum >= 2 && cutil.getJokerNum(cards) < 3 && this.curGameRoom.room_mode == 1) {
        for (var i = 0; i < shiftCards.length; i++) {
          if ((!min_card || shiftCards[i] > min_card)  && shiftCards[i] != const_val.JOKER[1] >> 3 && shiftCards2NumDict[shiftCards[i]] == 1) {
            tipList.push([cards[i], classifyList[1][0], classifyList[1][1]]);
          }
        }
      }
      cc.log("3张提示:", tipList)
      return tipList
    },

    getSerialTripleTips:function(tripleNum, min_card){
      tripleNum = tripleNum || 3
      min_card = min_card || 0
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列

      //区分大王和其他
      var classifyList = cutil.classifyCards(cards)
      var bigJokerNum = classifyList[1].length

      var card2ListDict = cutil.getCard2ListDict(cards)

      var tipList = []
      // 先不考虑 大王的替换
      for (var i = min_card + 3; i <= 14 - tripleNum + 1; i++) {
        var isHasSerialTriple = true;
        for (var j = 0; j < tripleNum; j++) {
          if (!card2ListDict[i+j] || card2ListDict[i+j].length < 3) {
            isHasSerialTriple = false;
          }
        }
        if (isHasSerialTriple) {
          var suggestList = []
          for (var j = 0; j < tripleNum; j++) {
            suggestList.push(card2ListDict[i+j][0])
            suggestList.push(card2ListDict[i+j][1])
            suggestList.push(card2ListDict[i+j][2])
          }
          tipList.push(suggestList)
        }
      }
      //考虑大王的替换
      if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1 && cutil.getJokerNum(cards) < 3) {
        for (var i = min_card + 3; i <= 14 - tripleNum + 1; i++) {
          var useNum = bigJokerNum
          var isHasSerialTriple = true;
          for (var j = 0; j < tripleNum; j++) {
            if (!card2ListDict[i+j]) {
              useNum -= 3;
            }else if (card2ListDict[i+j].length == 1) {
              useNum -= 2;
            }else if (card2ListDict[i+j].length == 2) {
              useNum -= 1;
            }
            if (useNum < 0) {
              isHasSerialTriple = false
              break;
            }
          }
          if (isHasSerialTriple) {
            var suggestList = []
            for (var j = 0; j < tripleNum; j++) {
              if (card2ListDict[i+j]) {
                if (card2ListDict[i+j][0]) {
                  suggestList.push(card2ListDict[i+j][0])
                }
                if (card2ListDict[i+j][1]) {
                  suggestList.push(card2ListDict[i+j][1])
                }
                if (card2ListDict[i+j][2]) {
                  suggestList.push(card2ListDict[i+j][2])
                }
              }
            }
            var isContain = false
            for (var k = 0; k < tipList.length; k++) {
              if (suggestList[0] == tipList[k][0]) {
                isContain = true
                break
              }
            }
            if (isContain) {
              continue;
            }
            for (var x = 0; x < bigJokerNum-useNum; x++) {
              suggestList.push(const_val.JOKER[1])
            }
            tipList.push(suggestList)
          }
        }
      }
      cc.log("连3对提示:", tipList)
      return tipList
    },

    getSingelSerialTips:function(serialNum, min_card){
      // 先不考虑 大王的替换
      serialNum = serialNum || 5
      min_card = min_card || 2
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列
      var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
      var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)

      var card2ListDict = cutil.getCard2ListDict(cards)
      
      //区分大王和其他
      var classifyList = cutil.classifyCards(cards)
      var bigJokerNum = classifyList[1].length

      var tipList = []
      for (var i = min_card + 1; i <= 14 - serialNum + 1; i++) {
        isHasSerialPair = true
        for (var j = 0; j < serialNum; j++) {
          if (!card2ListDict[i+j] || card2ListDict[i+j].length < 1) {
            isHasSerialPair = false;
          }
        }
        if (isHasSerialPair) {
          var suggestList = []
          for (var j = 0; j < serialNum; j++) {
            suggestList.push(card2ListDict[i+j][0])
          }
          tipList.push(suggestList)
        }
      }
      //考虑大王的替换
      if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1 && cutil.getJokerNum(cards) < 3) {
        for (var i = min_card + 1; i <= 14 - serialNum + 1; i++) {
          var useNum = bigJokerNum
          var isHasSerialPair = true;
          for (var j = 0; j < serialNum; j++) {
            if (!card2ListDict[i+j] || card2ListDict[i+j].length < 1) {
              useNum -= 1;
            }
            if (useNum < 0) {
              isHasSerialPair = false;
              break;
            }
          }
          if (isHasSerialPair) {
            var num = 0
            var suggestList = []
            for (var j = 0; j < serialNum; j++) {
              if (card2ListDict[i+j]) {
                suggestList.push(card2ListDict[i+j][0])
              }
            }
            var isContain = false
            for (var k = 0; k < tipList.length; k++) {
              if (suggestList[0] == tipList[k][0]) {
                isContain = true
                break
              }
            }
            if (isContain) {
              continue;
            }
            for (var x = 0; x < bigJokerNum-useNum; x++) {
              suggestList.push(const_val.JOKER[1])
            }
            tipList.push(suggestList)
          }
        }
      }
      cc.log("顺子提示:",tipList)
      return tipList
    },

    getBombTips:function(bombCards){
    
      var bombList = this.getBomb()
      cc.log(bombList)
      var normalBombDict = bombList[0]
      var threeJokerList = bombList[1]
      var fourJokerList = bombList[2]
      var serialJokerDict = bombList[3]
      var rankBombList = []
      for (var i = 4; i < 6; i++) {
        if (serialJokerDict[i]) {
          rankBombList = rankBombList.concat(normalBombDict[i])
        }
        if (normalBombDict[i]) {
          rankBombList = rankBombList.concat(normalBombDict[i])
        }
      }
      if (threeJokerList.length > 0) {
        rankBombList = rankBombList.concat(threeJokerList)
      }

      if (serialJokerDict[6]) {
        rankBombList = rankBombList.concat(serialJokerDict[6])
      }

      if (normalBombDict[6]) {
        rankBombList = rankBombList.concat(normalBombDict[6])
      }

      if (fourJokerList.length > 0) {
        rankBombList = rankBombList.concat(fourJokerList)
      }

      if (serialJokerDict[7]) {
        rankBombList = rankBombList.concat(serialJokerDict[7])
      }

      if (normalBombDict[7]) {
        rankBombList = rankBombList.concat(normalBombDict[7])
      }

      for (var i = 8; i < 12; i++) {
        if (serialJokerDict[i]) {
          rankBombList = rankBombList.concat(serialJokerDict[i])
        }
        if (normalBombDict[i]) {
          rankBombList = rankBombList.concat(normalBombDict[i])
        }
      }

      if (!bombCards || bombCards.length <= 0) {
        cc.log("炸弹提示", rankBombList)
        return rankBombList
      }
      var suggestList = []
      for (var i = 0; i < rankBombList.length; i++) {
        var resultList = this.canPlayCards(rankBombList[i])
        if (resultList[0]) {
          suggestList.push(rankBombList[i])
        }
      }
      cc.log("炸弹提示", suggestList)
      return suggestList
    },

    // getTipsCards:function(){ //牌型提示
    //   //手牌
    //   var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
    //   cards.sort(function(a,b){return a-b;})        //从小到大排列
    //   var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
    //   var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)
    //   var shiftCardsKeyList = cutil.getKeyList(shiftCards2NumDict)
    //   //上次出牌
    //   var lastDiscards = cutil.rightShiftCards(this.curGameRoom.controller_discard_list)
    //   var lastDiscardType = cutil.getNormalCardsType(lastDiscards)
    //   //区分大王和其他
    //   var classifyList = cutil.classifyCards(cards)
    //   var bigJokerNum = classifyList[1].length

    //   //手上没有牌
    //   if (cards.length <= 0) {return [];}

    //   //自由出牌
    //   if (this.curGameRoom.controllerIdx == this.serverSeatNum) { //自由出牌 //出最小的单张
    //     return [Math.min.apply(null, cards)];
    //   }
    //   //优先出类型一致的
    //   if (lastDiscardType == 2) {                                 //单张 出 比它稍大的
    //     cc.log("单张提示")
    //     for (var i = 0; i < shiftCards.length; i++) {
    //       if (shiftCards[i] > lastDiscards[0] && shiftCards2NumDict[shiftCards[i]] == 1) {
    //         return [cards[i]];
    //       }
    //     }
    //   }else if (lastDiscardType == 3) {                           //对子 出 比它稍大的
    //     //有对子
    //     cc.log("对子提示")    
    //     for (var i = 0; i < shiftCards.length - 1; i++) {
    //       if (shiftCards[i] == shiftCards[i+1] && shiftCards[i] > lastDiscards[0] && shiftCards2NumDict[shiftCards[i]] <= 3) {
    //         return [cards[i], cards[i+1]];
    //       }
    //     }
    //     //有王 加单张
    //     if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1) {
    //       for (var i = 0; i < shiftCards.length; i++) {
    //         if (shiftCards[i] > lastDiscards[0] && shiftCards[i] != const_val.JOKER[1] >> 3 && shiftCards2NumDict[shiftCards[i]] == 1) {
    //           return [cards[i], cards[cards.length - 1]];
    //         }
    //       }
    //     } 
    //   }else if (lastDiscardType == 4) {                           //连对
    //     cc.log("连对提示")
    //     var pairNum = lastDiscards.length/2
    //     // 先不考虑 大王的替换
    //     for (var i = lastDiscards[0] + 1; i <= 14 - pairNum + 1; i++) {
    //       var isHasSerialPair = true;
    //       for (var j = 0; j < pairNum; j++) {
    //         if (!shiftCards2NumDict[i+j] || shiftCards2NumDict[i+j] < 2) {
    //           isHasSerialPair = false;
    //         }
    //       }
    //       if (isHasSerialPair) {
    //         var num = 0
    //         var suggestList = []
    //         for (var k = 0; k < cards.length-1; k++) {
    //           if ((cards[k] >> 3) == (cards[k +1] >> 3) && (cards[k] >> 3) == i+num) {
    //             num += 1
    //             suggestList.push(cards[k])
    //             suggestList.push(cards[k+1])
    //           }
    //           if (num >= pairNum) {
    //             return suggestList;
    //           }
    //         }
    //         return suggestList
    //       }
    //     }
    //     //考虑大王的替换
    //     if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1) {
    //       for (var i = lastDiscards[0] + 1; i <= 14 - pairNum + 1; i++) {
    //         var useNum = bigJokerNum
    //         var isHasSerialPair = true;
    //         for (var j = 0; j < pairNum; j++) {
    //           if (!shiftCards2NumDict[i+j]) {
    //             useNum -= 2;
    //           }
    //           if (shiftCards2NumDict[i+j] == 1) {
    //             useNum -= 1;
    //           }
    //           if (useNum < 0) {
    //             isHasSerialPair = false
    //             break;
    //           }
    //         }
    //         if (isHasSerialPair) {
    //           var num = 0
    //           var suggestList = []
    //           for (var k = 0; k < cards.length; k++) {
    //             if (!shiftCards2NumDict[i+num]) {
    //               num += 1
    //               suggestList.push(const_val.JOKER[1])
    //               suggestList.push(const_val.JOKER[1])
    //             }else if ((cards[k] >> 3) == i+num && (!cards[k+1] || (cards[k] >> 3) != (cards[k+1] >> 3) )) {
    //               num += 1
    //               suggestList.push(cards[k])
    //               suggestList.push(const_val.JOKER[1])
    //             }else if ((cards[k] >> 3) == (cards[k+1] >> 3) && (cards[k] >> 3) == i+num) {
    //               num += 1
    //               suggestList.push(cards[k])
    //               suggestList.push(cards[k+1])
    //             }
    //             if (num >= pairNum) {
    //               return suggestList;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }else if (lastDiscardType == 5) {                           //三张
    //     cc.log("三张提示")
    //     for (var i = 0; i < shiftCards.length - 2; i++) {
    //       if (shiftCards[i] == shiftCards[i+1] && shiftCards[i+1] == shiftCards[i+2] && shiftCards[i] > lastDiscards[0] && shiftCards2NumDict[shiftCards[i]] < 4) {
    //         cc.log(cards[i], cards[i+1], cards[i+2])
    //         return [cards[i], cards[i+1], cards[i+2]];
    //       }
    //     }
    //     if (bigJokerNum >= 1 && this.curGameRoom.room_mode == 1) {
    //       for (var i = 0; i < shiftCards.length - 1; i++) {
    //         if (shiftCards[i] == shiftCards[i+1]  && shiftCards[i] > lastDiscards[0] && shiftCards[i] != classifyList[1][0]>>3 && shiftCards2NumDict[shiftCards[i]] < 4) {
    //           return [cards[i], cards[i+1], classifyList[1][0]];
    //         }
    //       }
    //     }
    //     if (bigJokerNum >= 2 && this.curGameRoom.room_mode == 1) {
    //       for (var i = 0; i < shiftCards.length; i++) {
    //         if (shiftCards[i]  && shiftCards[i] > lastDiscards[0] && shiftCards[i] != classifyList[1][0]>>3 && shiftCards2NumDict[shiftCards[i]] < 4) {
    //           return [cards[i], classifyList[1][0], classifyList[1][0]];
    //         }
    //       }
    //     }
    //   }else if (lastDiscardType == 6) {                           //连三张
    //     cc.log("连三张提示")
    //     var tripleNum = lastDiscards.length/3
    //     // 先不考虑 大王的替换
    //     for (var i = lastDiscards[0] + 1; i <= 14 - tripleNum + 1; i++) {
    //       var isHasSerialTriple = true;
    //       for (var j = 0; j < tripleNum; j++) {
    //         if (!shiftCards2NumDict[i+j] || shiftCards2NumDict[i+j] < 3) {
    //           isHasSerialTriple = false;
    //         }
    //       }
    //       if (isHasSerialTriple) {
    //         var num = 0
    //         var suggestList = []
    //         for (var k = 0; k < cards.length-2; k++) {
    //           if ((cards[k] >> 3) == (cards[k +1] >> 3) && (cards[k] >> 3) == (cards[k+2] >> 3) && (cards[k] >> 3) == i+num) {
    //             num += 1
    //             suggestList.push(cards[k])
    //             suggestList.push(cards[k+1])
    //             suggestList.push(cards[k+2])
    //           }
    //           if (num >= tripleNum) {
    //             return suggestList;
    //           }
    //         }
    //       }
    //     }
    //     //考虑大王的替换
    //     if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1) {
    //       for (var i = lastDiscards[0] + 1; i <= 14 - tripleNum + 1; i++) {
    //         var useNum = bigJokerNum
    //         var isHasSerialTriple = true;
    //         for (var j = 0; j < pairNum; j++) {
    //           if (!shiftCards2NumDict[i+j]) {
    //             useNum -= 3;
    //           }
    //           if (shiftCards2NumDict[i+j] == 1) {
    //             useNum -= 2;
    //           }
    //           if (shiftCards2NumDict[i+j] == 2) {
    //             useNum -= 1;
    //           }
    //           if (useNum < 0) {
    //             isHasSerialTriple = false
    //             break;
    //           }
    //         }
    //         if (isHasSerialTriple) {
    //           var num = 0
    //           var suggestList = []
    //           for (var k = 0; k < cards.length; k++) {
    //             if (!shiftCards2NumDict[i+num]) { //这种条件不存在, 最多只有两个王
    //               num += 1
    //               suggestList.push(const_val.JOKER[1])
    //               suggestList.push(const_val.JOKER[1])
    //               suggestList.push(const_val.JOKER[1])
    //             } else if ((cards[k] >> 3) == i+num && (!cards[k+1] || (cards[k] >> 3) != (cards[k+1] >> 3) ) && (!cards[k+2] || (cards[k] >> 3) != (cards[k+2] >> 3) )) {
    //               num += 1
    //               suggestList.push(cards[k])
    //               suggestList.push(const_val.JOKER[1])
    //               suggestList.push(const_val.JOKER[1])
    //             } else if ((cards[k] >> 3) == i+num && (cards[k+1] && (cards[k] >> 3) == (cards[k+1] >> 3) ) && (!cards[k+2] || (cards[k] >> 3) != (cards[k+2] >> 3) )) {
    //               num += 1
    //               suggestList.push(cards[k])
    //               suggestList.push(cards[k+1])
    //               suggestList.push(const_val.JOKER[1])
    //             } else if ((cards[k] >> 3) == i+num && (cards[k+1] && (cards[k] >> 3) == (cards[k+1] >> 3) ) && (cards[k+2] && (cards[k] >> 3) == (cards[k+2] >> 3) )) {
    //               num += 1
    //               suggestList.push(cards[k])
    //               suggestList.push(cards[k+1])
    //               suggestList.push(cards[k+2])
    //             }
    //             if (num >= tripleNum) {
    //               return suggestList;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }else if (lastDiscardType == 7) {                           //顺子
    //     // 先不考虑 大王的替换
    //     cc.log("顺子提示")
    //     for (var i = lastDiscards[0] + 1; i <= 14 - lastDiscards.length + 1; i++) {
    //       isHasSerialPair = true
    //       for (var j = 0; j < lastDiscards.length; j++) {
    //         if (!shiftCards2NumDict[i+j] || shiftCards2NumDict[i+j] < 1) {
    //           isHasSerialPair = false;
    //         }
    //       }
    //       if (isHasSerialPair) {
    //         var num = 0
    //         var suggestList = []
    //         for (var k = 0; k < cards.length; k++){
    //           if ((cards[k] >> 3) == i+num) {
    //             num += 1
    //             suggestList.push(cards[k])
    //           }
    //           if (num >= lastDiscards.length) {
    //             return suggestList;
    //           }
    //         }
    //       }
    //     }
    //     //考虑大王的替换
    //     if (bigJokerNum > 0 && this.curGameRoom.room_mode == 1) {
    //       for (var i = lastDiscards[0] + 1; i <= 14 - lastDiscards.length + 1; i++) {
    //         var useNum = bigJokerNum
    //         var isHasSerialPair = true;
    //         for (var j = 0; j < lastDiscards.length; j++) {
    //           if (!shiftCards2NumDict[i+j] || shiftCards2NumDict[i+j] < 1) {
    //             useNum -= 1;
    //           }
    //           if (useNum < 0) {
    //             isHasSerialPair = false;
    //             break;
    //           }
    //         }
    //         if (isHasSerialPair) {
    //           var num = 0
    //           var suggestList = []
    //           for (var k = 0; k < cards.length; k++) {
    //             if (!shiftCards2NumDict[i+num]) {
    //               num += 1
    //               suggestList.push(const_val.JOKER[1])
    //             } else if (shiftCards2NumDict[i+num] < 1) {
    //               num += 1
    //               suggestList.push(const_val.JOKER[1])
    //             } else if ((cards[k] >> 3) == i+num) {
    //               suggestList.push(const_val.JOKER[1])
    //             }
    //             if (num >= lastDiscards.length) {
    //               return suggestList;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }else if (lastDiscardType == 8 || lastDiscardType == 9 || lastDiscardType == 10 || lastDiscardType == 11) { //炸弹
    //     cc.log("炸弹提示")
    //      return this.getLargerBomb(lastDiscards, lastDiscardType)
    //   }
      
    //   cc.log("对方不是炸弹且没有对应牌型 有炸弹")
    //   var bombList = this.getBomb()
    //   var normalBombDict = bombList[0]
    //   var threeJokerList = bombList[1]
    //   var fourJokerList = bombList[2]
    //   var serialJokerDict = bombList[3]
    //   for (var line in normalBombDict) {
    //     if (normalBombDict[line].length > 0) {
    //       return normalBombDict[line][0]
    //     }
    //   }
    //   for (var i = 0; i < threeJokerList.length; i++) {
    //     return threeJokerList[i]
    //   }
    //   for (var i = 0; i < fourJokerList.length; i++) {
    //     return fourJokerList[i]
    //   }
    //   for (var line in serialJokerDict) {
    //     if (serialJokerDict[line].length > 0) {
    //       return serialJokerDict[line][0]
    //     }
    //   }
      
    //   //若没有合适牌型 但是有炸弹 
    //   return []
    // },

    getLargerBomb:function(lastRightShiftDiscards, bombType){
      cc.log("更大的牌:",lastRightShiftDiscards, bombType)
      var bombList = this.getBomb()
      var normalBombDict = bombList[0]
      var threeJokerList = bombList[1]
      var fourJokerList = bombList[2]
      var serialJokerDict = bombList[3]
      cc.log(bombList)
      if (bombType == 8) {
        var bombLine = lastRightShiftDiscards.length
        //同样线数
        for (var i = bombLine; i <= 11; i++) {
          if (bombLine < 6 && i == 6 && threeJokerList.length > 0) {
            return threeJokerList[0]
          }

          if (bombLine < 7 && i == 6 && fourJokerList.length > 0) {
            return fourJokerList[0]
          }

          if (normalBombDict[i] && normalBombDict[i].length > 0) {
            if (i == bombLine ) {
              for (var j = 0; j < normalBombDict[i].length; j++) {
                if (normalBombDict[i][j][0] >> 3 > lastRightShiftDiscards[0]) {
                  return normalBombDict[i][j]
                }
              }
            }else{
              return normalBombDict[i][0]
            }
          }

          if (serialJokerDict[i+1] && serialJokerDict[i+1].length > 0) {
            return serialJokerDict[i+1][0]
          }
        }
      } else if (bombType == 9) {
        for (var i = 6; i <= 11; i++){
          if (bombLine == 7 && fourJokerList.length > 0) {
            return fourJokerList[0]
          }

          if (normalBombDict[i] && normalBombDict[i].length > 0){
            return normalBombDict[i][0]
          }

          if (serialJokerDict[i] && serialJokerDict[i].length > 0) {
            return serialJokerDict[i][0]
          }
        }
      } else if (bombType == 10) {
        for (var i = 7; i <= 11; i++){
          if (normalBombDict[i] && normalBombDict[i].length > 0){
            return normalBombDict[i][0]
          }

          if (serialJokerDict[i] && serialJokerDict[i].length > 0) {
            return serialJokerDict[i][0]
          }
        }
      } else if (bombType == 11) {
        var shiftCards2NumDict = cutil.getCard2NumDict(lastRightShiftDiscards)
        var bombLine = Object.keys(shiftCards2NumDict).length + lastRightShiftDiscards.length/Object.keys(shiftCards2NumDict).length
        for (var i = bombLine; i <= 11; i++){

          if (bombLine < 6 && i == 6 && threeJokerList.length > 0) {
            return threeJokerList[0]
          }

          if (bombLine < 7 && i == 6 && fourJokerList.length > 0) {
            return fourJokerList[0]
          }

          if (normalBombDict[i] && i > bombLine && normalBombDict[i].length > 0){
            return normalBombDict[i][0]
          }

          if (serialJokerDict[i] && serialJokerDict[i].length > 0) {
            if (i == bombLine) {
              for (var j = 0; j < serialJokerDict[i].length; j++) {
                var classifyCards = cutil.classifyCards(cutil.rightShiftCards(serialJokerDict[i][j]))
                if (classifyCards[1].length > 0 && cutil.cmpSameLineSerialBomb(lastRightShiftDiscards,  cutil.makeCard(serialJokerDict[i][j], 111), 11)) {
                  return serialJokerDict[i][j]
                }else if (cutil.cmpSameLineSerialBomb(lastRightShiftDiscards,  cutil.rightShiftCards(serialJokerDict[i][j]))) {
                  return serialJokerDict[i][j]
                }
                // var makeCard = cutil.makeCard(classifyCards[0], classifyCards[1], )
              }
            }
            return serialJokerDict[i][0]
          }
        }
      }
      return []
    },

    getBomb:function(){
      var cards = cutil.deepCopy(this.curGameRoom.playerPokerList[this.serverSeatNum])
      cards.sort(function(a,b){return a-b;})        //从小到大排列
      var shiftCards = cutil.rightShiftCards(cards) //右移后手牌
      var shiftCards2NumDict = cutil.getCard2NumDict(shiftCards)
      var shiftCardsKeyList = cutil.getKeyList(shiftCards2NumDict)

      var shiftCards2CardsDict = {}
      var smallJokerNum = 0;
      var bigJokerNum = 0;
      for (var i = 0; i < cards.length; i++) {
        if (const_val.JOKER.indexOf(cards[i]) == 0) {
          smallJokerNum += 1;
        } else if (const_val.JOKER.indexOf(cards[i]) == 1) {
          bigJokerNum += 1;
        } else{
          var shift = cards[i] >> 3
          if (!shiftCards2CardsDict[shift]) {
            shiftCards2CardsDict[shift] = []
          }
          shiftCards2CardsDict[shift].push(cards[i])
        }
      }
      //普通炸弹
      var normalBombDict = {}
      for (var shiftCard in shiftCards2CardsDict) {
        var cards = shiftCards2CardsDict[shiftCard]
        var line = cards.length
        if (line < 4) {continue;}
        if (!normalBombDict[line]) {
          normalBombDict[line] = []
        }
        normalBombDict[line].push(cards.concat([]))
      }
      
      //三王炸
      var threeJokerList = []
      if (smallJokerNum + bigJokerNum >= 3) {
        if (smallJokerNum == 2) {
          threeJokerList.push([const_val.JOKER[0], const_val.JOKER[0], const_val.JOKER[1]])
        }
        if (bigJokerNum == 2) {
          threeJokerList.push([const_val.JOKER[0], const_val.JOKER[1], const_val.JOKER[1]])
        }
      }
      //四王炸
      var fourJokerList = []
      if (smallJokerNum + bigJokerNum >= 4) {
        fourJokerList.push([const_val.JOKER[0], const_val.JOKER[0], const_val.JOKER[1], const_val.JOKER[1]])
      }
      //连炸
      var serialJokerDict = {}
      if (shiftCards2CardsDict[const_val.CARD2] && shiftCards2CardsDict[const_val.CARD2].length >= 4) { //包含2
        var tryList = []
        var minLen = shiftCards2CardsDict[const_val.CARD2].length
        for (var i = 0; i < const_val.CIRCLE.length; i++){
          if (!shiftCards2CardsDict[const_val.CIRCLE[i]]) {break;}
          var len = shiftCards2CardsDict[const_val.CIRCLE[i]].length
          if (len < 4) {break}
          tryList.push(shiftCards2CardsDict[const_val.CIRCLE[i]].concat([]))
          minLen =  len < minLen ? len : minLen;
        }

        for (var i = const_val.CIRCLE.length - 1; i >= 0; i--) {
          if (!shiftCards2CardsDict[const_val.CIRCLE[i]]) {break;}
          var len = shiftCards2CardsDict[const_val.CIRCLE[i]].length
          if (len < 4) {break}
          tryList.splice(0, 0, shiftCards2CardsDict[const_val.CIRCLE[i]].concat([]))
          // tryList.splice(0, 0, shiftCards2CardsDict[const_val.CIRCLE[i]].concat([]))
          minLen =  len < minLen ? len : minLen; 
        }
        if (tryList.length > 3) {
          var result = []
          for (var i = 0; i < tryList.length; i++) {
            while(tryList[i].length > minLen){
              tryList[i].pop()
            }
            result = result.concat(tryList[i])
          }
          var line = minLen + tryList.length
          if (!serialJokerDict[line]) {
            serialJokerDict[line] = []
          }
          serialJokerDict[line].push(result)
        }
      }

      var index = 0
      var tryList = []
      while(index < const_val.CIRCLE.length){
        if (!shiftCards2CardsDict[const_val.CIRCLE[index]] || shiftCards2CardsDict[const_val.CIRCLE[index]].length < 4) {
          if (tryList.length >= 3) {
            //求最小长度
            var minLen = 0
            for (var j = 0; j < tryList.length; j++) {
              if (minLen == 0 || tryList[j].length < minLen) {
                minLen = tryList[j].length
              }
            }
            var result = []
            for (var j = 0; j < tryList.length; j++){
              while(tryList[j].length > minLen){
                tryList[j].pop();
              }
              result = result.concat(tryList[j])
            }
            var line = minLen + tryList.length
            if (!serialJokerDict[line]) {
              serialJokerDict[line] = []
            }
            serialJokerDict[line].push(result)
            index += tryList.length
          } else {
            index += 1
          }
          tryList = []
          continue;
        }
        tryList.push(shiftCards2CardsDict[const_val.CIRCLE[index]].concat([]))
        index += 1
      }
    
      if (this.curGameRoom.room_mode == 1 && bigJokerNum > 0) { //考虑大王的替换
        //普通炸弹
        for (var shiftCard in shiftCards2CardsDict) {
          var cards = shiftCards2CardsDict[shiftCard]
          var line = cards.length
          if (line < 4 - bigJokerNum) {continue;}
          
          for (var i = 1; i <= bigJokerNum; i++) {
            if (line+i < 4) {continue}
            var groupCards = shiftCards2CardsDict[shiftCard]
            for (var j= 0; j < i; j++) {
              groupCards = groupCards.concat([const_val.JOKER[1]])
            }
            // cards = cards.concat([const_val.JOKER[1]])
            if (!normalBombDict[line+i]) {
              normalBombDict[line+i] = []
            }
            normalBombDict[line+i].push(groupCards)
          }
        }
        //连炸
        if (shiftCards2CardsDict[const_val.CARD2] && shiftCards2CardsDict[const_val.CARD2].length >= 2) { //包含2
          var rightTryList = []
          var useNum = bigJokerNum
          for (var i = 0; i < const_val.CIRCLE.length; i++){ //往前
            if (!shiftCards2CardsDict[const_val.CIRCLE[i]]) {break;}
            var len = shiftCards2CardsDict[const_val.CIRCLE[i]].length
            if (len < 4) {
              useNum -= 4 - len
            }
            if (useNum < 0) {
              break
            }
            rightTryList.push(shiftCards2CardsDict[const_val.CIRCLE[i]].concat([]))
          }
          var leftTryList = []
          var useNum = bigJokerNum;
          for (var i = const_val.CIRCLE.length - 1; i >= 0; i--) {
            if (!shiftCards2CardsDict[const_val.CIRCLE[i]]) {break;}
            var len = shiftCards2CardsDict[const_val.CIRCLE[i]].length
            if (len < 4) {
              useNum -= 4 - len
            }
            if (useNum < 0) {
              break
            }
            leftTryList.splice(0,0,shiftCards2CardsDict[const_val.CIRCLE[i]].concat([]))
          }

          var useNum = bigJokerNum - (4 - shiftCards2CardsDict[const_val.CARD2].length)
          var tryList = [leftTryList.pop()]
          while(useNum > 0){
            if (rightTryList.length > 0 && leftTryList.length > 0) {
              var right = rightTryList.pop()
              var left = leftTryList.pop()
              var rightNeed = 4-right.length > 0 ? 4-right.length : 0
              var leftNeed = 4-left.length > 0 ? 4-left.length : 0

              if (rightNeed <= leftNeed) {
                if (useNum - rightNeed < 0) {
                  break
                }
                useNum -= rightNeed
                tryList.push(right)
                if (useNum - leftNeed < 0) {
                  break
                }
                useNum -= leftNeed
                tryList.splice(0, 0, left)
              }else if (rightNeed > leftNeed) {
                if (useNum - leftNeed < 0) {
                  break
                }
                useNum -= leftNeed
                tryList.splice(0, 0, left)

                if (useNum - rightNeed < 0) {
                  break
                }
                useNum -= rightNeed
                tryList.push(right)
              }
            } else if (rightTryList.length > 0) {
              var right = rightTryList.pop()
              var rightNeed = 4-right.length > 0 ? 4-right.length : 0
              if (useNum - rightNeed < 0) {
                break
              }
              useNum -= rightNeed
              tryList.push(right)
            } else if (leftTryList.length > 0) {
              var left = leftTryList.pop()
              var leftNeed = 4-left.length > 0 ? 4-left.length : 0
              if (useNum - leftNeed < 0) {
                break
              }
              useNum -= leftNeed
              tryList.push(left)
            }else{
              break
            }
          }

          if (tryList.length >= 3) {
            //求最小长度
            var minLen = 0
            for (var j = 0; j < tryList.length; j++) {
              if (minLen == 0 || tryList[j].length < minLen) {
                minLen = tryList[j].length
              }
            }
            var result = []
            for (var j = 0; j < tryList.length; j++){
              while(tryList[j].length > minLen){
                tryList[j].pop();
              }
              result = result.concat(tryList[j])
            }
            for (var i = 0; i < bigJokerNum - useNum; i++) {
              result.push(const_val.JOKER[1])
            }
            var line = minLen + tryList.length
            if (!serialJokerDict[line]) {
              serialJokerDict[line] = []
            }
            serialJokerDict[line].push(result)
          }
          // cutil.checkIsJokerSerialBomb(cardsButJoker, jokers)
        }

        var index = 0
        var useNum = bigJokerNum
        var tryList = []
        while(index < const_val.CIRCLE.length && useNum >= 0){
          if (!shiftCards2CardsDict[const_val.CIRCLE[index]] || 4 - shiftCards2CardsDict[const_val.CIRCLE[index]].length > useNum) {
            if (tryList.length >= 3) {
              //求最小长度
              var minLen = 0
              for (var j = 0; j < tryList.length; j++) {
                if (minLen == 0 || tryList[j].length < minLen) {
                  minLen = tryList[j].length
                }
                if (minLen < 4) {
                  minLen = 4
                }
              }
              var result = []
              for (var j = 0; j < tryList.length; j++){
                while(tryList[j].length > minLen){
                  tryList[j].pop();
                }
                result = result.concat(tryList[j])
              }
              for (var i = 0; i < bigJokerNum - useNum; i++) {
                result.push(const_val.JOKER[1])
              }
              var line = minLen + tryList.length
              if (!serialJokerDict[line]) {
                serialJokerDict[line] = []
              }
              serialJokerDict[line].push(result)
              index += tryList.length
            } else {
              index += 1
            }
            tryList = []
            continue;
          }
          tryList.push(shiftCards2CardsDict[const_val.CIRCLE[index]].concat([]))
          if (shiftCards2CardsDict[const_val.CIRCLE[index]].length < 4) {
            useNum -= 4-shiftCards2CardsDict[const_val.CIRCLE[index]].length;
          }
          index += 1
        }
      }

      return [normalBombDict, threeJokerList, fourJokerList, serialJokerDict]
    },

  	canPlayCards:function(cards){
  		//不能为空
  		if (!cards || cards.length <= 0) {
  			cc.log("牌不能为空")
  			return [false, cards];
  		}
  		//是否轮到自己出牌
  		if (this.curGameRoom.waitIdx != this.serverSeatNum) {
    		cc.log("没轮到自己出牌")
    		return [false, cards];
    	}
  		//是否有这些牌
  		if (!this.checkHasCards(cards)) {
  			cc.log("手上没有全部牌:", cards, this.curGameRoom.playerPokerList[this.serverSeatNum])
  			return [false, cards];
  		}
      //测试
      // this.curGameRoom.controller_discard_list = [97,97,98,98, 105,105,106,106, 113,113,114,114]
      // cards = [97,97,98,98, 113,113,114, 129,129,130, 153, 153, 153, 153, 153, 153]

  		if (this.canPlayNormalCards(cards)) {
  			cc.log("玩家normal出牌", cards)
  			return [true, cards];
  		} else if (this.curGameRoom.room_mode == 1) {
  			var classifyList = cutil.classifyCards(cards)
    		var notJokerShift = cutil.rightShiftCards(classifyList[0])
    		var jokerShift = cutil.rightShiftCards(classifyList[1])
        cc.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
        cc.log(classifyList, notJokerShift, jokerShift)
        cc.log(cutil.getInsteadCardsType(notJokerShift, jokerShift))
        cc.log("yyyyyyyyyyyyyyyyyyyyyyy")
  			var makeDiscardPoker = cutil.makeCard(cards, cutil.getInsteadCardsType(notJokerShift, jokerShift))
        cc.log("检查是否癞子出牌",cards, makeDiscardPoker, cutil.getInsteadCardsType(notJokerShift, jokerShift))
  			if (this.canPlayNormalCards(makeDiscardPoker)) {
  				cc.log("玩家instead出牌")
  				return [true, makeDiscardPoker];
  			}
  		}
  		return [false, cards];
  	},

  	checkHasCards:function(cards){
  		var cards2NumDict = cutil.getCard2NumDict(cards)
    	var playerCards2NumDict = cutil.getCard2NumDict(this.curGameRoom.playerPokerList[this.serverSeatNum])
		for (var card in cards2NumDict) {
			if (!playerCards2NumDict[card] || cards2NumDict[card] > playerCards2NumDict[card]) {
				return false
			}
		}
		return true
  	},

    canPlayNormalCards:function(cards){
    	cc.log("canPlayNormalCards:",cards)
    	var playerTransferCards = cutil.rightShiftCards(cards)
    	var controllerDiscardTransferCards = cutil.rightShiftCards(this.curGameRoom.controller_discard_list)
  		var playerCardsType = cutil.getNormalCardsType(playerTransferCards)
  		cc.log("上次的牌:", controllerDiscardTransferCards, "出的牌:", playerTransferCards, "出牌类型:", playerCardsType)
  		if (playerCardsType == 0 || playerCardsType == 1) {
  			cc.log("牌型不正确")
  			return false
  		} 
  		//自由出牌
  		if (this.curGameRoom.controllerIdx == this.serverSeatNum) { //其他玩家要不起 或 该局第一次出牌 牌出完 controllerIdx转移到对家
  			cc.log("玩家自由出牌")
  			return true
  		}

  		//压过上家
  		var controllerCardsType = cutil.getNormalCardsType(controllerDiscardTransferCards)
      cc.log("controllerCardsType",controllerCardsType)
  		if (controllerCardsType == playerCardsType) {
  			cc.log("5656565656")
  			var result = cutil.cmpSameTypeCards(controllerDiscardTransferCards, playerTransferCards, playerCardsType)
  			cc.log(result)
  			return result
  		} else{
        if (controllerCardsType < 8 && playerCardsType < 8) {
          return false
        } else if (controllerCardsType < 8 && playerCardsType >= 8) {
          return true
        } else if (playerCardsType < 8 && controllerCardsType >= 8) {
          return false
        }

        var selBombLine = 0;
        var contrBombLine = 0;
        if (playerCardsType == 8) {
          selBombLine = cards.length
        } else if (playerCardsType == 9) {
          selBombLine = 6
        } else if (playerCardsType == 10) {
          selBombLine = 7
        } else {
          selBombLine = cutil.getSerialBombLine(cutil.rightShiftCards(cards))
        }

        if (controllerCardsType == 8) {
          contrBombLine = this.curGameRoom.controller_discard_list.length;
        } else if (controllerCardsType == 9) {
          contrBombLine = 6;
        } else if (controllerCardsType == 10) {
          contrBombLine = 7;
        } else {
          contrBombLine = cutil.getSerialBombLine(cutil.rightShiftCards(this.curGameRoom.controller_discard_list))
        }
        cc.log("====selBombLine=======contrBombLine==>:", selBombLine, contrBombLine)

        if (selBombLine > contrBombLine) {
          return true
        } else if (selBombLine < contrBombLine) {
          return false
        } else {
          if (playerCardsType == 8 && controllerCardsType == 11) {
            return true
          }else if (playerCardsType == 11 && controllerCardsType == 8) {
            return false
          }
          if (cards.length > this.curGameRoom.controller_discard_list.length) {
            return true
          }
        }
  			// if (playerCardsType == 9) {
  			// 	cc.log("6666666")
  			// 	return true
  			// } else if (playerCardsType == 8) {
  			// 	cc.log("77777777")
  			// 	return true
  			// }
  		}
  		cc.log("8888888")
      return false
    },
});
