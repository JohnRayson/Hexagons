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