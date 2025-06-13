import * as cheerio from "cheerio";
import axios from "axios";
import { promises as fs } from "fs";

const NEW_YORK_STATE_ASSEMBLY_URL =
  "https://nyassembly.gov/mem/";

const createCongressUrl = (href: string) => {
  return "https://nyassembly.gov" + href;
};

const html = await axios.get(NEW_YORK_STATE_ASSEMBLY_URL);

let $ = cheerio.load(html.data);

const memberData = $('section.mem-wrapper')
    .extract({
        urlInfo: [
            {
                selector: "section.mem-item",
                value: {
                    name: {
                        selector: ".mem-name > a",
                        value: "textContent"
                    },
                    imageUrl: {
                        selector: ".mem-pic a > img",
                        value: "src",
                    }
                }
            },
        ],
    });

// console.log(memberData.urlInfo);
// const urlData = [];
// for (let { image, src } of memberData.urlInfo) {
//   if (image === undefined || src === undefined) {
//     continue;
//   }

//   const congressUrl = createCongressUrl(src);
// //   console.log(congressUrl);
//   let html = await axios.get(congressUrl);

//   $ = cheerio.load(html.data);
//   const imageData = $("td.infobox-image").extract({
//     image: {
//       selector: "img",
//       value: "src",
//     },
//   });
//   const imageValue = imageData.image;
//   const imageUrl = "https:" + imageValue;

//   urlData.push({ name, imageUrl });
// }

for (let i = 0; i < memberData.urlInfo.length; i++) {
    const nameString = memberData.urlInfo[i].name;
    const trimmedString = nameString.trim();
    const parts = trimmedString.split('\t').filter(part => part.trim() !== '');
    const name = parts[0];
    memberData.urlInfo[i].name = name;
    memberData.urlInfo[i].imageUrl = createCongressUrl(memberData.urlInfo[i].imageUrl);
}
await fs.writeFile("data2.json", JSON.stringify(memberData.urlInfo));