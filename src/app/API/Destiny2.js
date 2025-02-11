export default async function handler(req, res) {
    const { player } = req.query;
  
    // Simulated response (replace with Bungie API call)
    const playerData = {
      playerName: player,
      lightLevel: 1350,
      clanName: "Guardians United",
      loadouts: [{ name: "PvP Loadout" }, { name: "Raid Loadout" }],
    };
  
    res.status(200).json(playerData);
  }