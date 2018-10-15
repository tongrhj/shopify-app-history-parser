const csv = require('csv-parser')
const fs = require('fs')
const unzip = require('unzip')
const moment = require('moment')

require('dotenv').config()

const Slack = require('slack-node')
const slack = new Slack()

const WEBHOOK_URI = process.env.WEBHOOK_URI
slack.setWebhook(WEBHOOK_URI)

const YYYY_MM_DD = moment().format('YYYY-MM-DD')
const FILE_NAME = `shopify-referralcandy-app-history-${YYYY_MM_DD}`

const yesterday = moment().subtract(24, 'hours')

let message = ''

function parseCSVandPostToSlack () {
  fs.createReadStream(`output/${FILE_NAME}.csv`)
    .pipe(csv({
      headers: [
        'date', 'event', 'details', 'billing_on', 'shop_name',
        'shop_country', 'shop_email', 'shop_domain'
      ]
    }))
    .on('data', (data) => {
      const event_date = moment.utc(data.date, 'YYYY-MM-DD HH:mm:ss')

      if (event_date < yesterday) {
        return null
      }

      if (data.event === 'Uninstalled' && data.details && data.details !== '-') {
        const uninstallReason = data.details.replace('Uninstall reason: ', '')

        // Exclude unhelpful messages
        if (uninstallReason === 'Other') {
          return null
        } else {
          message = message + '\n' + `<https://${data.shop_domain}|${data.shop_name}> ${uninstallReason}`
        }
      }
    })
    .on('end', () => {
      console.log('Posting to Slack!')
      slack.webhook({
        username: 'Shopify Uninstall Reasons',
        text: '',
        attachments: [
          {
            "fallback": message,
            "fields": [
              {
                "title": `${yesterday.format('D')} - ${moment().format('D MMM YYYY')}`,
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

async function parseAttachment() {
  fs.createReadStream(`./attachments/${FILE_NAME}.zip`)
    .pipe(unzip.Extract({ path: 'output' }))
    .on('finish', () => {
      console.log('Unzipped!')
      parseCSVandPostToSlack()
    })
}

parseAttachment()
