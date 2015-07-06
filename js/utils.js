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