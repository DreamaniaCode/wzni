import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://localhost:3000/fr');
await page.evaluate(()=>document.fonts.ready);
await page.locator('h1').waitFor({state:'visible'});
await page.screenshot({path:'artifacts/desktop-fr.png',fullPage:false});
for(const locale of ['fr','ar']){await page.setViewportSize({width:390,height:844});await page.goto(`http://localhost:3000/${locale}`);await page.evaluate(()=>document.fonts.ready);await page.locator('h1').waitFor({state:'visible'});await page.screenshot({path:`artifacts/mobile-${locale}.png`,fullPage:false});}
await browser.close();
