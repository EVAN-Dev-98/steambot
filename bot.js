// نام کاربری و رمز عبور و رمز های ساخت کد ورود به استیم داخل فایل کانفیگ هست 

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config');

const CSGO = 730;
const Dota = 570;
const ali = '76561198999054386';
const seyed = '76561198388059993';

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
	client.gamesPlayed("SteamFarsi.ir | Evan#bot");
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
	// Confirm All Trades From self
	community.startConfirmationChecker(20000, config.identitySecret);
	/*manager.loadInventory(CSGO, 2, true, (err , inventory) => {
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
	// Confirm All Trades From This SteamID
	if (offer.partner.getSteamID64() === seyed) {
		offer.accept((err, status) => {
			if (err) {
				console.log(err);
			} else {
				console.log(status);
			}
		})
	} else {
		// Decline All Trades From Other
		console.log('unknown sender');
		offer.decline(err => {
			if (err) {
				console.log(err);
			} else {
				console.log('trade was declined');
			}
		});
	}
});

// Send Test Trade Offer
function sendTestItem() {
	manager.loadInventory(CSGO, 2, true, (err, inventory) => {
		if (err) {
			console.log(err);
		} else {
			// Send To This SteamID
			const offer = manager.createOffer(seyed);
			inventory.forEach(function(item) {
				if (item.assetid === '24368719122') {
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