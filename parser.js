import puppeteer from "puppeteer";
import fs from 'fs'

let link = 'https://www.dns-shop.ru/catalog/17a8a01d16404e77/smartfony/?p=';
(async () => {

  let flag = true
  let res = []
  let counter = 1

  try {
    let browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      devtools: true
    })
    let page = await browser.newPage()
    await page.setViewport({
      width: 1000, height: 900
    })

    while (flag) {
      await page.goto(`${link}${counter}`)
      await page.waitForSelector('a.pagination-widget__page-link_next')
      let html = await page.evaluate(async () => {
        let page = []
        try {

          let divs = document.querySelectorAll('div.ui-button-widget')

          divs.forEach(div => {
            let a = div.querySelector('a.ui-link')
            let obj = {
              title: a != null
                ? a.innerText
                : 'no text',
              link: a != null
                ? a.href
                : 'no link', 
              price: div.querySelector('div.product-buy__price').innerText != null
                ? div.querySelector('div.product-buy__price').innerText
                : 'no price'
            }
            page.push(obj)
          });
        } catch (e) {
          console.log(e);
        }
        return page
      }, { waitUntil: 'a.pagination-widget__page-link_next' })
      if (html.length === 0) {
        break
      }
      else {
        res.push(html)
        console.log(counter);
        counter++
      }
    }
    
    await browser.close()
    res = res.flat()

    fs.writeFile('dns.json', JSON.stringify({'data':res}),err =>{
      if (err) throw err
      console.log('dns.json saved');
      console.log('dns.json length: ',res.length);
    })

  } catch (e) {
    console.log(e);
    await browser.close()
  }

})();