import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Destiny2App() {
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Destiny 2 Player Search</h1>
      {!session ? (
        <Button onClick={() => signIn()}>Login</Button>
      ) : (
        <div>
          <Button onClick={() => signOut()}>Logout</Button>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter player name"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
            />
            <Button onClick={fetchPlayerData}>Search</Button>
          </div>
          {data && (
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold">{data.playerName}</h2>
                <p>Light Level: {data.lightLevel}</p>
                <p>Clan: {data.clanName}</p>
                <h3 className="mt-4 font-semibold">Loadouts</h3>
                {loadouts.map((loadout, index) => (
                  <p key={index}>{loadout.name}</p>
                ))}
                <Button onClick={() => updateLoadout({ name: "New Loadout" })}>
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
