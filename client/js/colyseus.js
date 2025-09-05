async function joinLobby(username) {
  const client = new Colyseus.Client("ws://localhost:2567"); // adjust port if needed

  try {
    const room = await client.joinOrCreate("lobby", { username });
    console.log("Joined LobbyRoom:", room);

    room.onStateChange(state => console.log("Lobby state updated:", state));
    room.onMessage("userJoined", msg => console.log("User joined:", msg));
    room.onLeave(code => console.log("Left the lobby:", code));

    return room;
  } catch (e) {
    console.error("Failed to join LobbyRoom:", e);
  }
}