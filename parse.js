const csv = require('csv-parser')
const fs = require('fs')
const unzip = require('unzip')
const moment = require('moment')

require('dotenv').config()

const Slack = require('slack-node')
const slack = new Slack()

const WEBHOOK_URI = process.env.WEBHOOK_URI
slack.setWebhook(WEBHOOK_URI)

async function extractCsvFromZip() {
  fs.createReadStream('./attachments/shopify-referralcandy-app-history-2017-10-27.zip')
    .pipe(unzip.Extract({ path: 'output' }))
}

const yesterday = moment().subtract(1, 'days').startOf('day')

let message = ''

async function parseAttachment () {
  // await extractCsvFromZip()

  fs.createReadStream('output/shopify-referralcandy-app-history-2017-10-27.csv')
    .pipe(csv({
      headers: [
        'date', 'event', 'details', 'billing_on', 'shop_name',
        'shop_country', 'shop_email', 'shop_domain'
      ]
    }))
    .on('data', (data) => {
      const event_date = moment(data.date, 'YYYY-MM-DD HH:mm:ss')

      if (event_date < yesterday) return

      if (data.event == 'Uninstalled' && data.details != '-') {
        message = message + '\n' + `<https://${data.shop_domain}|${data.shop_name}> ${data.details.replace('Uninstall reason: ', '')}`
      }
    })
    .on('end', () => {
      slack.webhook({
        channel: "#engineering-feed",
        username: 'RCShopifyBot',
        icon_emoji: ':ghost:',
        text: '',
        attachments: [
          {
            "fallback": message,
            "fields": [
              {
                "title": `Shopify uninstall reasons for ${yesterday.format('D MMM YYYY')}`,
                "value": message
              }
            ]
          }
        ]
      }, function (err, response) {
        console.log(message)
        if (err) {
          console.log(err)
        } else {
          console.log(response)
        }
      })
    })
}

parseAttachment()
