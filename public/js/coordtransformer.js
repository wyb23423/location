/**
 * Created by CastingJ on 17/5/12.
 */

function CoordTransformer()
{
    var _locOrigion;
    var _locRange;

    var _mapOrigion;
    var _mapAxisX;
    var _mapAxisY;
    var _mapRange;

    this.getVectorLen = function(vector)
    {
        return Math.sqrt(vector.x*vector.x + vector.y*vector.y);
    }

    this.init = function(locOrigion,locRange,mapParas)
    {
        if(mapParas.length != 4)
            return false;

        _locOrigion = locOrigion;
        _locRange = locRange;

        _mapOrigion = mapParas[0];
        _mapAxisX = {'x':mapParas[1].x - mapParas[0].x ,'y':mapParas[1].y - mapParas[0].y};
        _mapAxisY = {'x':mapParas[3].x - mapParas[0].x ,'y':mapParas[3].y - mapParas[0].y};
        _mapRange = {'x':this.getVectorLen(_mapAxisX),'y':this.getVectorLen(_mapAxisY)};

        //向量单位化
        _mapAxisX.x /= _mapRange.x; _mapAxisX.y /= _mapRange.x;
        _mapAxisY.x /= _mapRange.y; _mapAxisY.y /= _mapRange.y;

    };

    this.transform = function(loc)
    {
        var offstRatio = {'x':(loc.x-_locOrigion.x)/_locRange.x,'y':(loc.y-_locOrigion.y)/_locRange.y};

        var mapOffset = {'x':offstRatio.x*_mapRange.x,'y':offstRatio.y*_mapRange.y};
        var mapCoord = {'x':_mapOrigion.x+_mapAxisX.x*mapOffset.x+_mapAxisY.x*mapOffset.y,'y':_mapOrigion.y+_mapAxisX.y*mapOffset.x+_mapAxisY.y*mapOffset.y};

        return mapCoord;
    };

}