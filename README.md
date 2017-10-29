# Shopify Slack Bot
Get hard-to-extract information from Shopify programmatically and send to Slack

## mail-listener2's mailparser is broken!
Until we fork it, need to manually go in and fix it. Right now mailparser installs an open ended version of mime, which has updated with breaking changes. So either install the old version of mime (@1.0.0) or change the code in mail-listener2 to reflect the new function names (s/mime.extension/mime.getExtension, s/mime.lookup/mime.getType). See [node-mime repo](https://github.com/broofa/node-mime) for more info.

## Use
```
touch .env
```

`.env` should have:
```
SHOPIFY_USERNAME= (parters account login details)
SHOPIFY_PW=
EMAIL_USERNAME= (gmail account login details)
EMAIL_PW=
EMAIL_MAILBOX=INBOX (gmail label name)
RC_APP_URL= (link to shopify partners dashboard)
WEBHOOK_URI= (Slack incoming webhook uri, find in Slack app settings)
```

```
node index.js # Requests App Activity Email from Shopify Partners Dashboard
node email.js # Logs into Gmail to Download the App Activity Email attachment
node parse.js # Unzips the App Activity Email attachment, parses it, and posts to Slack
```
