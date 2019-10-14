"use strict";
const chromium = require("chrome-aws-lambda");

exports.getEmailProviderName = async function(event) {
  let browser = null;
  console.log(event.body);
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto("https://mxtoolbox.com/MXLookup.aspx");
    const inputIdentifier = "input.tools_lookup_textbox.form-control";
    const request = JSON.parse(event.body);
    await page.waitFor(inputIdentifier);
    await page.$eval(
      inputIdentifier,
      (el, value) => (el.value = value),
      request.domain
    );
    await page.click('input[type="submit"].btn.btn-mx');
    await page.waitForSelector(".tool-result-body");
    const element = await page.$("pre.alert");
    const text = await page.evaluate(element => element.textContent, element);
    await browser.close();
    // var emailProviderRegExp = new RegExp(/\"(?<emailProvider>.*?)\"/gm);
    // const matchRes = emailProviderRegExp.exec(text);
    // if (matchRes && matchRes.length > 0) {
    //   const emailProviderName =
    //     (matchRes.groups && matchRes.groups.emailProvider) || text || "UNKNOWN";
    //   const response = {
    //     statusCode: 200,
    //     body: JSON.stringify({
    //       emailProviderName
    //     })
    //   };
    //   return response;
    // }
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        emailProviderName: text || "UNKNOWN"
      })
    };
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        emailProviderName: error.message
      })
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
