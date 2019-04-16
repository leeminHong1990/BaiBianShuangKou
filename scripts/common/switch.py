# -*- coding: utf-8 -*-


PUBLISH_VERSION = 0

DEBUG_BASE = 1

PHP_SERVER_URL = 'http://10.0.0.4:9981/api/'
PHP_SERVER_SECRET = "zDYnetiVvFgWCRMIBGwsAKaqPOUjfNXS"

#计算消耗
def calc_cost(game_round, room_mode):
	return (1, game_round * 5)