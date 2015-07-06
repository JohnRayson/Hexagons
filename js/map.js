

$(window).resize(function ()
{
    game.map.drawGrid();
});
$(document).ready(function ()
{
    game.map = new game.mapObj("map");
    game.loadMap();

    $("#clearDebug").click(function ()
    {
        $("#debugDisplay").html("");
    });
}).on("contextmenu", function ()
{
    return false;
});

Namespace("game");
game.map = null;
game.action = null;

game.loadMap = function()
{
    game.generateRandomGrid(game.map, 50, 25);

    game.map._tiles = new game.spriteSheet(game.map, "images/Hexagons.png", 70, 80, function (sheet)
    {
        var rowHeight = sheet._rowHeight;
        var colWidth = sheet._colWidth;

        game.map._tiles._asset["grass"] = $.extend(game.map._tiles._asset["grass"], game.assetObj, {  type: "land", move: 1,  clipWidth: colWidth, clipHeight: rowHeight });
        game.map._tiles._asset["forest"] = $.extend(game.map._tiles._asset["forest"], game.assetObj, { type: "land", move: 1,  clipY: (rowHeight * 1), clipWidth: colWidth, clipHeight: rowHeight });
        game.map._tiles._asset["water"] = $.extend(game.map._tiles._asset["water"], game.assetObj, {  type: "land", move: 100, clipY: (rowHeight * 2), clipWidth: colWidth, clipHeight: rowHeight });

        game.map._tiles._asset["water-0"] = $.extend(game.map._tiles._asset["water-0"], game.assetObj,{ clipX: ((colWidth + 1) * 5),    clipY: (rowHeight * 2),   clipWidth: colWidth,       clipHeight: (rowHeight / 2) });
        game.map._tiles._asset["water-1"] = $.extend(game.map._tiles._asset["water-1"], game.assetObj,{ clipX: ((colWidth + 1) * 4.49), clipY: (rowHeight * 2),   clipWidth: (colWidth / 2), clipHeight: 45, xOffset: (colWidth / 2) });
        game.map._tiles._asset["water-2"] = $.extend(game.map._tiles._asset["water-2"], game.assetObj,{ clipX: ((colWidth + 1) * 5.49), clipY: (rowHeight * 2.5), clipWidth: colWidth,       clipHeight: 55, xOffset: (colWidth / 2), yOffset: (rowHeight / 2) });
        game.map._tiles._asset["water-3"] = $.extend(game.map._tiles._asset["water-3"], game.assetObj,{ clipX: ((colWidth + 1) * 4),    clipY: (rowHeight * 2.7), clipWidth: colWidth,       clipHeight: 20, yOffset: 50 });
        game.map._tiles._asset["water-4"] = $.extend(game.map._tiles._asset["water-4"], game.assetObj,{ clipX: ((colWidth + 1) * 5),    clipY: (rowHeight * 2.5), clipWidth: (colWidth / 2), clipHeight: 55, yOffset: (rowHeight / 2) });
        game.map._tiles._asset["water-5"] = $.extend(game.map._tiles._asset["water-5"], game.assetObj,{ clipX: ((colWidth + 1) * 4),    clipY: (rowHeight * 2),   clipWidth: (colWidth / 2), clipHeight: 45 });

        game.map._tiles._asset["red"] = $.extend(game.map._tiles._asset["red"], game.assetObj, { type: "overlay", clipX: ((colWidth + 1) * 7), clipWidth: colWidth, clipHeight: rowHeight });
        game.map._tiles._asset["white"] = $.extend(game.map._tiles._asset["white"], game.assetObj, { type: "overlay", clipX: ((colWidth + 1) * 8), clipWidth: colWidth, clipHeight: rowHeight });

        game.map._tiles._asset["dwarf-spear"] = $.extend(game.map._tiles._asset["dwarf-spear"], game.assetObj, { type: "troop", move: 2, clipX: ((colWidth + 1) * 7), clipY: rowHeight, clipWidth: colWidth, clipHeight: rowHeight });

        game.map.drawGrid();
    });

    $("#changeSeason").click(function ()
    {
        game.map.changeSeason();
    });
    $("#saveMap").click(function ()
    {
        alert(JSON.stringify(game.map._hexs));
    });

    $("#map").mousedown(function (e)
    {
        var offset = $(this).offset();
        var mouseX = e.clientX - offset.left;
        var mouseY = e.clientY - offset.top;

        switch(e.which)
        {
            case 1: // left
                
                var pos = game.map.getClickedHex(mouseX, mouseY);                
                game.hexClicked(pos);

                break;
            case 2: // middle
                break;
            case 3: // right
                var pos = game.map.getClickedHex(mouseX, mouseY);
                var centre = game.map.getCentreHex();

                var xOffset = 0;
                var yOffset = 0;

                // 2 * Math.round(underbust / 2);
                xOffset = (2 * Math.round((pos.x - centre.x) / 2));
                yOffset = (2 * Math.round((pos.y - centre.y) / 2));

                game.map.changeOrigin(xOffset, yOffset);
                game.map.drawGrid();
                break;
        }
    });
}

game.assetObj = {
    type: "",
    move: -1,
    clipX: 0,
    clipY: 0,
    clipWidth: 0,
    clipHeight: 0
}

game.generateRandomGrid = function(map, width, height)
{
    map._hexs = [];
    for (var x = 0; x < width; x++)
    {
        map._hexs[x] = [];
        for (var y = 0; y < height; y++)
        {
            var rand = Math.random();
            if (rand < 0.4)
            {
                map._hexs[x][y] = ["grass"];
                if (rand < 0.05)
                    game.map._troops.push(new game.troop(x, y, "dwarf-spear"));
            }
            else if (rand < 0.8)
                map._hexs[x][y] = ["grass", "forest"];
            else
                map._hexs[x][y] = ["water"];
        }
    }

    // loop over
    for (var x = 0; x < width; x++)
    {
        for (var y = 0; y < height; y++)
        {
            if (map.hexContains(x, y, "water"))
            {
                var neighbours = map.getNeighbours(x, y);
                for (var i = 0; i < neighbours.length; i++)
                {
                    if (neighbours[i] && map.hexContains(neighbours[i].x, neighbours[i].y, "grass"))
                        game.map.addAsset(x, y, "water-" + i);
                }
            }
        }
    }
}

game.hexClicked = function (pos)
{
    if (game.action && game.action._type == "move")
    {
        for (var i = 0; i < game.action.neighbours.length; i++)
        {
            if (game.action.neighbours[i] && game.action.neighbours[i].x == pos.x && game.action.neighbours[i].y == pos.y)
            {
                var originAssets = game.map.hexAssets(game.action.origin.x, game.action.origin.y, "troop");
                for (var i = 0; i < originAssets.length; i++)
                {
                    game.map.removeAsset(game.action.origin.x, game.action.origin.y, originAssets[i])
                    game.map.addAsset(pos.x, pos.y, originAssets[i]);
                }
                var neighbours = game.map.getNeighbours(pos.x, pos.y);
                game.action = { "_type": "move", "origin": pos, "neighbours": neighbours };
            }
        }
        game.map.drawGrid();
        //return true;
    }
    

    if (game.map.hexContains(pos.x, pos.y, "dwarf-spear"))
    {
        var troop = null;
        for (var i = 0; i < game.map._troops.length; i++)
        {
            if (pos.x == game.map._troops[i].x && pos.y == game.map._troops[i].y)
            {
                troop = game.map._troops[i];
                break;
            }
        }

        var neighbours = game.map.getNeighbours(pos.x, pos.y, troop._remainingMoves);

        game.action = { "_type": "move", "origin": pos, "neighbours": neighbours, "troop": troop };
        for (var i = 0; i < neighbours.length; i++)
        {
            if (neighbours[i])
                game.map.drawOverlay("white", neighbours[i].x, neighbours[i].y);
        }
        return true;
    }

    game.action = null;
    return true;
}

game.spriteSheet = function (parent, url, rowWidth, colWidth, loaded)
{
    this._parent = parent;
    this._url = url;
    this._asset = new Object();
    this._colWidth = colWidth;
    this._rowHeight = rowWidth;

    var that = this;

    this._img = new Image();
    this._img.onload = function () { loaded(that); };
    this._img.src = this._url;
}

game.troop = function (x, y, name)
{
    this.x = x;
    this.y = y;

    this._id = utils.createUUID();
    this._assetName = name;
    this._remainingMoves = null;

    game.map.addAsset(x, y, name)
}

game.mapObj = function (elId)
{
    this._debug = false;
    this._element = document.getElementById(elId);
    this._tiles = null;
    this._hexs = null;
    this._troops = [];
    this._origin = { "x": 0, "y": 0 };
    this._season = 0; // 0=spring, 1=summer, 2=autumn, 3=winter;

    var xOffset = 118;
    var yOffset = 69;
    var oddXOffset = 59;
    var oddYOffset = 34;

    var radius = 40; // dont change this - original number used to draw the hex sprit sheet

    var height = Math.sqrt(3) * radius;
    var width = 2 * radius;
    var side = (3 / 2) * radius;

    var that = this;

    this.sign = function (p1, p2, p3)
    {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };

    this.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3)
    {
        var b1, b2, b3;

        b1 = that.sign(pt, v1, v2) < 0.0;
        b2 = that.sign(pt, v2, v3) < 0.0;
        b3 = that.sign(pt, v3, v1) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    };

    this.changeSeason = function ()
    {
        if (that._season < 3)
            that._season++;
        else
            that._season = 0;

        that.drawGrid();
    }
    this.getCentreHex = function ()
    {
        // just pretend that the mouse is dead center
        var posX = ($(that._element).width() / 2);
        var posY = ($(that._element).height() / 2);

        var centre = that.getClickedHex(posX, posY);
 
        return centre;

    }
    this.getClickedHex = function (mouseX, mouseY)
    {
        var column = Math.floor((mouseX) / side);
        var row = Math.floor(
            column % 2 == 0
                ? Math.floor((mouseY) / height)
                : Math.floor(((mouseY + (height * 0.5)) / height)) - 1);


        //Test if on left side of frame            
        if (mouseX > (column * side) && mouseX < (column * side) + width - side)
        {
            //Now test which of the two triangles we are in 
            //Top left triangle points
            var p1 = new Object();
            p1.x = column * side;
            p1.y = (column % 2 == 0 ? row * height : (row * height) + (height / 2));

            var p2 = new Object();
            p2.x = p1.x;
            p2.y = p1.y + (height / 2);

            var p3 = new Object();
            p3.x = p1.x + width - side;
            p3.y = p1.y;

            var mousePoint = new Object();
            mousePoint.x = mouseX;
            mousePoint.y = mouseY;

            if (that.isPointInTriangle(mousePoint, p1, p2, p3))
            {
                column--;
                if (column % 2 != 0)
                    row--;
            }

            //Bottom left triangle points
            var p4 = new Object();
            p4 = p2;

            var p5 = new Object();
            p5.x = p4.x;
            p5.y = p4.y + (height / 2);

            var p6 = new Object();
            p6.x = p5.x + (width - side);
            p6.y = p5.y;

            if (that.isPointInTriangle(mousePoint, p4, p5, p6))
            {
                column--;
                if (column % 2 == 0)
                    row++;
            }
        }

        column = (column + that._origin.x);
        row = (row + that._origin.y);

        return { "x": column, "y": row };
    }

    this.changeOrigin = function (x, y)
    {
        that._origin.x += Number(x);
        that._origin.y += Number(y);

        that._origin.x = (that._origin.x < 0 ? 0 : that._origin.x);
        that._origin.y = (that._origin.y < 0 ? 0 : that._origin.y);
    }

    this.hexContains = function (x, y, name)
    {
        if (that._debug)
            $("#debugDisplay").append("hexContains: x:" + x + ",y:" + y + "</br>");


        for (var i = 0; i < that._hexs[x][y].length; i++)
        {
            if (that._hexs[x][y][i] == name)
                return true;
        }
        return false;
    }

    this.hexAssets = function (x, y, filter)
{
        if (that._debug)
            $("#debugDisplay").append("hexAssets: x:" + x + ",y:" + y + "</br>");

        // just return them all
        if (typeof (filter) == "undefined" || filter == null)
            return that._hexs[x][y];

        // else filter the reply
        var reply = [];
        for (var i = 0; i < that._hexs[x][y].length; i++)
        {
            if(that._tiles._asset[that._hexs[x][y][i]].type == filter)
                reply.push(that._hexs[x][y][i]);
        }

        return reply;
    }

    this.addAsset = function (x, y, name)
    {
        that._hexs[x][y].push(name);
    }

    this.removeAsset = function (x, y, name)
    {
        var tmp = that._hexs[x][y];
        that._hexs[x][y] = [];
        for (var i = 0; i < tmp.length; i++)
        {
            if (tmp[i] != name)
                that._hexs[x][y].push(tmp[i]);
        }
    }

    this.drawAsset = function (x, y)
    {
        var originX = (x - that._origin.x);
        var originY = (y - that._origin.y);

        var ctx = that._element.getContext("2d");

        for (var i = 0; i < that._hexs[x][y].length; i++)
        {
            var name = that._hexs[x][y][i];
            var asset = that._tiles._asset[name];

            var addXOffset = 0;
            var addYOffset = 0;

            if (asset.xOffset)
                addXOffset += asset.xOffset;
            if (asset.yOffset)
                addYOffset += asset.yOffset;

            // offset for season
            var clipX = asset.clipX + (asset.type=="land"?(81 * that._season):0);
            
            if ((x % 2) == 0)
                ctx.drawImage(that._tiles._img, clipX, asset.clipY, asset.clipWidth, asset.clipHeight, (originX * (xOffset / 2)) + addXOffset, (originY * yOffset) + addYOffset, asset.clipWidth, asset.clipHeight);
            else
                ctx.drawImage(that._tiles._img, clipX, asset.clipY, asset.clipWidth, asset.clipHeight, oddXOffset + ((originX - 1) * (xOffset / 2)) + addXOffset, oddYOffset + (originY * yOffset) + addYOffset, asset.clipWidth, asset.clipHeight);
        }
    }

    this.drawText = function (text, x, y)
    {
        var originX = (x - that._origin.x);
        var originY = (y - that._origin.y);

        var ctx = that._element.getContext("2d");
		
		var addXOffset = 35;
		var addYOffset = 40;
	
        if ((x % 2) == 0)
            ctx.fillText(text, (originX * (xOffset / 2)) + addXOffset, (originY * yOffset) + addYOffset);
        else
            ctx.fillText(text, oddXOffset + ((originX - 1) * (xOffset / 2)) + addXOffset, oddYOffset + (originY * yOffset) + addYOffset);
    }

    this.drawOverlay = function (name, x, y)
    {
        x = (x - that._origin.x);
        y = (y - that._origin.y);

        if (that._debug)
            $("#debugDisplay").append("drawOverlay: x:" + x + ",y:" + y + "</br>");

        var ctx = that._element.getContext("2d");
        var asset = that._tiles._asset[name];

        var addXOffset = 0;
        var addYOffset = 0;

        if (asset.xOffset)
            addXOffset = asset.xOffset;
        if (asset.yOffset)
            addYOffset = asset.yOffset;

        if ((x % 2) == 0)
            ctx.drawImage(that._tiles._img, asset.clipX, asset.clipY, asset.clipWidth, asset.clipHeight, (x * (xOffset / 2)) + addXOffset, (y * yOffset) + addYOffset, asset.clipWidth, asset.clipHeight);
        else
            ctx.drawImage(that._tiles._img, asset.clipX, asset.clipY, asset.clipWidth, asset.clipHeight, oddXOffset + ((x - 1) * (xOffset / 2)) + addXOffset, oddYOffset + (y * yOffset) + addYOffset, asset.clipWidth, asset.clipHeight);
    }
    this.getNeighbours = function (x, y, maxMove)
    {
        if (that._debug)
            $("#debugDisplay").append("getNeighbours: x:" + x + ",y:" + y + "</br>");

        // all returned in a clockwise direction, with NULL if the hex doesn't exist
        var reply = [];
        reply.length = 6;
        reply[0] = { "x": x, "y": (y - 1) };
        reply[1] = ((x % 2) == 0 ? { "x": (x + 1), "y": (y - 1) } : { "x": (x + 1), "y": y });
        reply[2] = ((x % 2) == 0 ? { "x": (x + 1), "y": y } : { "x": (x + 1), "y": (y + 1) });
        reply[3] = { "x": x, "y": (y + 1) };
        reply[4] = ((x % 2) == 0 ? { "x": (x - 1), "y": y } : { "x": (x - 1), "y": (y + 1) });
        reply[5] = ((x % 2) == 0 ? { "x": (x - 1), "y": (y - 1) } : { "x": (x - 1), "y": y });
        
        for (var i = 0; i < reply.length; i++)
        {
            if (!reply[i] || !that._hexs[reply[i].x] || !that._hexs[reply[i].x][reply[i].y])
                reply[i] = null;
            else if (maxMove) // we know its real- from the above
            {
                var moveRequired = 0;
                var landTypes = that.hexAssets(reply[i].x, reply[i].y, "land");
                for (var j = 0; j < landTypes.length; j++)
                    moveRequired += that._tiles._asset[landTypes[j]].move;

                if(moveRequired > maxMove)
                    reply[i] = null;
            }
        }
        
        return reply;
    }

    this.drawGrid = function ()
    {
        var sheet = that._tiles;

        var ctx = that._element.getContext("2d");
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        ctx.clearRect(0, 0, that._element.width, that._element.height);

        if (that._origin.x < 0 || that._origin.y < 0)
            return false;

        // draw the base
        for (var x = that._origin.x; x < that._hexs.length; x++)
        {
            for (var y = that._origin.y; y < that._hexs[x].length; y++)
            {
                that.drawAsset(x, y);
                if (that._debug)
                    that.drawText(x + "," + y, x, y);
            }
        }
    }
}

