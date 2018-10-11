# Shopify Slack Bot
Get hard-to-extract information from Shopify programmatically and send to Slack every 24 hours

## Why we use mail-listener2-updated
`mail-listener2` uses a broken versin of `mailparser`, which installs an open ended version of `mime`. Versions of mime greater than `1.0.0` have updated with breaking changes (they have renamed their public functions `s/mime.extension/mime.getExtension`, `s/mime.lookup/mime.getType`). `mail-listener2-updated` installs the old version of mime. See [node-mime repo](https://github.com/broofa/node-mime) for more info.

## Use
```
touch .env
```

`.env` should have:
```
SHOPIFY_USERNAME= (partner account login details)
SHOPIFY_PW=
EMAIL_USERNAME= (gmail account login details)
EMAIL_PW=
EMAIL_MAILBOX=INBOX (gmail label name, e.g. INBOX or a manual label you create in Gmail like Shopify App History)
RC_APP_URL= (link to shopify partners dashboard, e.g. ttps://partners.shopify.com/[partner id]/apps/[app id]/)
WEBHOOK_URI= (Slack incoming webhook uri, find in Slack app settings)
```

```
node index.js # Requests App Activity Email from Shopify Partners Dashboard
node email.js # Logs into Gmail to Download the App Activity Email attachment ()
node parse.js # Unzips the App Activity Email attachment, parses it, and posts to Slack
```
