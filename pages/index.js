import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [player, setPlayer] = useState("");
  const [data, setData] = useState(null);
  const [loadouts, setLoadouts] = useState([]);

  const fetchPlayerData = async () => {
    if (!player) return;
    try {
      const response = await fetch(`/api/destiny2?player=${player}`);
      const result = await response.json();
      setData(result);
      setLoadouts(result.loadouts || []);
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  };

  const updateLoadout = async (newLoadout) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/destiny2/loadouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loadout: newLoadout }),
      });
      const result = await response.json();
      setLoadouts(result.loadouts);
    } catch (error) {
      console.error("Error updating loadout:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Destiny 2 Loadout Manager</h1>
      {!session ? (
        <div>
          <p className="mb-4">Sign in to manage your Destiny 2 loadouts.</p>
          <Button onClick={() => signIn()}>Login</Button>
        </div>
      ) : (
        <div>
          <Button className="mb-4" onClick={() => signOut()}>Logout</Button>
          <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
            <Input
              className="w-full md:w-auto"
              placeholder="Enter player name"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
            />
            <Button onClick={fetchPlayerData}>Search</Button>
          </div>
          {data && (
            <Card className="mt-4 text-left">
              <CardContent>
                <h2 className="text-xl font-semibold">{data.playerName}</h2>
                <p>Light Level: <span className="font-medium">{data.lightLevel}</span></p>
                <p>Clan: <span className="font-medium">{data.clanName}</span></p>
                <h3 className="mt-4 font-semibold">Loadouts</h3>
                <ul className="list-disc pl-5">
                  {loadouts.map((loadout, index) => (
                    <li key={index}>{loadout.name}</li>
                  ))}
                </ul>
                <Button className="mt-4" onClick={() => updateLoadout({ name: "New Loadout" })}>
                  Update Loadout
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}