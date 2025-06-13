import * as cheerio from "cheerio";
import axios from "axios";
import { promises as fs } from "fs";

const NEW_YORK_STATE_CONGRESS_WIKIPEDIA_URL =
  "https://en.wikipedia.org/wiki/List_of_United_States_representatives_from_New_York";

const createCongressUrl = (href: string) => {
  return "https://en.wikipedia.org" + href;
};

const html = await axios.get(NEW_YORK_STATE_CONGRESS_WIKIPEDIA_URL);

let $ = cheerio.load(html.data);

const memberTableData = $('h2:contains("Current members")')
.parent()
.next()
.next()
.next()
.extract({
    urlInfo: [
        {
            selector: "li",
            value: {
                name: "a:eq(1)",
                href: {
                    selector: "a:eq(1)",
                    value: "href",
                }
            },
        }
    ]
});

// console.log(memberTableData);

const urlData = [];
for (let { name, href } of memberTableData.urlInfo) {
  if (name === undefined || href === undefined) {
    continue;
  }

  const congressUrl = createCongressUrl(href);
//   console.log(congressUrl);
  let html = await axios.get(congressUrl);

  $ = cheerio.load(html.data);
  const imageData = $("td.infobox-image").extract({
    href: {
      selector: "img",
      value: "src",
    },
  });
  const imageHref = imageData.href;
  const imageUrl = "https:" + imageHref;

  urlData.push({ name, imageUrl });
}

await fs.writeFile("data1.json", JSON.stringify(urlData));