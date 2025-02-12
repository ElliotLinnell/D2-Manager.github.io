export default async function handler(req, res) {
  const { player } = req.query;

  if (!player) {
    return res.status(400).json({ error: "Player name is required" });
  }

  const API_KEY = process.env.NEXT_PUBLIC_BUNGIE_API_KEY;

  try {
    // Step 1: Get Player ID
    const searchResponse = await fetch(
      `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${player}/`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    const searchData = await searchResponse.json();

    if (!searchData.Response || searchData.Response.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const { membershipId, membershipType } = searchData.Response[0];

    // Step 2: Get Profile Data
    const profileResponse = await fetch(
      `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    const profileData = await profileResponse.json();

    if (!profileData.Response) {
      return res.status(404).json({ error: "Profile data not found" });
    }

    const lightLevel =
      profileData.Response.characters.data[Object.keys(profileData.Response.characters.data)[0]]
        .light;

    const playerData = {
      playerName: player,
      lightLevel,
      clanName: "Unknown Clan", // Bungie API requires a separate call for clan data
      loadouts: [{ name: "PvP Loadout" }, { name: "Raid Loadout" }],
    };

    res.status(200).json(playerData);
  } catch (error) {
    console.error("Error fetching data from Bungie API:", error);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
}
