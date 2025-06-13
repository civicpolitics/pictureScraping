import { promises as fs } from "fs";

async function updateCouncilDistrictsWithMembers() {
  try {
    // Read the council members data
    const councilMembersData = JSON.parse(
      await fs.readFile("councilMembers.json", "utf-8")
    );

    // Read the GeoJSON districts data
    const districtsGeoJSON = JSON.parse(
      await fs.readFile("NYC_City_Council_Districts.geojson", "utf-8")
    );

    // Create a map of council members by district for quick lookup
    const councilMembersByDistrict = {};
    councilMembersData.forEach(member => {
      councilMembersByDistrict[member.district] = member;
    });

    // Update each feature in the GeoJSON with council member info
    for (const feature of districtsGeoJSON.features) {
      const districtNum = feature.properties.CounDist.toString();
      const councilMember = councilMembersByDistrict[districtNum];

      if (councilMember) {
        // Add council member properties to the district
        // feature.properties.councilName = councilMember.Name;
        // feature.properties.councilWebsite = councilMember.Website;
        // feature.properties.councilimage_url = councilMember.image_url;
        // feature.properties.councilEmail = councilMember.Email;
        feature.properties.councilParty = councilMember.Party;
      }
    }

    // Write the updated data back to a new file
    await fs.writeFile(
      "NYC_City_Council_Districts_Enhanced.geojson",
      JSON.stringify(districtsGeoJSON, null, 2)
    );

    console.log("Successfully updated district GeoJSON with council member data");
  } catch (error) {
    console.error("Error updating districts with council member data:", error);
  }
}

updateCouncilDistrictsWithMembers(); 