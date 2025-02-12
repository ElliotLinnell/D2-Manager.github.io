export default async function handler(req, res) {
    if (req.method === "POST") {
      const { loadout } = req.body;
      res.status(200).json({ loadouts: [{ name: loadout.name }] });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  }
  