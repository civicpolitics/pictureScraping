import * as cheerio from 'cheerio';
import axios from 'axios';

const html = await axios.get('https://www.nysenate.gov/senators-committees');



const $ = cheerio.load(html.data);

const imgs = $('img[itok]').text();

console.log(imgs);
