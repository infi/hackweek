# DCMB / CommonMisspellingBot for Discord

Inspired by [u/CommonMisspellingBot](https://reddit.com/user/CommonMisspellingBot), this bot aims to improve the writing quality of Discord communities, but keep the not-so-serious aspect of Discord.

## Stack
- `discord.js` on `node.js`
- `redis` as far as database goes
- `JSON` for everything else, I guess

## Selfhosting
Rename `cfg_e` to `cfg` and fill the JSONs out.  
Make sure you have node.js with NPM installed (if not, [do so](https://nodejs.org)) by running `npm -v` in the Terminal of your choice.  
  
`cd` into the bot's path and run `npm i --production`. Get [Redis](https://redis.io) (this is different for every platform, on Windows check out `MicrosoftAchive/redis` here on GitHub. Old version but should work 100% as this only uses the basic storage functionality of Redis.). Run `redis-server` in another terminal instance. Finally, run `node app.js` to start the bot. It should be running.

## Licensing
See the file `LICENSE`.

## Hack Week
This is a Submission for the Discord Hack Week, so it will definitely feel rushed at first. I will continue to maintain this into a full bot.