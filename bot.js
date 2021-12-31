const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

const logOnOptions = {
	accountName: config.username,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
	console.log('succesfully logged on');
	client.setPersona(SteamUser.EPersonaState.Online);
	client.gamesPlayed("Evan TradeManager");
});

client.on('friendMessage', function(steamID, message) {
	switch(message){
		case "hi":
		case "hello":
		case "salam":
		case "سلام":
			client.chatMessage(steamID, "Hello There, I'm Evan's Bot Assistant and i Wanna Help you");
			break;
	}
	console.log("You Friend : " + steamID + " Say : " + message);
});

client.on('webSession', (sid, cookies) => {
	manager.setCookies(cookies);
	community.setCookies(cookies);
	community.startConfirmationChecker(20000, config.identitySecret);
	/*manager.loadInventory(730, 2, true , (err , inventory) => {
		if (err) {
			console.log(err);
		} else {
			console.log(inventory);
		}
	});*/
	sendTestItem();
});

manager.on('newOffer', offer => {
	console.log('offer detected');
	if (offer.partner.getSteamID64() === config.steamID64 ) {
		console.log('trade from Evan');
		offer.accept((err, status) => {
			if (err) {
				console.log(err);
			} else {
				console.log(status);
			}
		})
	} else {
		console.log('unknown sender offer!');
		offer.decline(err => {
			if (err) {
				console.log(err);
			} else {
				console.log('trade was decline!');
			}
		});
	}
});

function sendTestItem() {
	manager.loadInventory(730, 2, true, (err, inventory) => {
		if (err) {
			console.log(err);
		} else {
			const offer = manager.createOffer('76561198388059993');
			inventory.forEach(function(item) {
				if (item.assetid === '24315527611') {
					offer.addMyItem(item);
					offer.setMessage('You Received that Item!');
					offer.send((err, status) => {
						if (err) {
							console.log(err);
						} else {
							console.log('trade sent');
							console.log(status);
						}
					})
				}
			})
		}
	})
}