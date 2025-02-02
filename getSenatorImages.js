const axios = require('axios');
const cheerio = require('cheerio');

async function fetchAssemblyMemberImages() {
    try {
        // URL of the New York State Assembly members page
        const url = 'https://nyassembly.gov/mem/';

        // Fetch the HTML of the page
        const { data } = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Array to hold image URLs
        const imageUrls = [];

        // Select the elements containing the assembly members' photos
        $('.member-photo img').each((index, element) => {
            // Get the source of the image
            const imgUrl = $(element).attr('src');
            if (imgUrl) {
                // If the URL is relative, prepend the base URL
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://nyassembly.gov${imgUrl}`;
                imageUrls.push(fullUrl);
            }
        });

        console.log('Image URLs of New York State Assembly Members:', imageUrls);
    } catch (error) {
        console.error('Error fetching assembly member images:', error);
    }
}

fetchAssemblyMemberImages();