# bot
The NCEES discord bot

Our entry point: ``index.js``, set your debuggers to start here. (I've included a VS code launch json with this already)

To get this project running:

 - do ``npm update`` after cloning, to download dependancies.
 - create ``auth.json`` in root containing ``{"token":<YOUR API KEY HERE>}`` if you wish to test via your own bot.
   - If the token field is left blank, the core will use the debugger.js module in root to fire fake discord-like events.

It is expected that you at least do your own unit testing (don't need to set up your own discord bot for that), and more comprehensive testing will be done via the "NCEES-dev" bot after your code has been merged to the dev branch.
