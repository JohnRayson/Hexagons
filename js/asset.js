/*
The plan. 
There will be villages
A village will produce a set amount of resources each turn - as will the land surrounding it. 
1. This will be multipliers based on the season
2. This will be multipliers based on hex distance from village
3. This will be multiplied by (population / distance) 
4. Hexes will only produce if there are enough people to start working at the given distance ie, all closer hexes are fully working

See the Spreadsheet

*/

Namespace("game.asset");

game.asset.obj = {
    type: "",
    move: -1,
    clipX: 0,
    clipY: 0,
    clipWidth: 0,
    clipHeight: 0
}

game.asset.tileIncome = {
    "grass": { "food": 1 },
    "forest": { "food": -0.75, "wood": 1 },
    "water": { "food": 0.5 },
    "mountain": { "food": -1, "ore": 2 }
}

game.asset.calcExpenditure = function (population)
{
    
    var foodPerPerson = 0.35
    return { "food": utils.roundTo((population * foodPerPerson), 2) };
}

game.asset.calcRegionIncome = function (x, y, population)
{
    var incomes = [];
    // current hex
    incomes.push(game.asset.calcTileIncome(game.map.hexAssets(x, y, "land"), 1, population, "spring"));
    // nearest neighbours
    var neighbours = game.map.getNeighboursAtRange(x, y, 1);
    for (var i = 0; i < neighbours.length; i++)
    {
        incomes.push(game.asset.calcTileIncome(game.map.hexAssets(neighbours[i].x, neighbours[i].y, "land"), 2, population, "spring"));
    }
    // and the same for the next ring out
    var neighbours = game.map.getNeighboursAtRange(x, y, 2);
    for (var i = 0; i < neighbours.length; i++)
    {
        incomes.push(game.asset.calcTileIncome(game.map.hexAssets(neighbours[i].x, neighbours[i].y, "land"), 3, population, "spring"));
    }

    var totalIncome = {};

    for (var i = 0; i < incomes.length; i++)
    {
        for (var member in incomes[i])
        {
            if (typeof (totalIncome[member]) == "undefined")
                totalIncome[member] = incomes[i][member];
            else
                totalIncome[member] += incomes[i][member];
        }
    }

    return totalIncome;
}
game.asset.rangeLookup = [1, 8, 12, 18];
game.asset.calcTileIncome = function (lands, range, population, season)
{
    // calc population at this range
    var lastPop = 0;
    var rangeI = 0;
    for (rangeI = 0; rangeI < range && population > 0; rangeI++)
    {
        lastPop = population;
        population = (population - game.asset.rangeLookup[rangeI]);
    }
    // trim it to the max available at this range
    population = (lastPop > game.asset.rangeLookup[(rangeI - 1)] ? game.asset.rangeLookup[(rangeI - 1)] : lastPop);

    // get the tile multiplier based on this
    var tileMulti = (population / game.asset.rangeLookup[(range - 1)]);

    var reply = {};

    for (i in lands)
    {
        var incomeType = game.asset.tileIncome[lands[i]];

        for (var member in incomeType)
        {
            if (typeof (reply[member]) == "undefined")
                reply[member] = utils.roundTo((incomeType[member] * tileMulti),2);
            else
                reply[member] += utils.roundTo((incomeType[member] * tileMulti), 2);
        }
    }

    return reply;
}