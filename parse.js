const csv = require('csv-parser')
const fs = require('fs')
const unzip = require('unzip')
const moment = require('moment')
const glob = require('glob')

require('dotenv').config()

const handle = async () => {
  const Slack = require('slack-node')
  const slack = new Slack()

  const WEBHOOK_URI = process.env.WEBHOOK_URI
  slack.setWebhook(WEBHOOK_URI)

  glob(`./attachments/shopify-referralcandy-app-history-*.zip`, async (er, files) => {
    const FILE_NAME = files[0]

    const yesterday = moment().subtract(24, 'hours')

    let message = ''

    function parseCSVandPostToSlack () {
      glob('./output/shopify-referralcandy-app-history-*.csv', async (error, outputFiles) => {
        const OUTPUT_FILE_NAME = outputFiles[0]

        console.log(OUTPUT_FILE_NAME)

        fs.createReadStream(OUTPUT_FILE_NAME)
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
                      "value": message.length ? message : `No reasons given, just like your last relationship. It's time to move on`
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
        })
    }

    async function parseAttachment() {
      console.log(FILE_NAME)
      fs.createReadStream(FILE_NAME)
        .pipe(unzip.Extract({ path: 'output' }))
        .on('finish', () => {
          console.log('Unzipped!')
          parseCSVandPostToSlack()
        })
    }

    await parseAttachment()
  })
}

handle()
