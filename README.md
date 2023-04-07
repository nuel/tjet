# tjet
🗯 Very Simple Messaging

![Screenshot 2022-03-31 175110](https://user-images.githubusercontent.com/66974415/161097233-abcb5a25-939c-4e75-8c61-1d6d53008fe1.jpg)

tjet is a very simple real time chat library, using socket.io. It includes basic safety features like logging and IP banning, without going overboard on bells and whistles.

## included in the box with tjet
- typing indicators
- online user count
- unread count in the title bar
- user banning
- chatlog
- cute notification sound

## setting up the server
Think of a mod password (or [generate one](https://1password.com/password-generator/)) and save it to `server/.key`.
Then, in the server folder, do `npm i` then `npm start`. tjet listens on port 9443.

## setting up the client
The tjet server does not include an http server and acts only as a headless service. Instead, you should connect to it from a client that you can host however you prefer. Attach `tjet.css` and `tjet.js` to your page. The socket.io client library [(cdnjs link)](https://cdnjs.com/libraries/socket.io) should also be included. Then add a div somewhere with the id `#tjet`. This div can be styled however you want.

By default, tjet tries to connect to the websocket on the same domain the page is served from. To change this, add a `data-server` attribute to your main tjet div, like so:
```html
<div id="tjet" data-server="https://example.com"></div>
```

## moderation
Type `/mod YOUR_KEY` in the chat to enter mod mode. (Replace `YOUR_KEY` with the contents of `server/.key`) This will unhide user IDs and authorize you to ban users.

To ban a user, type `/ban USER_ID` (Replace `USER_ID` with their ID.) This will log their IP address to `server/.banned` and disconnect them from the server whenever they attempt to join. On the client side, their interface will be disabled, so they'll know they've been banned.

## logging
By default, tjet logs all messages to `server/.log`. To disable logging, run the server with the argument `--no-log` or `-n`. For example, to run the server using pm2 without logs, do:
```
pm2 start server.js --node-args="--no-log"
```
