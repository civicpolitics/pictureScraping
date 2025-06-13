import urllib.request
from bs4 import BeautifulSoup
import ssl

class Scraper:
    def __init__(self, site):
        self.site = site

    def scrape(self):
        # Create an unverified SSL context
        context = ssl._create_unverified_context()
        
        # Add headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(self.site, headers=headers)
        
        try:
            r = urllib.request.urlopen(req, context=context)
            html = r.read()
            parser = "html.parser"
            sp = BeautifulSoup(html, parser)
            
            # Print total number of links found
            all_links = sp.find_all("a")
            print(f"Total links found: {len(all_links)}")
            
            # Look for article links specifically
            for tag in all_links:
                url = tag.get("href")
                if url is None:
                    continue
                # Google News links typically start with './articles/'
                if url.startswith('./articles/'):
                    full_url = f"https://news.google.com{url[1:]}"
                    print(f"\nArticle: {tag.get_text()}")
                    print(f"URL: {full_url}")
                    
        except Exception as e:
            print(f"An error occurred: {str(e)}")

news = "https://news.google.com/"
Scraper(news).scrape()

