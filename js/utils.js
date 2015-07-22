var Namespace = function (namespace)
{
    var obj = window;
    var names = namespace.split(".");
    var name = null;
    for (var pos in names)
    {
        name = names[pos];
        if (typeof (obj[name]) != 'undefined')
            obj = obj[name]
        else
        {
            obj[name] = new Object();
            obj = obj[name];
        }
    }
}

Namespace("utils");

utils.roundTo = function (number, dps)
{
    var multi = "1";
    for (var i = 0; i < dps; i++)
    {
        multi += "0";
    }
    multi = parseInt(multi);
    
    return Math.round(number * multi) / multi;

    
}

utils.createUUID = function ()
{
    function s4()
    {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

utils.alert = function (text, options)
{
    options = $.extend({ "width" : 200, "height": 100 }, options);
    
    var id = utils.createUUID();
    var html = "<div title='Alert' id='" + id + "'>"
             + "<div >" + text + "</div>"
             + "</div>";

    $(html).dialog({
        width: options.width,
        height: options.height,
        modal: true,
        close: function() { $(this).empty().remove(); },
        buttons: {
            "OK": function () { $(this).dialog("close"); }
        }
    });
}
