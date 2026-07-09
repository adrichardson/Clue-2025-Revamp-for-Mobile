import { matchMaker } from "colyseus";
import Match from "../db/config/schemas/Match.js";

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

export async function saveGame(players) {
  const match = new Match({
    players: players.map(player => ({
      user_id: player.user_id,
      character_id: player.character_id,
      result: player.victor ? "win" : "lose"
    }))
  });

  await match.save();

  return match;
}