# Eris Starboard Bot
A simple starboard discord bot using Eris and sqlite.  <br>
This bot is a fork of [this repo](https://github.com/xShadoww/eris-starboard/blob/master/index.js), with changes to make it more efficient and effective.

## Self Hosting
There is no publicly hosted version of this bot. In order to host, you must:
1) Make sure you have a machine w/ nodejs and npm
2) Clone this repo `git clone https://github.com/the1sword/eris-starboard.git`
3) Install dependencies with `npm install`
4) Copy the example.env file and put in your own Discord bot token, as well as adding a number for how many stars should be required for a message to make the starboard.
5) Make sure the bot is in the server you want to use it in. Tools like the [Discord Permissions Calculator](https://discordapi.com/permissions.html#0) are incredibly helpful for generating invite links.
6) Run the bot with your process manager of choice.

## FAQ

Q: Npm install fails with a node-gyp error <br>
A: Make sure all of the NPM packages are up to date. While dependabot is running on this repo it doesn't always catch everything.
