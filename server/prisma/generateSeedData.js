import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const moviesRaw = [
  ['Avatar', 2009, 9.0, ['Sci-Fi', 'Action'], 'English', 'PG13', 2923706026],
  ['Avengers: Endgame', 2019, 8.8, ['Action', 'Superhero'], 'English', 'PG13', 2797501328],
  ['Avatar: The Way of Water', 2022, 8.2, ['Sci-Fi', 'Action'], 'English', 'PG13', 2320250281],
  ['Titanic', 1997, 8.7, ['Romance', 'Drama'], 'English', 'PG13', 2264080330],
  ['Star Wars: The Force Awakens', 2015, 8.0, ['Sci-Fi', 'Adventure'], 'English', 'PG13', 2071310218],
  ['Avengers: Infinity War', 2018, 8.6, ['Action', 'Superhero'], 'English', 'PG13', 2052415039],
  ['Spider-Man: No Way Home', 2021, 8.5, ['Action', 'Superhero'], 'English', 'PG13', 1921847111],
  ['Jurassic World', 2015, 7.4, ['Action', 'Adventure'], 'English', 'PG13', 1671713208],
  ['The Lion King (2019)', 2019, 7.2, ['Animation', 'Adventure'], 'English', 'PG13', 1662020837],
  ['The Avengers', 2012, 8.4, ['Action', 'Superhero'], 'English', 'PG13', 1518812988],
  ['Furious 7', 2015, 7.5, ['Action'], 'English', 'PG13', 1515341399],
  ['Top Gun: Maverick', 2022, 8.6, ['Action', 'Drama'], 'English', 'PG13', 1495696292],
  ['Frozen II', 2019, 7.3, ['Animation', 'Family'], 'English', 'G', 1450026933],
  ['Barbie', 2023, 7.4, ['Comedy', 'Fantasy'], 'English', 'PG13', 1445638421],
  ['Avengers: Age of Ultron', 2015, 7.6, ['Action', 'Superhero'], 'English', 'PG13', 1405403694],
  ['Black Panther', 2018, 7.7, ['Action', 'Superhero'], 'English', 'PG13', 1347280838],
  ['Harry Potter and the Deathly Hallows Part 2', 2011, 8.5, ['Fantasy'], 'English', 'PG13', 1342025430],
  ['Star Wars: The Last Jedi', 2017, 7.2, ['Sci-Fi'], 'English', 'PG13', 1332539889],
  ['Jurassic World: Fallen Kingdom', 2018, 6.5, ['Action'], 'English', 'PG13', 1310466296],
  ['Frozen', 2013, 7.8, ['Animation', 'Family'], 'English', 'G', 1308968305],
  ['Beauty and the Beast (2017)', 2017, 7.3, ['Fantasy', 'Romance'], 'English', 'PG13', 1263521126],
  ['Incredibles 2', 2018, 7.8, ['Animation', 'Action'], 'English', 'PG13', 1242805359],
  ['The Fate of the Furious', 2017, 7.0, ['Action'], 'English', 'PG13', 1238764765],
  ['Iron Man 3', 2013, 7.5, ['Action', 'Superhero'], 'English', 'PG13', 1214811252],
  ['Minions', 2015, 6.7, ['Animation', 'Comedy'], 'English', 'PG13', 1159444662],
  ['Captain America: Civil War', 2016, 8.0, ['Action', 'Superhero'], 'English', 'PG13', 1153330269],
  ['Aquaman', 2018, 7.1, ['Action', 'Superhero'], 'English', 'PG13', 1148485886],
  ['The Lord of the Rings: The Return of the King', 2003, 9.2, ['Fantasy'], 'English', 'PG13', 1146457748],
  ['Spider-Man: Far From Home', 2019, 7.6, ['Action', 'Superhero'], 'English', 'PG13', 1131927996],
  ['Captain Marvel', 2019, 7.0, ['Action', 'Superhero'], 'English', 'PG13', 1128274794],
  ['Transformers: Dark of the Moon', 2011, 6.5, ['Action', 'Sci-Fi'], 'English', 'PG13', 1123794079],
  ['Skyfall', 2012, 8.0, ['Action', 'Spy'], 'English', 'PG13', 1108569499],
  ['Transformers: Age of Extinction', 2014, 6.0, ['Action', 'Sci-Fi'], 'English', 'PG13', 1104054072],
  ['The Dark Knight Rises', 2012, 8.5, ['Action', 'Crime'], 'English', 'PG13', 1081169825],
  ['Joker', 2019, 8.5, ['Crime', 'Drama'], 'English', 'R', 1078958629],
  ['Star Wars: The Rise of Skywalker', 2019, 6.8, ['Sci-Fi'], 'English', 'PG13', 1074148288],
  ['Toy Story 4', 2019, 8.0, ['Animation', 'Family'], 'English', 'G', 1073394593],
  ['Toy Story 3', 2010, 8.5, ['Animation', 'Family'], 'English', 'G', 1066969703],
  ["Pirates of the Caribbean: Dead Man's Chest", 2006, 7.5, ['Adventure', 'Fantasy'], 'English', 'PG13', 1066179725],
  ['Rogue One: A Star Wars Story', 2016, 8.0, ['Sci-Fi', 'Action'], 'English', 'PG13', 1056057273],
  ['Aladdin (2019)', 2019, 7.1, ['Fantasy'], 'English', 'PG13', 1050693953],
  ['Star Wars: Episode I – The Phantom Menace', 1999, 6.8, ['Sci-Fi'], 'English', 'PG13', 1046515408],
  ['Pirates of the Caribbean: On Stranger Tides', 2011, 6.8, ['Adventure'], 'English', 'PG13', 1045718065],
  ['Despicable Me 3', 2017, 6.5, ['Animation', 'Comedy'], 'English', 'PG13', 1034800131],
  ['Finding Dory', 2016, 7.5, ['Animation'], 'English', 'G', 1028571110],
  ['Zootopia', 2016, 8.3, ['Animation', 'Comedy'], 'English', 'PG13', 1025491110],
  ['The Hobbit: An Unexpected Journey', 2012, 8.0, ['Fantasy'], 'English', 'PG13', 1017003562],
  ['Alice in Wonderland (2010)', 2010, 6.7, ['Fantasy'], 'English', 'PG13', 1025469523],
  ['The Dark Knight', 2008, 9.3, ['Crime', 'Action'], 'English', 'PG13', 1006234167],
  ['Jurassic Park', 1993, 8.6, ['Adventure', 'Sci-Fi'], 'English', 'PG13', 1109802321],
  ["Harry Potter and the Philosopher's Stone", 2001, 8.0, ['Fantasy'], 'English', 'PG13', 1022263645],
  ['Despicable Me 2', 2013, 7.5, ['Animation', 'Comedy'], 'English', 'PG13', 970766005],
  ['The Lion King (1994)', 1994, 8.8, ['Animation', 'Drama'], 'English', 'G', 979750438],
  ['The Jungle Book (2016)', 2016, 7.7, ['Adventure'], 'English', 'PG13', 966554929],
  ["Pirates of the Caribbean: At World's End", 2007, 7.3, ['Adventure'], 'English', 'PG13', 963420425],
  ['Jumanji: Welcome to the Jungle', 2017, 7.1, ['Action', 'Comedy'], 'English', 'PG13', 962542327],
  ['Harry Potter and the Deathly Hallows Part 1', 2010, 7.9, ['Fantasy'], 'English', 'PG13', 977070383],
  ['The Hobbit: The Desolation of Smaug', 2013, 8.0, ['Fantasy'], 'English', 'PG13', 959027590],
  ['The Hobbit: The Battle of the Five Armies', 2014, 7.6, ['Fantasy'], 'English', 'PG13', 962201338],
  ['Finding Nemo', 2003, 8.5, ['Animation'], 'English', 'G', 941637012],
  ['Harry Potter and the Order of the Phoenix', 2007, 7.7, ['Fantasy'], 'English', 'PG13', 942201287],
  ['Harry Potter and the Half-Blood Prince', 2009, 7.8, ['Fantasy'], 'English', 'PG13', 934483039],
  ['Shrek 2', 2004, 7.5, ['Animation', 'Comedy'], 'English', 'PG13', 928760770],
  ['Bohemian Rhapsody', 2018, 8.0, ['Biography', 'Music'], 'English', 'PG13', 910809311],
  ['Spider-Man 3', 2007, 6.5, ['Action', 'Superhero'], 'English', 'PG13', 894983736],
  ['Harry Potter and the Goblet of Fire', 2005, 7.9, ['Fantasy'], 'English', 'PG13', 896911078],
  ['Spider-Man: Homecoming', 2017, 7.6, ['Action', 'Superhero'], 'English', 'PG13', 880166924],
  ['Batman v Superman: Dawn of Justice', 2016, 6.5, ['Action'], 'English', 'PG13', 873637528],
  ['The Lord of the Rings: The Two Towers', 2002, 9.1, ['Fantasy'], 'English', 'PG13', 947944270],
  ['The Lord of the Rings: The Fellowship of the Ring', 2001, 9.0, ['Fantasy'], 'English', 'PG13', 898204420],
  ['Spectre', 2015, 6.9, ['Action', 'Spy'], 'English', 'PG13', 880707375],
  ['Ice Age: Dawn of the Dinosaurs', 2009, 7.0, ['Animation'], 'English', 'PG13', 886686817],
  ['Wolf Warrior 2', 2017, 6.4, ['Action'], 'Chinese', 'R', 870325439],
  ['The Hunger Games: Catching Fire', 2013, 7.7, ['Action', 'Sci-Fi'], 'English', 'PG13', 865011746],
  ['Guardians of the Galaxy Vol. 2', 2017, 7.8, ['Action', 'Comedy'], 'English', 'PG13', 863756051],
  ['Inside Out', 2015, 8.4, ['Animation', 'Family'], 'English', 'PG13', 857611174],
  ['Venom', 2018, 6.8, ['Action', 'Superhero'], 'English', 'PG13', 856085151],
  ['Thor: Ragnarok', 2017, 8.0, ['Action', 'Comedy'], 'English', 'PG13', 853983309],
  ['Inception', 2010, 8.9, ['Sci-Fi', 'Thriller'], 'English', 'PG13', 836848102],
  ['Wonder Woman', 2017, 7.7, ['Action', 'Superhero'], 'English', 'PG13', 822854297],
  ['Fantastic Beasts and Where to Find Them', 2016, 7.4, ['Fantasy'], 'English', 'PG13', 814037575],
  ['Coco', 2017, 8.6, ['Animation', 'Family'], 'English', 'PG13', 807817888],
  ['Pirates of the Caribbean: The Curse of the Black Pearl', 2003, 8.1, ['Adventure'], 'English', 'PG13', 654264015],
  ['Interstellar', 2014, 8.9, ['Sci-Fi', 'Drama'], 'English', 'PG13', 773867826],
  ['Mission: Impossible – Fallout', 2018, 8.0, ['Action'], 'English', 'PG13', 791017452],
  ['Deadpool', 2016, 8.1, ['Action', 'Comedy'], 'English', 'R', 782612155],
  ['Deadpool 2', 2018, 7.8, ['Action', 'Comedy'], 'English', 'R', 785896634],
  ['The Matrix Reloaded', 2003, 7.3, ['Sci-Fi', 'Action'], 'English', 'R', 741847937],
  ['The Twilight Saga: Breaking Dawn – Part 2', 2012, 5.6, ['Romance'], 'English', 'PG13', 829746820],
  ['Transformers', 2007, 7.1, ['Action', 'Sci-Fi'], 'English', 'PG13', 709709780],
  ["Madagascar 3: Europe's Most Wanted", 2012, 6.9, ['Animation'], 'English', 'PG13', 746921274],
  ['The Twilight Saga: New Moon', 2009, 4.9, ['Romance'], 'English', 'PG13', 709711008],
  ['The Hunger Games', 2012, 7.3, ['Action', 'Sci-Fi'], 'English', 'PG13', 694394724],
  ['Guardians of the Galaxy', 2014, 8.2, ['Action', 'Comedy'], 'English', 'PG13', 773350147],
  ['Spider-Man', 2002, 7.5, ['Action', 'Superhero'], 'English', 'PG13', 825025036],
  ['Spider-Man 2', 2004, 7.7, ['Action', 'Superhero'], 'English', 'PG13', 788976453],
  ['It (2017)', 2017, 7.4, ['Horror'], 'English', 'R', 701842551],
  ['Fast & Furious 6', 2013, 7.2, ['Action'], 'English', 'PG13', 788680968],
  ['Iron Man', 2008, 8.0, ['Action', 'Superhero'], 'English', 'PG13', 585796247],
  ['Black Panther: Wakanda Forever', 2022, 7.0, ['Action', 'Superhero'], 'English', 'PG13', 859208836],
  ['Oppenheimer', 2023, 8.6, ['Biography', 'Drama'], 'English', 'R', 975811333],
];

const extraMovies = [
  'The Matrix', 'Gladiator', 'Forrest Gump', 'Fight Club', 'Pulp Fiction', 'The Godfather',
  'Schindler\'s List', 'Parasite', 'Whiplash', 'La La Land', 'Get Out', 'Dune (2021)',
  'Dune: Part Two', 'Everything Everywhere All at Once', 'Mad Max: Fury Road', 'John Wick',
  'The Social Network', 'Gone Girl', 'Her', 'Arrival', 'Blade Runner 2049', 'Logan',
  'Guardians of the Galaxy Vol. 3', 'No Country for Old Men', 'There Will Be Blood',
];
while (moviesRaw.length < 100) {
  const t = extraMovies[moviesRaw.length - 75] || `Cinema Classic ${moviesRaw.length + 1}`;
  moviesRaw.push([t, 1990 + (moviesRaw.length % 30), 7.5 + ((moviesRaw.length % 15) / 10), ['Drama'], 'English', 'PG13', 500000000 - moviesRaw.length * 1000000]);
}

const gameTitles = [
  ['Grand Theft Auto V', 2013, 9.4, ['Open World', 'Action'], 'Rockstar'],
  ['Minecraft', 2011, 9.2, ['Sandbox', 'Survival'], 'Mojang'],
  ['Elden Ring', 2022, 9.5, ['AAA Story Games', 'Action RPG'], 'FromSoftware'],
  ['The Witcher 3: Wild Hunt', 2015, 9.6, ['AAA Story Games', 'RPG'], 'CD Projekt Red'],
  ['Red Dead Redemption 2', 2018, 9.7, ['AAA Story Games', 'Open World'], 'Rockstar'],
  ['The Legend of Zelda: Breath of the Wild', 2017, 9.6, ['Adventure', 'Open World'], 'Nintendo'],
  ['The Legend of Zelda: Tears of the Kingdom', 2023, 9.5, ['Adventure', 'Open World'], 'Nintendo'],
  ['God of War', 2018, 9.4, ['AAA Story Games', 'Action'], 'Santa Monica'],
  ['God of War Ragnarök', 2022, 9.3, ['AAA Story Games', 'Action'], 'Santa Monica'],
  ['Cyberpunk 2077', 2020, 8.5, ['RPG', 'Open World'], 'CD Projekt Red'],
  ['Horizon Zero Dawn', 2017, 8.8, ['Action', 'Open World'], 'Guerrilla'],
  ['Horizon Forbidden West', 2022, 8.7, ['Action', 'Open World'], 'Guerrilla'],
  ['The Last of Us', 2013, 9.5, ['AAA Story Games', 'Survival'], 'Naughty Dog'],
  ['The Last of Us Part II', 2020, 9.2, ['AAA Story Games', 'Survival'], 'Naughty Dog'],
  ["Uncharted 4: A Thief's End", 2016, 9.1, ['Adventure', 'Action'], 'Naughty Dog'],
  ['Bloodborne', 2015, 9.3, ['Action RPG', 'Souls-like'], 'FromSoftware'],
  ['Dark Souls III', 2016, 9.0, ['Action RPG', 'Souls-like'], 'FromSoftware'],
  ['Sekiro: Shadows Die Twice', 2019, 9.2, ['Action', 'Souls-like'], 'FromSoftware'],
  ['Super Mario Odyssey', 2017, 9.4, ['Platformer'], 'Nintendo'],
  ['Mario Kart 8 Deluxe', 2017, 9.0, ['Racing'], 'Nintendo'],
  ['Animal Crossing: New Horizons', 2020, 8.7, ['Simulation'], 'Nintendo'],
  ['Call of Duty: Modern Warfare II', 2022, 8.0, ['FPS'], 'Infinity Ward'],
  ['Fortnite', 2017, 8.3, ['Battle Royale'], 'Epic Games'],
  ['League of Legends', 2009, 8.6, ['MOBA'], 'Riot'],
  ['Valorant', 2020, 8.5, ['FPS', 'Tactical'], 'Riot'],
  ['Counter-Strike 2', 2023, 8.4, ['FPS'], 'Valve'],
  ['Dota 2', 2013, 8.8, ['MOBA'], 'Valve'],
  ['Half-Life 2', 2004, 9.5, ['FPS', 'Story'], 'Valve'],
  ['Portal 2', 2011, 9.4, ['Puzzle'], 'Valve'],
  ['Overwatch 2', 2022, 7.8, ['FPS', 'Hero'], 'Blizzard'],
  ['World of Warcraft', 2004, 8.9, ['MMORPG'], 'Blizzard'],
  ['Diablo IV', 2023, 8.3, ['Action RPG'], 'Blizzard'],
  ['Hades', 2020, 9.3, ['Indie Games', 'Roguelike'], 'Supergiant'],
  ['Celeste', 2018, 9.2, ['Indie Games', 'Platformer'], 'Maddy Makes Games'],
  ['Hollow Knight', 2017, 9.3, ['Indie Games', 'Metroidvania'], 'Team Cherry'],
  ['Stardew Valley', 2016, 9.2, ['Indie Games', 'Farming'], 'ConcernedApe'],
  ['Genshin Impact', 2020, 8.4, ['Action RPG'], 'miHoYo'],
  ["Baldur's Gate 3", 2023, 9.7, ['AAA Story Games', 'CRPG'], 'Larian'],
  ['Disco Elysium', 2019, 9.4, ['Indie Games', 'RPG'], 'ZA/UM'],
  ['Persona 5 Royal', 2019, 9.5, ['JRPG'], 'AtlUS'],
  ['Final Fantasy VII Remake', 2020, 8.9, ['JRPG'], 'Square Enix'],
  ['Resident Evil 4 Remake', 2023, 9.2, ['Horror', 'Action'], 'Capcom'],
  ['Monster Hunter: World', 2018, 8.8, ['Action'], 'Capcom'],
  ['Street Fighter 6', 2023, 8.9, ['Fighting'], 'Capcom'],
  ['Metal Gear Solid V', 2015, 9.0, ['Stealth', 'Open World'], 'Kojima Productions'],
  ['Death Stranding', 2019, 8.4, ['Adventure'], 'Kojima Productions'],
  ['Marvel\'s Spider-Man', 2018, 8.9, ['Action', 'Open World'], 'Insomniac'],
  ['Marvel\'s Spider-Man 2', 2023, 9.0, ['Action', 'Open World'], 'Insomniac'],
  ['Ghost of Tsushima', 2020, 9.0, ['Action', 'Open World'], 'Sucker Punch'],
  ['Astro Bot', 2024, 9.3, ['Platformer'], 'Team Asobi'],
  ['Halo Infinite', 2021, 8.2, ['FPS'], '343 Industries'],
  ['Forza Horizon 5', 2021, 9.0, ['Racing', 'Open World'], 'Playground Games'],
  ["Assassin's Creed Valhalla", 2020, 8.0, ['Action', 'Open World'], 'Ubisoft'],
  ['Rainbow Six Siege', 2015, 8.5, ['Tactical FPS'], 'Ubisoft'],
  ['Apex Legends', 2019, 8.4, ['Battle Royale'], 'Respawn'],
  ['Titanfall 2', 2016, 9.0, ['FPS'], 'Respawn'],
  ['Doom Eternal', 2020, 9.0, ['FPS'], 'id Software'],
  ['BioShock Infinite', 2013, 9.1, ['FPS', 'Story'], 'Irrational'],
  ['Mass Effect 2', 2010, 9.4, ['AAA Story Games', 'RPG'], 'BioWare'],
  ['The Elder Scrolls V: Skyrim', 2011, 9.3, ['RPG', 'Open World'], 'Bethesda'],
  ['Fallout: New Vegas', 2010, 9.0, ['RPG', 'Open World'], 'Obsidian'],
  ['Outer Wilds', 2019, 9.3, ['Indie Games', 'Exploration'], 'Mobius'],
  ['Undertale', 2015, 9.2, ['Indie Games', 'RPG'], 'tobyfox'],
  ['Cuphead', 2017, 8.7, ['Indie Games'], 'Studio MDHR'],
  ['Ori and the Will of the Wisps', 2020, 9.0, ['Indie Games', 'Platformer'], 'Moon Studios'],
  ['It Takes Two', 2021, 9.0, ['Co-op', 'Adventure'], 'Hazelight'],
  ['Alan Wake 2', 2023, 9.1, ['Horror', 'Story'], 'Remedy'],
  ['Lies of P', 2023, 8.7, ['Souls-like'], 'Round8'],
  ['Black Myth: Wukong', 2024, 8.8, ['Action', 'Souls-like'], 'Game Science'],
  ['Helldivers 2', 2024, 8.5, ['Co-op', 'Shooter'], 'Arrowhead'],
  ['Sea of Thieves', 2018, 8.0, ['Adventure', 'Multiplayer'], 'Rare'],
  ["No Man's Sky", 2016, 8.2, ['Exploration', 'Survival'], 'Hello Games'],
  ['Terraria', 2011, 9.0, ['Sandbox'], 'Re-Logic'],
  ['Rocket League', 2015, 8.6, ['Sports'], 'Psyonix'],
  ['PUBG: Battlegrounds', 2017, 8.0, ['Battle Royale'], 'Krafton'],
  ['Silent Hill 2 Remake', 2024, 9.0, ['Horror'], 'Bloober'],
  ['Metaphor: ReFantazio', 2024, 9.1, ['JRPG'], 'AtlUS'],
  ['Hades II', 2024, 9.1, ['Indie Games', 'Roguelike'], 'Supergiant'],
  ['Palworld', 2024, 7.9, ['Survival'], 'Pocketpair'],
  ['Control', 2019, 8.5, ['Action'], 'Remedy'],
  ['A Plague Tale: Requiem', 2022, 8.6, ['AAA Story Games'], 'Asobo'],
  ['Devil May Cry 5', 2019, 8.9, ['Action'], 'Capcom'],
  ['Resident Evil Village', 2021, 8.6, ['Horror'], 'Capcom'],
  ['Final Fantasy XIV', 2013, 9.0, ['MMORPG'], 'Square Enix'],
  ['StarCraft II', 2010, 9.0, ['RTS'], 'Blizzard'],
  ['Team Fortress 2', 2007, 8.7, ['FPS'], 'Valve'],
  ['Among Us', 2018, 7.8, ['Party'], 'Innersloth'],
  ['Clash of Clans', 2012, 8.0, ['Strategy', 'Mobile'], 'Supercell'],
  ['Pokémon Scarlet', 2022, 7.5, ['RPG'], 'Game Freak'],
  ['Call of Duty: Warzone', 2020, 8.2, ['Battle Royale', 'FPS'], 'Infinity Ward'],
  ['Destiny 2', 2017, 8.1, ['Looter Shooter'], 'Bungie'],
  ['Far Cry 6', 2021, 7.6, ['FPS', 'Open World'], 'Ubisoft'],
  ['Watch Dogs 2', 2016, 8.0, ['Open World'], 'Ubisoft'],
  ['Ratchet & Clank: Rift Apart', 2021, 8.8, ['Platformer'], 'Insomniac'],
  ['Gears 5', 2019, 8.0, ['Action'], 'The Coalition'],
  ['FIFA 23', 2022, 7.5, ['Sports'], 'EA'],
  ['EA Sports FC 24', 2023, 7.4, ['Sports'], 'EA'],
  ['NBA 2K24', 2023, 7.2, ['Sports'], 'Visual Concepts'],
  ['Return of the Obra Dinn', 2018, 9.1, ['Indie Games', 'Mystery'], 'Lucas Pope'],
  ['Dragon Age: Inquisition', 2014, 8.5, ['RPG'], 'BioWare'],
  ['Wolfenstein II', 2017, 8.3, ['FPS'], 'MachineGames'],
];
while (gameTitles.length < 100) {
  gameTitles.push([`Acclaimed Game ${gameTitles.length + 1}`, 2005 + (gameTitles.length % 18), 7.8, ['Action'], 'Studio']);
}

const seriesRaw = [
  ['Breaking Bad', 2008, 9.5, ['Crime', 'Drama'], 'English', 'ADULT_18', 62],
  ['Game of Thrones', 2011, 9.2, ['Fantasy', 'Drama'], 'English', 'ADULT_18', 73],
  ['Attack on Titan', 2013, 9.1, ['Anime', 'Action'], 'Japanese', 'R', 89],
  ['Death Note', 2006, 9.0, ['Anime', 'Thriller'], 'Japanese', 'R', 37],
  ['The Office', 2005, 8.9, ['Comedy'], 'English', 'PG13', 201],
  ['Stranger Things', 2016, 8.7, ['Sci-Fi', 'Horror'], 'English', 'R', 34],
  ['The Wire', 2002, 9.3, ['Crime', 'Drama'], 'English', 'ADULT_18', 60],
  ['Friends', 1994, 8.9, ['Comedy'], 'English', 'PG13', 236],
  ['The Sopranos', 1999, 9.2, ['Crime', 'Drama'], 'English', 'ADULT_18', 86],
  ['Chernobyl', 2019, 9.4, ['Drama', 'History'], 'English', 'R', 5],
  ['Band of Brothers', 2001, 9.4, ['War', 'Drama'], 'English', 'R', 10],
  ['Sherlock', 2010, 9.1, ['Crime', 'Mystery'], 'English', 'PG13', 13],
  ['Better Call Saul', 2015, 9.0, ['Crime', 'Drama'], 'English', 'R', 63],
  ['True Detective', 2014, 8.9, ['Crime', 'Mystery'], 'English', 'ADULT_18', 30],
  ['Dark', 2017, 8.8, ['Sci-Fi', 'Thriller'], 'German', 'R', 26],
  ['The Mandalorian', 2019, 8.7, ['Sci-Fi', 'Adventure'], 'English', 'PG13', 24],
  ['The Boys', 2019, 8.7, ['Action', 'Satire'], 'English', 'ADULT_18', 32],
  ['Succession', 2018, 8.9, ['Drama', 'Comedy'], 'English', 'ADULT_18', 39],
  ['Arcane', 2021, 9.0, ['Animation', 'Action'], 'English', 'PG13', 18],
  ['Demon Slayer', 2019, 8.7, ['Anime', 'Action'], 'Japanese', 'R', 55],
  ['Fullmetal Alchemist: Brotherhood', 2009, 9.1, ['Anime', 'Adventure'], 'Japanese', 'PG13', 64],
  ['One Piece (Anime)', 1999, 9.0, ['Anime', 'Adventure'], 'Japanese', 'PG13', 1100],
  ['Hunter x Hunter (2011)', 2011, 9.0, ['Anime', 'Adventure'], 'Japanese', 'PG13', 148],
  ['Steins;Gate', 2011, 9.0, ['Anime', 'Sci-Fi'], 'Japanese', 'PG13', 24],
  ['Cowboy Bebop', 1998, 8.9, ['Anime', 'Sci-Fi'], 'Japanese', 'R', 26],
  ['Vinland Saga', 2019, 8.8, ['Anime', 'Historical'], 'Japanese', 'R', 48],
  ['Jujutsu Kaisen', 2020, 8.6, ['Anime', 'Action'], 'Japanese', 'R', 47],
  ['The Bear', 2022, 8.6, ['Comedy', 'Drama'], 'English', 'R', 28],
  ['Severance', 2022, 8.7, ['Sci-Fi', 'Thriller'], 'English', 'R', 19],
  ['Shogun', 2024, 8.8, ['Drama', 'History'], 'English', 'R', 10],
  ['The Last of Us (TV)', 2023, 8.7, ['Drama', 'Horror'], 'English', 'R', 9],
  ['Fallout (TV)', 2024, 8.4, ['Sci-Fi', 'Adventure'], 'English', 'R', 8],
  ['Peaky Blinders', 2013, 8.8, ['Crime', 'Drama'], 'English', 'R', 36],
  ['Black Mirror', 2011, 8.8, ['Sci-Fi', 'Anthology'], 'English', 'R', 27],
  ['Narcos', 2015, 8.8, ['Crime', 'Biography'], 'English', 'ADULT_18', 30],
  ['Fleabag', 2016, 8.7, ['Comedy', 'Drama'], 'English', 'ADULT_18', 12],
  ['Rick and Morty', 2013, 9.1, ['Animation', 'Comedy'], 'English', 'ADULT_18', 71],
  ['BoJack Horseman', 2014, 8.8, ['Animation', 'Comedy'], 'English', 'ADULT_18', 77],
  ['Avatar: The Last Airbender', 2005, 9.3, ['Animation', 'Adventure'], 'English', 'PG13', 61],
  ['Ted Lasso', 2020, 8.8, ['Comedy', 'Sports'], 'English', 'PG13', 34],
  ['Andor', 2022, 8.6, ['Sci-Fi', 'Drama'], 'English', 'PG13', 24],
  ['Squid Game', 2021, 8.0, ['Thriller'], 'Korean', 'R', 9],
  ['Money Heist', 2017, 8.2, ['Crime', 'Thriller'], 'Spanish', 'R', 41],
  ['Mr. Robot', 2015, 8.5, ['Thriller', 'Drama'], 'English', 'R', 45],
  ['The Expanse', 2015, 8.5, ['Sci-Fi'], 'English', 'R', 62],
  ['Westworld', 2016, 8.5, ['Sci-Fi'], 'English', 'ADULT_18', 36],
  ['Dexter', 2006, 8.6, ['Crime', 'Thriller'], 'English', 'ADULT_18', 96],
  ['Lost', 2004, 8.3, ['Mystery', 'Adventure'], 'English', 'PG13', 121],
  ['Mad Men', 2007, 8.7, ['Drama'], 'English', 'R', 92],
  ['Fargo', 2014, 8.9, ['Crime', 'Anthology'], 'English', 'R', 51],
  ['Mindhunter', 2017, 8.6, ['Crime', 'Thriller'], 'English', 'R', 19],
  ['Ozark', 2017, 8.5, ['Crime', 'Drama'], 'English', 'R', 44],
  ['House of the Dragon', 2022, 8.4, ['Fantasy'], 'English', 'ADULT_18', 18],
  ['Wednesday', 2022, 8.1, ['Comedy', 'Mystery'], 'English', 'PG13', 8],
  ['Only Murders in the Building', 2021, 8.1, ['Comedy', 'Mystery'], 'English', 'PG13', 30],
  ['What We Do in the Shadows', 2019, 8.6, ['Comedy', 'Horror'], 'English', 'R', 50],
  ['Invincible', 2021, 8.7, ['Animation', 'Action'], 'English', 'ADULT_18', 16],
  ['Gravity Falls', 2012, 8.9, ['Animation', 'Mystery'], 'English', 'PG13', 40],
  ['Brooklyn Nine-Nine', 2013, 8.4, ['Comedy'], 'English', 'PG13', 153],
  ['Parks and Recreation', 2009, 8.6, ['Comedy'], 'English', 'PG13', 125],
  ['Community', 2009, 8.5, ['Comedy'], 'English', 'PG13', 110],
  ['How I Met Your Mother', 2005, 8.3, ['Comedy'], 'English', 'PG13', 208],
  ['Prison Break', 2005, 8.3, ['Action', 'Thriller'], 'English', 'PG13', 90],
  ['Supernatural', 2005, 8.4, ['Fantasy', 'Horror'], 'English', 'PG13', 327],
  ['The Walking Dead', 2010, 8.1, ['Horror', 'Drama'], 'English', 'R', 177],
  ['Vikings', 2013, 8.5, ['Action', 'History'], 'English', 'R', 89],
  ['Doctor Who', 2005, 8.5, ['Sci-Fi'], 'English', 'PG13', 175],
  ['Twin Peaks', 1990, 8.8, ['Mystery', 'Drama'], 'English', 'R', 48],
  ['The Simpsons', 1989, 8.7, ['Animation', 'Comedy'], 'English', 'PG13', 750],
  ['South Park', 1997, 8.7, ['Animation', 'Comedy'], 'English', 'ADULT_18', 320],
  ['Futurama', 1999, 8.5, ['Animation', 'Sci-Fi'], 'English', 'PG13', 140],
  ["It's Always Sunny in Philadelphia", 2005, 8.8, ['Comedy'], 'English', 'R', 170],
  ['Blue Eye Samurai', 2023, 8.6, ['Animation', 'Action'], 'English', 'R', 8],
  ['Scavengers Reign', 2023, 8.5, ['Animation', 'Sci-Fi'], 'English', 'R', 12],
  ['Castlevania', 2017, 8.3, ['Animation', 'Horror'], 'English', 'ADULT_18', 32],
  ['Love, Death & Robots', 2019, 8.4, ['Animation', 'Anthology'], 'English', 'ADULT_18', 35],
  ['Neon Genesis Evangelion', 1995, 8.5, ['Anime', 'Mecha'], 'Japanese', 'R', 26],
  ['Mob Psycho 100', 2016, 8.6, ['Anime', 'Comedy'], 'Japanese', 'PG13', 37],
  ['My Hero Academia', 2016, 8.3, ['Anime', 'Action'], 'Japanese', 'PG13', 138],
  ['Naruto: Shippuden', 2007, 8.7, ['Anime', 'Action'], 'Japanese', 'PG13', 500],
  ['The Crown', 2016, 8.6, ['Drama', 'History'], 'English', 'PG13', 60],
  ['House of Cards', 2013, 8.6, ['Drama', 'Politics'], 'English', 'ADULT_18', 73],
  ['Euphoria', 2019, 8.3, ['Drama'], 'English', 'ADULT_18', 18],
  ['The Good Place', 2016, 8.2, ['Comedy', 'Fantasy'], 'English', 'PG13', 53],
  ['Atlanta', 2016, 8.6, ['Comedy', 'Drama'], 'English', 'R', 41],
  ['Barry', 2018, 8.4, ['Comedy', 'Crime'], 'English', 'R', 32],
  ['Halt and Catch Fire', 2014, 8.4, ['Drama', 'Tech'], 'English', 'PG13', 40],
  ['Foundation', 2021, 7.8, ['Sci-Fi'], 'English', 'PG13', 20],
  ['The Umbrella Academy', 2019, 7.9, ['Action', 'Fantasy'], 'English', 'R', 36],
  ['3 Body Problem', 2024, 7.6, ['Sci-Fi'], 'English', 'R', 8],
  ['The Morning Show', 2019, 8.0, ['Drama'], 'English', 'R', 30],
  ['Normal People', 2020, 8.0, ['Romance', 'Drama'], 'English', 'R', 12],
  ['Boardwalk Empire', 2010, 8.5, ['Crime', 'Drama'], 'English', 'ADULT_18', 56],
  ['Rome', 2005, 8.7, ['History', 'Drama'], 'English', 'ADULT_18', 22],
  ['Buffy the Vampire Slayer', 1997, 8.3, ['Fantasy', 'Action'], 'English', 'PG13', 144],
  ['The Legend of Korra', 2012, 8.4, ['Animation', 'Adventure'], 'English', 'PG13', 52],
  ['Pantheon', 2022, 8.4, ['Animation', 'Sci-Fi'], 'English', 'PG13', 16],
  ['Nathan for You', 2013, 8.8, ['Comedy'], 'English', 'PG13', 32],
  ['I Think You Should Leave', 2019, 8.1, ['Comedy', 'Sketch'], 'English', 'R', 18],
];
while (seriesRaw.length < 100) {
  seriesRaw.push([`Series Classic ${seriesRaw.length + 1}`, 2000 + (seriesRaw.length % 20), 7.6, ['Drama'], 'English', 'PG13', 12 + seriesRaw.length]);
}

const booksRaw = [
  ["Harry Potter and the Sorcerer's Stone", 1997, 9.0, ['Fantasy'], 'J.K. Rowling'],
  ['The Lord of the Rings', 1954, 9.3, ['Fantasy'], 'J.R.R. Tolkien'],
  ['The Hobbit', 1937, 9.0, ['Fantasy'], 'J.R.R. Tolkien'],
  ['Dune', 1965, 9.1, ['Sci-Fi'], 'Frank Herbert'],
  ['1984', 1949, 9.2, ['Dystopia', 'Classic Literature'], 'George Orwell'],
  ['To Kill a Mockingbird', 1960, 9.0, ['Classic Literature'], 'Harper Lee'],
  ['The Great Gatsby', 1925, 8.5, ['Classic Literature'], 'F. Scott Fitzgerald'],
  ['Pride and Prejudice', 1813, 8.8, ['Romance', 'Classic Literature'], 'Jane Austen'],
  ['The Catcher in the Rye', 1951, 8.2, ['Classic Literature'], 'J.D. Salinger'],
  ['Crime and Punishment', 1866, 8.9, ['Classic Literature'], 'Fyodor Dostoevsky'],
  ['The Brothers Karamazov', 1880, 9.0, ['Classic Literature'], 'Fyodor Dostoevsky'],
  ['One Hundred Years of Solitude', 1967, 8.9, ['Magical Realism'], 'Gabriel García Márquez'],
  ['Brave New World', 1932, 8.6, ['Dystopia'], 'Aldous Huxley'],
  ['Fahrenheit 451', 1953, 8.5, ['Dystopia'], 'Ray Bradbury'],
  ["The Hitchhiker's Guide to the Galaxy", 1979, 8.7, ['Sci-Fi', 'Comedy'], 'Douglas Adams'],
  ['Neuromancer', 1984, 8.4, ['Sci-Fi', 'Cyberpunk'], 'William Gibson'],
  ['Foundation', 1951, 8.6, ['Sci-Fi'], 'Isaac Asimov'],
  ['A Game of Thrones', 1996, 9.0, ['Fantasy'], 'George R.R. Martin'],
  ['The Name of the Wind', 2007, 8.8, ['Fantasy'], 'Patrick Rothfuss'],
  ['Mistborn: The Final Empire', 2006, 8.7, ['Fantasy'], 'Brandon Sanderson'],
  ['The Way of Kings', 2010, 9.0, ['Fantasy'], 'Brandon Sanderson'],
  ['American Gods', 2001, 8.5, ['Fantasy'], 'Neil Gaiman'],
  ['The Alchemist', 1988, 8.3, ['Fiction'], 'Paulo Coelho'],
  ['The Kite Runner', 2003, 8.4, ['Drama'], 'Khaled Hosseini'],
  ['Sapiens', 2011, 8.6, ['Nonfiction'], 'Yuval Noah Harari'],
  ['Atomic Habits', 2018, 8.4, ['Self-Help'], 'James Clear'],
  ['The Silent Patient', 2019, 8.1, ['Thriller'], 'Alex Michaelides'],
  ['Gone Girl', 2012, 8.2, ['Thriller'], 'Gillian Flynn'],
  ['The Girl with the Dragon Tattoo', 2005, 8.3, ['Thriller'], 'Stieg Larsson'],
  ['The Da Vinci Code', 2003, 7.5, ['Thriller'], 'Dan Brown'],
  ['The Shining', 1977, 8.5, ['Horror'], 'Stephen King'],
  ['It', 1986, 8.4, ['Horror'], 'Stephen King'],
  ['Frankenstein', 1818, 8.3, ['Horror', 'Classic Literature'], 'Mary Shelley'],
  ['Dracula', 1897, 8.2, ['Horror', 'Classic Literature'], 'Bram Stoker'],
  ['Les Misérables', 1862, 8.8, ['Classic Literature'], 'Victor Hugo'],
  ['Don Quixote', 1605, 8.5, ['Classic Literature'], 'Miguel de Cervantes'],
  ['Beloved', 1987, 8.5, ['Classic Literature'], 'Toni Morrison'],
  ['Things Fall Apart', 1958, 8.3, ['Classic Literature'], 'Chinua Achebe'],
  ["The Handmaid's Tale", 1985, 8.5, ['Dystopia'], 'Margaret Atwood'],
  ['Never Let Me Go', 2005, 8.2, ['Sci-Fi', 'Drama'], 'Kazuo Ishiguro'],
  ['Norwegian Wood', 1987, 8.1, ['Romance'], 'Haruki Murakami'],
  ['War and Peace', 1869, 8.7, ['Classic Literature'], 'Leo Tolstoy'],
  ['Moby-Dick', 1851, 8.0, ['Classic Literature'], 'Herman Melville'],
  ['Life of Pi', 2001, 8.2, ['Adventure'], 'Yann Martel'],
  ['Educated', 2018, 8.5, ['Memoir'], 'Tara Westover'],
  ['Good Omens', 1990, 8.6, ['Fantasy', 'Comedy'], 'Pratchett & Gaiman'],
  ['The Left Hand of Darkness', 1969, 8.5, ['Sci-Fi'], 'Ursula K. Le Guin'],
  ['Invisible Man', 1952, 8.4, ['Classic Literature'], 'Ralph Ellison'],
  ['Angels & Demons', 2000, 7.6, ['Thriller'], 'Dan Brown'],
  ['The Odyssey', 800, 8.6, ['Classic Literature', 'Epic'], 'Homer'],
];

const mangaRaw = [
  ['One Piece', 1997, 9.4, ['Shonen Manga', 'Adventure'], 'Eiichiro Oda'],
  ['Berserk', 1989, 9.5, ['Seinen Manga', 'Dark Fantasy'], 'Kentaro Miura'],
  ['Naruto', 1999, 8.7, ['Shonen Manga', 'Action'], 'Masashi Kishimoto'],
  ['Monster', 1994, 9.3, ['Seinen Manga', 'Thriller'], 'Naoki Urasawa'],
  ['Fullmetal Alchemist', 2001, 9.2, ['Shonen Manga', 'Adventure'], 'Hiromu Arakawa'],
  ['Death Note (Manga)', 2003, 8.9, ['Shonen Manga', 'Thriller'], 'Ohba & Obata'],
  ['Attack on Titan (Manga)', 2009, 9.0, ['Shonen Manga', 'Action'], 'Hajime Isayama'],
  ['Vagabond', 1998, 9.3, ['Seinen Manga', 'Historical'], 'Takehiko Inoue'],
  ['Vinland Saga (Manga)', 2005, 9.1, ['Seinen Manga', 'Historical'], 'Makoto Yukimura'],
  ['Hunter x Hunter', 1998, 9.2, ['Shonen Manga', 'Adventure'], 'Yoshihiro Togashi'],
  ['Bleach', 2001, 8.3, ['Shonen Manga', 'Action'], 'Tite Kubo'],
  ['Dragon Ball', 1984, 8.8, ['Shonen Manga', 'Action'], 'Akira Toriyama'],
  ["JoJo's Bizarre Adventure", 1987, 8.7, ['Shonen Manga', 'Action'], 'Hirohiko Araki'],
  ['Tokyo Ghoul', 2011, 8.2, ['Seinen Manga', 'Horror'], 'Sui Ishida'],
  ['Chainsaw Man', 2018, 8.8, ['Shonen Manga', 'Action'], 'Tatsuki Fujimoto'],
  ['Jujutsu Kaisen (Manga)', 2018, 8.6, ['Shonen Manga', 'Action'], 'Gege Akutami'],
  ['Demon Slayer (Manga)', 2016, 8.5, ['Shonen Manga', 'Action'], 'Koyoharu Gotouge'],
  ['My Hero Academia (Manga)', 2014, 8.3, ['Shonen Manga', 'Action'], 'Kohei Horikoshi'],
  ['Spy x Family', 2019, 8.5, ['Shonen Manga', 'Comedy'], 'Tatsuya Endo'],
  ['Haikyuu!!', 2012, 8.8, ['Shonen Manga', 'Sports'], 'Haruichi Furudate'],
  ['Slam Dunk', 1990, 9.0, ['Shonen Manga', 'Sports'], 'Takehiko Inoue'],
  ['Kingdom', 2006, 9.0, ['Seinen Manga', 'Historical'], 'Yasuhisa Hara'],
  ['20th Century Boys', 1999, 9.1, ['Seinen Manga', 'Mystery'], 'Naoki Urasawa'],
  ['Pluto', 2003, 8.9, ['Seinen Manga', 'Sci-Fi'], 'Naoki Urasawa'],
  ['Oyasumi Punpun', 2007, 9.0, ['Seinen Manga', 'Drama'], 'Inio Asano'],
  ['Akira', 1982, 8.8, ['Seinen Manga', 'Sci-Fi'], 'Katsuhiro Otomo'],
  ['Ghost in the Shell', 1989, 8.5, ['Seinen Manga', 'Sci-Fi'], 'Masamune Shirow'],
  ['Nausicaä of the Valley of the Wind', 1982, 8.9, ['Seinen Manga', 'Fantasy'], 'Hayao Miyazaki'],
  ['Fruits Basket', 1998, 8.6, ['Shojo', 'Romance'], 'Natsuki Takaya'],
  ['Nana', 2000, 8.7, ['Josei', 'Drama'], 'Ai Yazawa'],
  ['Sailor Moon', 1991, 8.2, ['Shojo', 'Magical Girl'], 'Naoko Takeuchi'],
  ['Cardcaptor Sakura', 1996, 8.4, ['Shojo', 'Magical Girl'], 'CLAMP'],
  ['Beck', 1999, 8.5, ['Seinen Manga', 'Music'], 'Harold Sakuishi'],
  ['Blue Lock', 2018, 8.2, ['Shonen Manga', 'Sports'], 'Muneyuki Kaneshiro'],
  ['Kaiju No. 8', 2020, 8.1, ['Shonen Manga', 'Action'], 'Naoya Matsumoto'],
  ['Dandadan', 2021, 8.6, ['Shonen Manga', 'Comedy'], 'Yukinobu Tatsu'],
  ["Frieren: Beyond Journey's End", 2020, 9.1, ['Shonen Manga', 'Fantasy'], 'Kanehito Yamada'],
  ['Uzumaki', 1998, 8.2, ['Horror', 'Seinen Manga'], 'Junji Ito'],
  ['Tomie', 1987, 8.0, ['Horror', 'Seinen Manga'], 'Junji Ito'],
  ['Blade of the Immortal', 1993, 8.6, ['Seinen Manga', 'Action'], 'Hiroaki Samura'],
  ['Lone Wolf and Cub', 1970, 8.7, ['Seinen Manga', 'Historical'], 'Koike & Kojima'],
  ['Solanin', 2005, 8.4, ['Seinen Manga', 'Slice of Life'], 'Inio Asano'],
  ['Paradise Kiss', 1999, 8.2, ['Josei', 'Romance'], 'Ai Yazawa'],
  ['Ouran High School Host Club', 2002, 8.3, ['Shojo', 'Comedy'], 'Bisco Hatori'],
  ['xxxHolic', 2003, 8.3, ['Seinen Manga', 'Supernatural'], 'CLAMP'],
  ['The Climber', 2007, 8.7, ['Seinen Manga', 'Sports'], 'Shinichi Sakamoto'],
  ['Homunculus', 2003, 8.4, ['Seinen Manga', 'Psychological'], 'Hideo Yamamoto'],
  ['Gantz', 2000, 8.3, ['Seinen Manga', 'Action'], 'Hiroya Oku'],
  ['Chobits', 2000, 7.8, ['Seinen Manga', 'Romance'], 'CLAMP'],
  ['Goodnight Punpun', 2007, 9.0, ['Seinen Manga', 'Drama'], 'Inio Asano'],
];

const engAlbums = [
  ['Thriller', 'Michael Jackson', 1982, 9.5, ['Pop', 'English Pop']],
  ['Abbey Road', 'The Beatles', 1969, 9.6, ['Rock', 'English Pop']],
  ['The Dark Side of the Moon', 'Pink Floyd', 1973, 9.5, ['Rock', 'Prog']],
  ['Back in Black', 'AC/DC', 1980, 9.0, ['Rock']],
  ['Rumours', 'Fleetwood Mac', 1977, 9.2, ['Rock', 'Pop']],
  ['Nevermind', 'Nirvana', 1991, 9.3, ['Grunge', 'Rock']],
  ['OK Computer', 'Radiohead', 1997, 9.4, ['Alt Rock']],
  ['Lemonade', 'Beyoncé', 2016, 9.1, ['R&B', 'Pop']],
  ['21', 'Adele', 2011, 8.8, ['Pop', 'Soul']],
  ['25', 'Adele', 2015, 8.6, ['Pop']],
  ['1989', 'Taylor Swift', 2014, 8.7, ['Pop', 'English Pop']],
  ['Midnights', 'Taylor Swift', 2022, 8.5, ['Pop']],
  ['Future Nostalgia', 'Dua Lipa', 2020, 8.4, ['Pop', 'Disco']],
  ['After Hours', 'The Weeknd', 2020, 8.6, ['R&B', 'Pop']],
  ['To Pimp a Butterfly', 'Kendrick Lamar', 2015, 9.4, ['Hip-Hop']],
  ['good kid, m.A.A.d city', 'Kendrick Lamar', 2012, 9.2, ['Hip-Hop']],
  ['DAMN.', 'Kendrick Lamar', 2017, 8.9, ['Hip-Hop']],
  ['My Beautiful Dark Twisted Fantasy', 'Kanye West', 2010, 9.3, ['Hip-Hop']],
  ['The Marshall Mathers LP', 'Eminem', 2000, 9.0, ['Hip-Hop']],
  ['Channel Orange', 'Frank Ocean', 2012, 9.1, ['R&B']],
  ['Blonde', 'Frank Ocean', 2016, 9.2, ['R&B']],
  ['Discovery', 'Daft Punk', 2001, 9.0, ['Electronic']],
  ['Random Access Memories', 'Daft Punk', 2013, 8.9, ['Electronic', 'Pop']],
  ['Legend', 'Bob Marley', 1984, 9.1, ['Reggae']],
  ['Purple Rain', 'Prince', 1984, 9.2, ['Pop', 'Rock']],
  ['Born to Run', 'Bruce Springsteen', 1975, 9.0, ['Rock']],
  ['Hotel California', 'Eagles', 1976, 9.0, ['Rock']],
  ['Led Zeppelin IV', 'Led Zeppelin', 1971, 9.3, ['Rock']],
  ['A Night at the Opera', 'Queen', 1975, 9.1, ['Rock']],
  ['The Wall', 'Pink Floyd', 1979, 9.2, ['Rock']],
  ['Pet Sounds', 'The Beach Boys', 1966, 9.3, ['Pop']],
  ['Revolver', 'The Beatles', 1966, 9.4, ['Rock', 'Pop']],
  ["Sgt. Pepper's Lonely Hearts Club Band", 'The Beatles', 1967, 9.3, ['Rock', 'Pop']],
  ['London Calling', 'The Clash', 1979, 9.2, ['Punk']],
  ['Exile on Main St.', 'The Rolling Stones', 1972, 9.1, ['Rock']],
  ['Blue', 'Joni Mitchell', 1971, 9.2, ['Folk']],
  ['Songs in the Key of Life', 'Stevie Wonder', 1976, 9.3, ['Soul']],
  ["What's Going On", 'Marvin Gaye', 1971, 9.4, ['Soul']],
  ['Kind of Blue', 'Miles Davis', 1959, 9.5, ['Jazz']],
  ['A Love Supreme', 'John Coltrane', 1965, 9.4, ['Jazz']],
  ['Illmatic', 'Nas', 1994, 9.3, ['Hip-Hop']],
  ['The Chronic', 'Dr. Dre', 1992, 9.0, ['Hip-Hop']],
  ['Ready to Die', 'The Notorious B.I.G.', 1994, 9.1, ['Hip-Hop']],
  ['Enter the Wu-Tang (36 Chambers)', 'Wu-Tang Clan', 1993, 9.2, ['Hip-Hop']],
  ['Homogenic', 'Björk', 1997, 9.0, ['Electronic', 'Art Pop']],
  ['Kid A', 'Radiohead', 2000, 9.2, ['Electronic', 'Alt Rock']],
  ['In Rainbows', 'Radiohead', 2007, 9.3, ['Alt Rock']],
  ['Is This It', 'The Strokes', 2001, 8.8, ['Indie Rock']],
  ['Funeral', 'Arcade Fire', 2004, 9.0, ['Indie Rock']],
  ['AM', 'Arctic Monkeys', 2013, 8.7, ['Indie Rock']],
  ['Currents', 'Tame Impala', 2015, 8.9, ['Psychedelic', 'Pop']],
  ['Melodrama', 'Lorde', 2017, 8.8, ['Pop', 'Art Pop']],
  ['Pure Heroine', 'Lorde', 2013, 8.6, ['Pop']],
  ['Ctrl', 'SZA', 2017, 8.8, ['R&B']],
  ['SOS', 'SZA', 2022, 8.7, ['R&B']],
  ['When We All Fall Asleep, Where Do We Go?', 'Billie Eilish', 2019, 8.5, ['Pop']],
  ['Happier Than Ever', 'Billie Eilish', 2021, 8.4, ['Pop']],
  ['Astroworld', 'Travis Scott', 2018, 8.3, ['Hip-Hop']],
  ['Take Care', 'Drake', 2011, 8.6, ['Hip-Hop', 'R&B']],
  ['Anti', 'Rihanna', 2016, 8.4, ['R&B', 'Pop']],
  ['Cowboy Carter', 'Beyoncé', 2024, 8.6, ['Country', 'Pop']],
  ['Chromatica', 'Lady Gaga', 2020, 7.8, ['Pop', 'Dance']],
  ['The Fame Monster', 'Lady Gaga', 2009, 8.5, ['Pop']],
  ['folklore', 'Taylor Swift', 2020, 9.0, ['Indie Folk', 'Pop']],
  ['evermore', 'Taylor Swift', 2020, 8.8, ['Indie Folk']],
  ['Fine Line', 'Harry Styles', 2019, 8.3, ['Pop', 'Rock']],
  ['Lover', 'Taylor Swift', 2019, 8.2, ['Pop']],
  ['Born This Way', 'Lady Gaga', 2011, 8.0, ['Pop']],
  ['Views', 'Drake', 2016, 7.9, ['Hip-Hop']],
  ['Harry\'s House', 'Harry Styles', 2022, 8.1, ['Pop']],
];

const hindiAlbums = [
  ['Dil Se', 'A.R. Rahman', 1998, 9.0, ['Hindi Pop', 'Filmi']],
  ['Rangeela', 'A.R. Rahman', 1995, 8.8, ['Hindi Pop']],
  ['Rockstar', 'A.R. Rahman', 2011, 8.9, ['Hindi Pop', 'Rock']],
  ['Tamasha', 'A.R. Rahman', 2015, 8.5, ['Hindi Pop']],
  ['Kal Ho Naa Ho', 'Shankar-Ehsaan-Loy', 2003, 8.7, ['Hindi Pop']],
  ['Kabhi Khushi Kabhie Gham', 'Jatin-Lalit', 2001, 8.4, ['Hindi Pop']],
  ['Dilwale Dulhania Le Jayenge', 'Jatin-Lalit', 1995, 8.8, ['Hindi Pop', 'Romance']],
  ['Hum Aapke Hain Koun', 'Raamlaxman', 1994, 8.3, ['Hindi Pop']],
  ['Aashiqui 2', 'Mithoon / Jeet Gannguli', 2013, 8.6, ['Hindi Pop', 'Romance']],
  ['Ae Dil Hai Mushkil', 'Pritam', 2016, 8.2, ['Hindi Pop']],
  ['Yeh Jawaani Hai Deewani', 'Pritam', 2013, 8.5, ['Hindi Pop']],
  ['Barfi!', 'Pritam', 2012, 8.4, ['Hindi Pop']],
  ['Jab We Met', 'Pritam', 2007, 8.3, ['Hindi Pop']],
  ['Love Aaj Kal', 'Pritam', 2009, 8.1, ['Hindi Pop']],
  ['Wake Up Sid', 'Shankar-Ehsaan-Loy', 2009, 8.2, ['Hindi Pop']],
  ['Zindagi Na Milegi Dobara', 'Shankar-Ehsaan-Loy', 2011, 8.4, ['Hindi Pop']],
  ['Rock On!!', 'Shankar-Ehsaan-Loy', 2008, 8.5, ['Hindi Pop', 'Rock']],
  ['Delhi-6', 'A.R. Rahman', 2009, 8.3, ['Hindi Pop']],
  ['Jodhaa Akbar', 'A.R. Rahman', 2008, 8.6, ['Hindi Pop', 'Classical']],
  ['Lagaan', 'A.R. Rahman', 2001, 8.7, ['Hindi Pop']],
  ['Slumdog Millionaire', 'A.R. Rahman', 2008, 8.8, ['Hindi Pop', 'Soundtrack']],
  ['Gully Boy', 'Divine / Naezy / Various', 2019, 8.5, ['Hindi Pop', 'Hip-Hop']],
  ['Queen', 'Amit Trivedi', 2014, 8.3, ['Hindi Pop']],
  ['Dev.D', 'Amit Trivedi', 2009, 8.7, ['Hindi Pop', 'Alt']],
  ['Udta Punjab', 'Amit Trivedi', 2016, 8.2, ['Hindi Pop']],
  ['Atrangi Re', 'A.R. Rahman', 2021, 8.0, ['Hindi Pop']],
  ['Raazi', 'Shankar-Ehsaan-Loy', 2018, 8.1, ['Hindi Pop']],
  ['Band Baaja Baaraat', 'Salim–Sulaiman', 2010, 8.2, ['Hindi Pop']],
  ['Raanjhanaa', 'A.R. Rahman', 2013, 8.4, ['Hindi Pop']],
  ['Kesari', 'Tanishk / Various', 2019, 7.8, ['Hindi Pop']],
];

// ─── Summary builders (unique per title via content hash) ───
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CURATED_SUMMARIES = {
  Avatar: 'A disabled marine infiltrates the lush moon Pandora through a genetically linked avatar, torn between corporate conquest and the indigenous Na\'vi way of life.',
  'Avengers: Endgame': 'The surviving heroes mount a desperate time-travel mission to undo Thanos\'s snap and restore the trillions lost across the universe.',
  Titanic: 'A wealthy passenger and a poor artist fall in love aboard the doomed maiden voyage of the RMS Titanic in 1912.',
  'Breaking Bad': 'Chemistry teacher Walter White turns to cooking meth with former student Jesse after a cancer diagnosis upends his quiet suburban life.',
  'Game of Thrones': 'Noble families of Westeros wage war for the Iron Throne as an ancient supernatural threat returns beyond the Wall.',
  'Grand Theft Auto V': 'Three criminals plan daring heists across Los Santos while navigating betrayal, federal agents, and street-level chaos.',
  Elden Ring: 'The Tarnished explores the shattered Lands Between to restore the Elden Ring and become Elden Lord.',
  'The Witcher 3: Wild Hunt': 'Monster hunter Geralt searches for his adopted daughter Ciri while political war engulfs the Continent.',
  'Red Dead Redemption 2': 'Outlaw Arthur Morgan flees federal agents and rival gangs across a dying American frontier in 1899.',
  Minecraft: 'Players mine resources, craft tools, and build limitless structures in procedurally generated worlds alone or with friends.',
  'Attack on Titan': 'Humanity fights man-eating Titans behind walls until Eren Yeager uncovers horrifying truths about their world.',
  'Death Note': 'Student Light Yagami uses a supernatural notebook to kill criminals, battling genius detective L in a deadly cat-and-mouse game.',
  One Piece: 'Monkey D. Luffy gathers a pirate crew to find the One Piece and become Pirate King across the Grand Line.',
  Berserk: 'Guts, branded for death, hunts Griffith and apostles in a brutal medieval dark fantasy of ambition and revenge.',
  'Harry Potter and the Sorcerer\'s Stone': 'Orphan Harry Potter discovers he is a wizard and enters Hogwarts, where dark secrets await in his first year.',
  Dune: 'Paul Atreides navigates desert planet Arrakis\'s politics, spice trade, and prophetic destiny amid interstellar intrigue.',
  1984: 'Winston Smith rebels against Big Brother\'s totalitarian surveillance state in dystopian Oceania.',
  Thriller: 'Michael Jackson\'s blockbuster album defined 1980s pop with seven Top 10 singles including Billie Jean and Beat It.',
  'Abbey Road': 'The Beatles\' final recorded album features iconic medleys and George Harrison\'s Here Comes the Sun.',
  'Dil Se': 'A.R. Rahman\'s soundtrack for the Mani Ratnam film blends haunting romance with the unforgettable Chaiyya Chaiyya.',
};

function curatedOrBuild(title, type, genres, year, extra = {}) {
  if (CURATED_SUMMARIES[title]) return CURATED_SUMMARIES[title];
  const h = hashStr(title);
  const g0 = (genres[0] || 'drama').toLowerCase();
  const g1 = (genres[1] || genres[0] || 'story').toLowerCase();
  const templates = {
    MOVIE: [
      `Released in ${year}, ${title} delivers ${g0} spectacle and ${g1} stakes that resonated with audiences worldwide.`,
      `${title} pairs ${g0} tension with emotional ${g1} storytelling across a landmark theatrical run.`,
      `Critics and crowds embraced ${title} for its ${g0} craft and memorable characters set against ${g1} conflict.`,
      `In ${year}, ${title} became a defining ${g0} entry whose ${g1} themes still spark conversation today.`,
    ],
    GAME: [
      `${title} rewards players with deep ${g0} systems and ${g1} design that influenced countless titles after ${year}.`,
      `Developers crafted ${title} as a ${g0} experience where ${g1} choices and mastery keep communities engaged years later.`,
      `${title} stands out in ${g0} gaming for polished ${g1} mechanics and a world players keep revisiting.`,
      `Since ${year}, ${title} has earned praise for balancing ${g0} challenge with accessible ${g1} progression.`,
    ],
    SERIES: [
      `${title} captivated viewers with layered ${g0} plotting and ${g1} character arcs across its run from ${year}.`,
      `From ${year}, ${title} built a devoted audience through sharp ${g0} writing and escalating ${g1} drama.`,
      `${title} remains essential ${g0} television, blending ${g1} suspense with performances fans still debate.`,
      `Each season of ${title} deepens its ${g0} world while pushing ${g1} stakes in unexpected directions.`,
    ],
    BOOK: [
      `${extra.author || 'Its author'} weaves ${g0} and ${g1} themes into ${title}, a novel readers return to for generations.`,
      `${title} explores ${g0} identity and ${g1} conflict through prose that helped define modern literary conversation.`,
      `Readers discover ${title} as a ${g0} landmark where ${g1} ideas unfold with lasting emotional weight.`,
      `Published in ${year}, ${title} endures as a ${g0} touchstone rich with ${g1} insight and memorable voice.`,
    ],
    MANGA: [
      `${extra.author || 'Its creator'} draws ${title} with ${g0} intensity, balancing ${g1} action and quiet character moments.`,
      `${title} pushes ${g0} manga conventions through ${g1} storytelling that fans cite as genre-defining since ${year}.`,
      `Serialized from ${year}, ${title} builds a ${g0} saga where ${g1} themes land with visceral impact.`,
      `${title} remains vital ${g0} reading for its ${g1} artistry and characters who grow across hundreds of chapters.`,
    ],
    MUSIC_ALBUM: [
      `${extra.artist || 'The artist'} shaped ${title} into a ${g0} statement blending ${g1} production with chart dominance.`,
      `Released in ${year}, ${title} captures ${g0} emotion through ${g1} arrangements that still fill playlists worldwide.`,
      `${title} by ${extra.artist || 'its performer'} distills ${g0} craft into ${g1} hooks that defined an era of listening.`,
      `Listeners praise ${title} for ${g0} songwriting and ${g1} sonics that earned both critical acclaim and mass appeal.`,
    ],
  };
  const pool = templates[type] || templates.MOVIE;
  return pool[h % pool.length];
}

const MOVIE_DIRECTORS = {
  Avatar: 'James Cameron', 'Avengers: Endgame': 'Anthony Russo', Titanic: 'James Cameron',
  'The Dark Knight': 'Christopher Nolan', Inception: 'Christopher Nolan', Interstellar: 'Christopher Nolan',
  'Jurassic Park': 'Steven Spielberg', 'E.T. the Extra-Terrestrial': 'Steven Spielberg',
  'Pulp Fiction': 'Quentin Tarantino', 'The Godfather': 'Francis Ford Coppola',
  'Star Wars: The Force Awakens': 'J.J. Abrams', Joker: 'Todd Phillips',
};

function mapMovies() {
  return moviesRaw.slice(0, 100).map((m, i) => {
    const rank = i + 1;
    const title = m[0];
    const genres = m[3];
    const year = m[1];
    return {
      title,
      type: 'MOVIE',
      genreTags: genres,
      summary: curatedOrBuild(title, 'MOVIE', genres, year),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: m[4],
      maturityRating: m[5],
      metadata: {
        director: MOVIE_DIRECTORS[title] || 'Various',
        runtime: 95 + (hashStr(title) % 100),
        cast: [`${title.split(/[: ]/)[0]} Lead`, 'Supporting Star'],
        studio: rank <= 20 ? 'Major Studio' : 'Studio',
        globalGrossUSD: m[6],
      },
      averageRating: Math.min(9.5, Math.max(6.5, m[2])),
    };
  });
}

function mapGames() {
  return gameTitles.slice(0, 100).map((g, i) => {
    const rank = i + 1;
    const title = g[0];
    const genres = g[3];
    const year = g[1];
    const developer = g[4];
    return {
      title,
      type: 'GAME',
      genreTags: genres,
      summary: curatedOrBuild(title, 'GAME', genres, year, { developer }),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: 'English',
      maturityRating: genres.some((t) => /Horror|Souls/i.test(t)) ? 'R' : 'PG13',
      metadata: {
        developer,
        publisher: developer,
        platforms: ['PC', 'Console'],
        unitsSold: rank <= 10 ? '10M+' : '1M+',
      },
      averageRating: Math.min(9.5, Math.max(6.5, g[2])),
    };
  });
}

function mapSeries() {
  return seriesRaw.slice(0, 100).map((s, i) => {
    const rank = i + 1;
    const title = s[0];
    const genres = s[3];
    const year = s[1];
    return {
      title,
      type: 'SERIES',
      genreTags: genres,
      summary: curatedOrBuild(title, 'SERIES', genres, year),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: s[4],
      maturityRating: s[5],
      metadata: {
        creator: title.split(' ')[0] + ' Team',
        seasons: Math.max(1, Math.floor(s[6] / 12)),
        episodes: s[6],
        network: s[4] === 'Japanese' ? 'TV Tokyo' : 'Streaming',
      },
      averageRating: Math.min(9.5, Math.max(6.5, s[2])),
    };
  });
}

function mapBooks() {
  return booksRaw.slice(0, 50).map((b, i) => {
    const rank = i + 1;
    const title = b[0];
    const genres = b[3];
    const year = Math.max(1, b[1]);
    const author = b[4];
    return {
      title,
      type: 'BOOK',
      genreTags: genres,
      summary: curatedOrBuild(title, 'BOOK', genres, year, { author }),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: 'English',
      maturityRating: genres.some((t) => /Horror|Dystopia/i.test(t)) ? 'R' : 'PG13',
      metadata: {
        author,
        pages: 200 + (hashStr(title) % 600),
        publisher: 'Major Publisher',
      },
      averageRating: Math.min(9.5, Math.max(6.5, b[2])),
    };
  });
}

function mapManga() {
  return mangaRaw.slice(0, 50).map((m, i) => {
    const rank = i + 1;
    const title = m[0];
    const genres = m[3];
    const year = m[1];
    const author = m[4];
    return {
      title,
      type: 'MANGA',
      genreTags: genres,
      summary: curatedOrBuild(title, 'MANGA', genres, year, { author }),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: 'Japanese',
      maturityRating: genres.some((t) => /Seinen|Horror/i.test(t)) ? 'R' : 'PG13',
      metadata: {
        author,
        volumes: 10 + (hashStr(title) % 90),
        magazine: 'Weekly Magazine',
      },
      averageRating: Math.min(9.5, Math.max(6.5, m[2])),
    };
  });
}

function mapAlbums() {
  const eng = engAlbums.slice(0, 70).map((a, i) => {
    const rank = i + 1;
    const title = a[0];
    const artist = a[1];
    const year = a[2];
    const genres = a[4];
    return {
      title,
      type: 'MUSIC_ALBUM',
      genreTags: genres,
      summary: curatedOrBuild(title, 'MUSIC_ALBUM', genres, year, { artist }),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: 'English',
      maturityRating: 'PG13',
      metadata: { artist, tracks: 8 + (hashStr(title) % 12), label: 'Major Label' },
      averageRating: Math.min(9.5, Math.max(6.5, a[3])),
    };
  });
  const hindi = hindiAlbums.slice(0, 30).map((a, i) => {
    const rank = 71 + i;
    const title = a[0];
    const artist = a[1];
    const year = a[2];
    const genres = a[4];
    return {
      title,
      type: 'MUSIC_ALBUM',
      genreTags: genres,
      summary: curatedOrBuild(title, 'MUSIC_ALBUM', genres, year, { artist }),
      boxOfficeOrRank: rank,
      releaseYear: year,
      language: 'Hindi',
      maturityRating: 'PG13',
      metadata: { artist, tracks: 6 + (hashStr(title) % 10), label: 'T-Series' },
      averageRating: Math.min(9.5, Math.max(6.5, a[3])),
    };
  });
  return [...eng, ...hindi];
}

const movies = mapMovies();
const games = mapGames();
const series = mapSeries();
const books = mapBooks();
const manga = mapManga();
const musicAlbums = mapAlbums();

const out = `export const movies = ${JSON.stringify(movies, null, 2)};
export const games = ${JSON.stringify(games, null, 2)};
export const series = ${JSON.stringify(series, null, 2)};
export const books = ${JSON.stringify(books, null, 2)};
export const manga = ${JSON.stringify(manga, null, 2)};
export const musicAlbums = ${JSON.stringify(musicAlbums, null, 2)};

export const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Theo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Naomi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamal',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Anika',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
];

export default { movies, games, series, books, manga, musicAlbums, AVATAR_PRESETS };
`;

fs.writeFileSync(path.join(__dirname, 'seedData.js'), out);
console.log({
  movies: movies.length,
  games: games.length,
  series: series.length,
  books: books.length,
  manga: manga.length,
  albums: musicAlbums.length,
  total: movies.length + games.length + series.length + books.length + manga.length + musicAlbums.length,
});
