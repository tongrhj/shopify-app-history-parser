const puppeteer = require('puppeteer')

require('dotenv').config({ silent: process.env.NODE_ENV === 'production' })

const requestForEmail = async function () {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36', '--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  page.once('load', () => console.log('Page loaded!'));
  await page.goto('https://partners.shopify.com/organizations')
  console.log('Logging in')

  // Make Pupeteer less detectable to avoid triggering Shopify's recaptcha
  await page.evaluate(() => {
    // overwrite the `languages` property to use a custom getter
    Object.defineProperty(navigator, 'languages', {
      get: function() {
        return ['en-US', 'en'];
      },
    });

    // overwrite the `plugins` property to use a custom getter
    Object.defineProperty(navigator, 'plugins', {
      get: function() {
        // this just needs to have `length > 0`, but we could mock the plugins too
        return [1, 2, 3, 4, 5];
      },
    });

    const getParameter = WebGLRenderingContext.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // UNMASKED_VENDOR_WEBGL
      if (parameter === 37445) {
        return 'Intel Open Source Technology Center';
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        return 'Mesa DRI Intel(R) Ivybridge Mobile ';
      }

      return getParameter(parameter);
    };
  })

  const EMAIL_ADDRESS_INPUT_SELECTOR = '#account_email'
  const PASSWORD_INPUT_SELECTOR = '#account_password'
  const SUBMIT_EMAIL_BUTTON = 'button.ui-button:nth-child(5)'
  const SUBMIT_PASSWORD_SELECTOR = '.ui-button'

  const CREDENTIALS = {
    username: process.env.SHOPIFY_USERNAME,
    password: process.env.SHOPIFY_PW
  }

  // LOGIN
  await page.click(EMAIL_ADDRESS_INPUT_SELECTOR)
  await page.keyboard.type(CREDENTIALS.username)
  await page.click(SUBMIT_EMAIL_BUTTON)
  await page.waitForNavigation()

  await page.click(PASSWORD_INPUT_SELECTOR)
  await page.keyboard.type(CREDENTIALS.password)
  await page.click(SUBMIT_PASSWORD_SELECTOR)
  await page.waitForNavigation({
      timeout: 100000
  })

  console.log('Log in SUCCESS!')

  const RC_APP_URL = process.env.RC_APP_URL
  await page.goto(RC_APP_URL)
  await page.waitFor(5000);

  console.log('Browsing to RC App Dashboard')

  const EXPORT_DROPDOWN = '.app-analytics__header > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)'
  await page.click(EXPORT_DROPDOWN)
  await page.waitFor(2000);
  const EXPORT_HISTORY = ".Polaris-ActionList__Actions > li:nth-child(3)"
  await page.click(EXPORT_HISTORY) // Triggers a reload of page
  await page.waitForNavigation()
  console.log('Exporting History')
  await page.close();
  await browser.close()
  console.log('Closing browser')
}

requestForEmail()
