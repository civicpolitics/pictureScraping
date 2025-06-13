import * as cheerio from "cheerio";
import axios from "axios";
import { promises as fs } from "fs";

/**
 * popupData.URI1 = 'https://council.nyc.gov/district-1/';
 * popupData.Thumb1 = 'https://raw.githubusercontent.com/NewYorkCityCouncil/districts/master/thumbnails/district-1.jpg';
 * popupData.Member1 = 'Christopher Marte';
 * popupData.URI2 = 'https://council.nyc.gov/district-2/';
 * popupData.Thumb2 = 'https://raw.githubusercontent.com/NewYorkCityCouncil/districts/master/thumbnails/district-2.jpg';
 * popupData.Member2 = 'Carlina Rivera';
 * popupData.URI3 = 'https://council.nyc.gov/district-3/';
 * popupData.Thumb3 = 'https://raw.githubusercontent.com/NewYorkCityCouncil/districts/master/thumbnails/district-3.jpg';
 * popupData.Member3 = 'Erik Bottcher';
 */

const NYCCITYCOUNCIL_URL = "https://council.nyc.gov/districts/";

const WEB_PAGE_REGEX = /popupData\.URI(\d+) = .*/g;
const THUMBNAIL_REGEX = /popupData\.Thumb(\d+) = '(.*)';/g;
const NAME_REGEX = /popupData\.Member(\d+) = '(.*)';/g;

const WEB_PAGE_CAPTURE_REGEX = /popupData\.URI(?<district>\d+) = '(?<webPage>.*)';/;
const THUMBNAIL_CAPTURE_REGEX = /popupData\.Thumb(?<district>\d+) = '(?<thumbnail>.*)';/;
const NAME_CAPTURE_REGEX = /popupData\.Member(?<district>\d+) = '(?<name>.*)';/;

const createCouncilUrl = (href: string) => {
  return "https://council.nyc.gov" + href
};

async function scrapeCouncilMembers() {
  const html = await axios.get(NYCCITYCOUNCIL_URL);
  const webPageMatches = html.data.match(WEB_PAGE_REGEX);
  const thumbnailMatches = html.data.match(THUMBNAIL_REGEX);
  const nameMatches = html.data.match(NAME_REGEX);
  
  const councilMembers = new Map<Number, {webPage: string, thumbnail: string, name: string}>();

  for (const webPageMatch of webPageMatches) {
    const captureGroups = webPageMatch.match(WEB_PAGE_CAPTURE_REGEX);
    const { district, webPage } = captureGroups?.groups;
    
    const data = councilMembers.get(district);
    if (data) {
      councilMembers.set(district, { ...data, webPage });
    } else {
      councilMembers.set(district, { webPage, thumbnail: "", name: "" });
    }
  }

  for (const thumbnailMatch of thumbnailMatches) {
    const captureGroups = thumbnailMatch.match(THUMBNAIL_CAPTURE_REGEX);
    const { district, thumbnail } = captureGroups?.groups;

    const data = councilMembers.get(district);
    if (data) {
      councilMembers.set(district, { ...data, thumbnail });
    } else {
      councilMembers.set(district, { webPage: "", thumbnail, name: "" });
    }
  }

  for (const nameMatch of nameMatches) {
    const captureGroups = nameMatch.match(NAME_CAPTURE_REGEX);
    const { district, name } = captureGroups?.groups;

    const data = councilMembers.get(district);
    if (data) {
      councilMembers.set(district, { ...data, name });
    } else {
      councilMembers.set(district, { webPage: "", thumbnail: "", name });
    }
  }

  // console.log(councilMembers);
  const jsonData = [];
  for (const [district, data] of councilMembers.entries()) {
    jsonData.push({
      district,
      webPage: data.webPage,
      thumbnail: data.thumbnail,
      name: data.name,
    });
  }
  console.log(jsonData);
  await fs.writeFile("councilMembers.json", JSON.stringify(jsonData, null, 2));
}

scrapeCouncilMembers();