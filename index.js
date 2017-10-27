const puppeteer = require('puppeteer')

require('dotenv').config()

async function requestForEmail () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://partners.shopify.com/organizations')
  const EMAIL_ADDRESS_INPUT_SELECTOR = '#account_email'
  const PASSWORD_INPUT_SELECTOR = '#account_password'
  const SUBMIT_BUTTON_SELECTOR = '#login_form > button'

  const CREDENTIALS = {
    username: process.env.SHOPIFY_USERNAME,
    password: process.env.SHOPIFY_PW
  }

  // LOGIN
  await page.click(EMAIL_ADDRESS_INPUT_SELECTOR)
  await page.keyboard.type(CREDENTIALS.username)

  await page.click(PASSWORD_INPUT_SELECTOR)
  await page.keyboard.type(CREDENTIALS.password)

  await page.click(SUBMIT_BUTTON_SELECTOR)

  await page.waitForNavigation()

  // NAVIGATE TO UNINSTALL REASON LINK
  const RC_APP_URL = process.env.RC_APP_URL
  await page.goto(RC_APP_URL)

  const EXPORT_HISTORY_SELECTOR = '#AppHistory > header > div > div:nth-child(2) > div > div:nth-child(2) > a'

  await page.click(EXPORT_HISTORY_SELECTOR)

  await page.waitFor(1 * 1000) // Time for request to be queued

  browser.close()
}

requestForEmail()
