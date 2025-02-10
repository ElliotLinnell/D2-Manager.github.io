import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Home() {
  const [loginUrl, setLoginUrl] = useState("");
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [targetCharacter, setTargetCharacter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/login")
      .then((res) => res.json())
      .then((data) => setLoginUrl(data.login_url));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfile(data));

      fetch("http://localhost:8000/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setInventory(data.items));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setProfile(null);
    setInventory([]);
  };

  const transferItem = async (itemInstanceId) => {
    if (!targetCharacter) {
      setMessage("Please select a target character first");
      return;
    }
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch("http://localhost:8000/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemInstanceId,
          targetCharacterId: targetCharacter,
        }),
      });
      const data = await response.json();
      setMessage(data.message || "Item transferred successfully");
    } catch (error) {
      setMessage("Failed to transfer item");
    }
    setLoading(false);
  };

  const Item = ({ item }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "ITEM",
      item: { id: item.itemInstanceId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        className={`p-4 bg-gray-800 rounded-lg ${isDragging ? "opacity-50" : ""}`}
      >
        <img src={item.icon} alt={item.name} className="w-16 h-16 mx-auto" />
        <p className="mt-2 text-sm">{item.name}</p>
        <p className="text-xs text-gray-400">{item.type}</p>
      </div>
    );
  };

  const DropZone = () => {
    const [, drop] = useDrop(() => ({
      accept: "ITEM",
      drop: (item) => transferItem(item.id),
    }));

    return (
      <div
        ref={drop}
        className="mt-4 p-6 bg-blue-600 rounded-lg text-white font-bold"
      >
        Drop Item Here to Transfer
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Destiny 2 Manager</h1>
        <p className="mt-4">Manage your inventory, vendors, and titles.</p>
        {!profile ? (
          loginUrl && (
            <a
              href={loginUrl}
              className="mt-6 px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700"
            >
              Login with Bungie
            </a>
          )
        ) : (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold">Welcome, {profile.displayName}!</p>
            <img src={profile.avatar} alt="Avatar" className="w-16 h-16 mx-auto rounded-full mt-2" />
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
            >
              Logout
            </button>
            <h2 className="mt-6 text-xl font-bold">Select Target Character</h2>
            <select
              className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg"
              value={targetCharacter}
              onChange={(e) => setTargetCharacter(e.target.value)}
            >
              <option value="">Select Character</option>
              {profile?.characters?.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {profile?.characters?.map((char) => (
                <div key={char.id} className="flex flex-col items-center">
                  <img src={char.icon} alt={char.name} className="w-16 h-16 rounded-full" />
                  <p className="mt-2 text-sm">{char.name}</p>
                </div>
              ))}
            </div>
            <h2 className="mt-6 text-xl font-bold">Your Inventory</h2>
            {message && <p className="mt-2 text-yellow-400">{message}</p>}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {inventory.map((item) => (
                <Item key={item.itemInstanceId} item={item} />
              ))}
            </div>
            <DropZone />
          </div>
        )}
      </div>
    </DndProvider>
  );
}
