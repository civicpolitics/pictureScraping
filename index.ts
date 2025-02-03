import * as cheerio from "cheerio";
import axios from "axios";
import { promises as fs } from "fs";

const NEW_YORK_STATE_SENATE_WIKIPEDIA_URL =
  "https://en.wikipedia.org/wiki/New_York_State_Senate";

const createSenatorUrl = (href: string) => {
  return "https://en.wikipedia.org" + href;
};

const html = await axios.get(NEW_YORK_STATE_SENATE_WIKIPEDIA_URL);

let $ = cheerio.load(html.data);

const memberTableData = $("h2#Current_members")
  .parent()
  .next()
  .extract({
    urlInfo: [
      {
        selector: "tbody tr",
        value: {
          name: "td:first-of-type a",
          href: {
            selector: "td:first-of-type a",
            value: "href",
          },
        },
      },
    ],
  });

// console.log(memberTableData);

const urlData = [];
for (let { name, href } of memberTableData.urlInfo) {
  if (name === undefined || href === undefined) {
    continue;
  }

  const senatorUrl = createSenatorUrl(href);
  let html = await axios.get(senatorUrl);

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

await fs.writeFile("data.json", JSON.stringify(urlData));
