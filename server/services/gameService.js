import { matchMaker } from "colyseus";

// export async function createGame(gameData) {
//   const room = await matchMaker.createRoom("game", gameData);

//   return {
//     game_id: room.roomId
//   };
// }

export async function createGame(players) {
  const room = await matchMaker.createRoom("game", {
    players: players.map(p => ({
      username: p.username,
      user_id: p.user_id,
      character_id: p.character_id
    }))
  });

  return {
    game_id: room.roomId
  };
}