import fs from 'fs/promises';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// Function to fetch and parse the HTML content from MyGovNYC
async function fetchAssemblyMemberData(district) {
  try {
    // We'll use a search URL that filters for the specific assembly district
    const url = `https://www.mygovnyc.org/?tab=state&district=assembly${district}`;
    console.log(`Fetching data for Assembly District ${district}...`);
    
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find the assembly member section
    const assemblySection = Array.from(document.querySelectorAll('.official-section'))
      .find(section => section.textContent.includes('Assembly District'));
    
    if (!assemblySection) {
      console.log(`No data found for Assembly District ${district}`);
      return null;
    }
    
    // Extract the data
    const memberData = {
      district: district,
      name: '',
      party: '',
      email: '',
      website: '',
      phone: '',
      instagram: '',
      capitalOffice: {
        address: '',
        phone: '',
        fax: ''
      },
      districtOffice: {
        address: '',
        phone: '',
        fax: ''
      }
    };
    
    // Extract member name
    const nameElement = assemblySection.querySelector('.official-name');
    if (nameElement) {
      memberData.name = nameElement.textContent.trim();
    }
    
    // Extract party
    const partyElement = assemblySection.querySelector('.official-party');
    if (partyElement) {
      memberData.party = partyElement.textContent.trim();
    }
    
    // Find email, website, etc.
    const links = assemblySection.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        if (href.includes('mailto:')) {
          memberData.email = href.replace('mailto:', '');
        } else if (!href.includes('instagram.com') && !href.includes('facebook.com') && !href.includes('twitter.com')) {
          // Assume it's the website if not a social media link
          if (link.textContent.trim().includes('Website') || link.parentElement.className.includes('website')) {
            memberData.website = href;
          }
        }
      }
    });
    
    // Find social media links
    const socialLinks = assemblySection.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('instagram.com')) {
        memberData.instagram = href;
      }
    });
    
    // Find office information
    const officeInfoSections = assemblySection.querySelectorAll('.contact-info');
    officeInfoSections.forEach(section => {
      const title = section.querySelector('h4')?.textContent || '';
      
      if (title.includes('Albany') || title.includes('Capital')) {
        // Capital office
        const address = section.querySelector('address')?.textContent.trim() || '';
        memberData.capitalOffice.address = address;
        
        // Look for phone and fax
        const contactItems = section.querySelectorAll('p');
        contactItems.forEach(item => {
          const text = item.textContent;
          if (text.includes('Phone:')) {
            memberData.capitalOffice.phone = text.replace('Phone:', '').trim();
          }
          if (text.includes('Fax:')) {
            memberData.capitalOffice.fax = text.replace('Fax:', '').trim();
          }
        });
      } else if (title.includes('District')) {
        // District office info
        const address = section.querySelector('address')?.textContent.trim() || '';
        memberData.districtOffice.address = address;
        
        // Look for phone and fax
        const contactItems = section.querySelectorAll('p');
        contactItems.forEach(item => {
          const text = item.textContent;
          if (text.includes('Phone:')) {
            memberData.districtOffice.phone = text.replace('Phone:', '').trim();
          }
          if (text.includes('Fax:')) {
            memberData.districtOffice.fax = text.replace('Fax:', '').trim();
          }
        });
      }
    });
    
    return memberData;
  } catch (error) {
    console.error(`Error fetching data for Assembly District ${district}:`, error);
    return null;
  }
}

// Function to create a JSON file with assembly member data
async function createAssemblyJSON() {
  try {
    // Array to hold all assembly member data
    const assemblyMembers = [];
    
    // Define the districts to scrape (NY has 150 assembly districts)
    // You can adjust this range if needed
    const districts = Array.from({ length: 150 }, (_, i) => i + 1);
    
    // Process each district
    console.log('Fetching data for all assembly districts...');
    for (const district of districts) {
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const memberData = await fetchAssemblyMemberData(district);
      if (memberData) {
        assemblyMembers.push(memberData);
        console.log(`✅ Added data for Assembly District ${district}: ${memberData.name}`);
      }
    }
    
    // Write to JSON file
    console.log('Writing data to JSON file...');
    await fs.writeFile(
      'NYS_Assembly_Members.json', 
      JSON.stringify(assemblyMembers, null, 2),
      'utf8'
    );
    
    console.log(`✅ Successfully created JSON with ${assemblyMembers.length} assembly members`);
  } catch (error) {
    console.error('❌ Error creating JSON:', error);
  }
}

// Run the script
createAssemblyJSON().catch(console.error); 