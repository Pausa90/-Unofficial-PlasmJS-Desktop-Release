/** Setup **/


/* Creo funzionalità per implementare hideAll */
var drawable_objects = [];

function draw(obj){
	drawable_objects.push(obj);
	DRAW(obj);
}


function hide(obj){
	drawable_objects = drawable_objects.filter( function(item){
		return item !== obj;
	});
	HIDE(obj);
}

function hideAll(){
	while(drawable_objects.length>0)
		HIDE(drawable_objects.pop());	
}

//Richiama l'omonima funzione senza clone
function TNC(dims) {
    return function (values) {
      return function (object) {
       return object.clone().translate(dims, values);
      };
    };
  }

//Richiama l'omonima funzione senza clone
function RNC(dims) {
    return function (values) {
      return function (object) {
       return object.clone().rotate(dims, values);
      };
    };
  }

//Richiama l'omonima funzione senza clone
function SNC(dims) {
    return function (values) {
      return function (object) {
       return object.clone().scale(dims, values);
      };
    };
  }


/* Fine funzionalità hideAll */

//Funzione che mi permette di inserire i colori in rgb con range [0,255]
function rgb(color){
	return [color[0]/255, color[1]/255, color[2]/255];
}

//Funzione che mi permette di inserire i colori in rgba con range [0,255]
function rgba(color){
	return [color[0]/255, color[1]/255, color[2]/255, color[3]/100];
}

function extrude(obj,z){
	return EXTRUDE([z])(obj);
}

//Funzioni utili per la misurazione
function grid2D(dimens,axis1,axis2){

	alfa = 30

	function semi_grid(ax1,ax2){
		var grid_object = function(point){
				if (point===-1)
					return ;

				start = [0,0,0];
				end = [0,0,0];
				start[ax2] = point;
				end[ax2] = point;
				end[ax1] = dimens;
				

				return STRUCT([POLYLINE([start,end]), grid_object(point-1)]);
			};
		return COLOR(rgba([200,200,200,alfa]))(grid_object(dimens));
	};

	return STRUCT([semi_grid(axis1,axis2),semi_grid(axis2,axis1)]);

}

function grid3D(dimens){

	var grid_xy = grid2D(dimens,0,1);
	var grid_xz = grid2D(dimens,0,2);

	grid_xy = STRUCT(REPLICA(dimens+1)([grid_xy,T([2])([1])]));
	grid_xz = STRUCT(REPLICA(dimens+1)([grid_xz,T([1])([1])]));

	return STRUCT([grid_xy,grid_xz]);
}

function grid3DLight(dimens){
	return STRUCT([grid2D(dimens,0,1),grid2D(dimens,0,2),grid2D(dimens,1,2)]);
}

//Funzione che disegna una griglia 2D centimetrata
function grid2Ddetailed(dimens,axis1,axis2){
	var semi_grid = function (ax1,ax2){
		var grid_object = function(point){
			start = [0,0,0];
			end = [0,0,0];
			start[ax2] = point;
			end[ax2] = point;
			end[ax1] = dimens;
			if (point < 0.01){
				return COLOR([1,0,0,0.5])(POLYLINE([start,end]));
			}
			if (isInt(point)){
				return STRUCT([COLOR([1,0,0,0.5])(POLYLINE([start,end])), grid_object(point-0.1)]);
			}
			return STRUCT([COLOR(rgb([200,200,200,0.5]))(POLYLINE([start,end])), grid_object(point-0.1)]);
		}			
		return grid_object(dimens);
	}
	return STRUCT([semi_grid(axis1,axis2),semi_grid(axis2,axis1)]);
}

function isInt(val){
	if (val - parseInt(val) < 0.01){
		return true;
	}
	return false;
}

//Funzione che disegna una griglia 3D piu leggera (3 griglie 2D) centimetrata
function grid3DLightDetailed(dimens){
	return STRUCT([grid2Ddetailed(dimens,0,1),grid2Ddetailed(dimens,0,2),grid2Ddetailed(dimens,1,2)]);
}

//Fine misurazione


/* Utility per convertire da pyplasm a plasm.js */
function TPY(dimens,values,object){
	new_dim = dimens.map(function(item){
		return item-1;	
	}); 
	return T(new_dim)(values)(object);
}

function RPY(dimens,values,object){
	new_dim = dimens.map(function(item){
		return item-1;	
	}); 
	return R(new_dim)(values)(object);
}

function SPY(dimens,values,object){
	new_dim = dimens.map(function(item){
		return item-1;	
	}); 
	return S(new_dim)(values)(object);
}
/* Fine utility */







/* Figure pronte (parametriche) */

function invertSign(point){
	return point.map(function(item){ return -item });
}

function wallWithHole(wallDepht,pmin,pmax,l_wall,h_wall){
	var x1 = [ pmin[0], -(pmax[0]-pmin[0]) ];
	if (l_wall-pmax[0]>0)
		x1[2] = l_wall-pmax[0];

	var z2 = [ pmin[1], -(pmax[1]-pmin[1]) ];
	if (h_wall-pmax[1]>0)
		z2[2] = h_wall-pmax[1];

	var sg1 = SIMPLEX_GRID([x1,[wallDepht],[h_wall]]);
	var sg2 = SIMPLEX_GRID([invertSign(x1),[wallDepht],z2]);

	return STRUCT([sg1,sg2]);
}


function windowGen(height,width,depth){
	var glass_depth = 0.05;
	var glass = COLOR(rgba([0,0,0,60]))(SIMPLEX_GRID([[0.8],[glass_depth],[depth-0.15]]));
	var chassis_a = SIMPLEX_GRID([[depth],[depth],[height]]);
	var chassis_b = SIMPLEX_GRID([[width-depth],[depth],[depth]]);
	var chassis = COLOR(rgb([192, 192, 192]))(STRUCT([chassis_a,chassis_b,T([2])([height-depth])(chassis_b),T([0])([width-depth])(chassis_a)]));
	
	return STRUCT([chassis,T([0,1,2])([depth,glass_depth/2,depth])(glass)]);
}

function stairs(x_step,z_step,l_stairs,h_stairs){
	nstep = h_stairs/z_step
	y_step = l_stairs/nstep

	step1 = CUBOID([x_step,y_step,z_step]);
	triangle = SIMPLICIAL_COMPLEX([ [x_step,0,0],[0,0,0],[0,0,-z_step],[x_step,0,-z_step],[0,y_step,0],[x_step,y_step,0] ])([ [0,1,2],[0,2,3],[1,2,4],[0,3,5],[1,5,4],[0,1,5],[3,4,5],[2,4,3] ])
	stepn = STRUCT([step1,triangle])

	stepns =  STRUCT(REPLICA(nstep-1)([stepn,T([1,2])([l_stairs/nstep,z_step])]));
	
	return STRUCT([step1,T([1,2])([l_stairs/nstep,z_step])(stepns)])
}

function arc_1D(alpha,r){
	var domain = function(fragments){
	   return DOMAIN([[0,alpha*PI/180]])([fragments]);
	}
	var circle = function (r) {
	  return function (v) {
	    return [r*COS(v[0]), r*SIN(v[0])];
	  };
	};
	var mapping = circle(r);
	var dom = domain(36);
	return model = MAP(mapping)(dom);
}

function arc_2D(alpha,r,R){
	var domain = DOMAIN([[0,alpha*PI/180],[r,R]])([36,1]);
	var mapping = function(v){
		var a = v[0];
		var r = v[1];
		return [r*COS(a), r*SIN(a)];
	}
	var model = MAP(mapping)(domain);
	return model;
}

function circonference(r) {
	return function (v) {
		return [r*COS(v[0]), r*SIN(v[0])];
	}
}

function circonference(r){
	var domain = DOMAIN([[0,2*PI]])([36]);
	var mapping = circonference(r);

	return (MAP(mapping)(domain));
}

function emptyCilynder(r,h){
	return extrude(circonference(r),h);
}


function torus(R,r){

	var domain = DOMAIN([[0,2*PI],[0,2*PI]])([36,72]);

	var mapping = function () {
	  return function (v) {
	    var a = v[0];
	    var b = v[1];

	    var u = (r * COS(a) + R) * COS(b);
	    var v = (r * COS(a) + R) * SIN(b);
	    var w = (r * SIN(a));

	    return [u,v,w];
	  }
	}

	return MAP(mapping(R,r))(domain);
}

var scalePoints = function(points,values) {
	return points.map(function(item){
		return item.map(function(elem){
			return elem*values;
		});
	});
}

var scalePointsX = function(points,values) {
	return points.map(function(item){
		return [item[0]*values,item[1],item[2]];
	});
}

var scalePointsY = function(points,values) {
	return points.map(function(item){
		return [item[0],item[1]*values,item[2]];
	});
}

var scalePointsZ = function(points,values) {
	return points.map(function(item){
		return [item[0],item[1],item[2]*values];
	});
}

function bezier_circle_map(r,selector){

	if (selector === undefined)
		selector = S0

	var base_points = [[-1,0,0],[-1,1.6,0],[1.6,1.6,0],[1.6,0,0],[1.6,-1.6,0],[-1,-1.6,0],[-1,0,0]];

	var circle_points = scalePoints(base_points,r);

	return BEZIER(selector)(circle_points)
}

function bezier_circle_mapZY(r,selector){

	if (selector === undefined)
		selector = S0

	var base_points = [[0,-1,0],[0,-1,1.6],[0,1.6,1.6],[0,1.6,0],[0,1.6,-1.6],[0,-1,-1.6],[0,-1,0]];

	var circle_points = scalePoints(base_points,r);

	return BEZIER(selector)(circle_points)
}

function bezier_circleZY(r){
	return MAP(bezier_circle_mapZY(r))(INTERVALS(1)(64));
}

function bezier_circle_not_centered_mapZY(r,x_value,y_value,z_value,selector){

	if (selector === undefined)
		selector = S0

	var base_points = [[0,-1,0],[0,-1,1.6],[0,1.6,1.6],[0,1.6,0],[0,1.6,-1.6],[0,-1,-1.6],[0,-1,0]];

	var circle_points = scalePoints(base_points,r);

	if (x_value !== 0)
		circle_points = traslaPointsX(circle_points,x_value)
	if (y_value !== 0)
		circle_points = traslaPointsY(circle_points,y_value)
	if (z_value !== 0)
		circle_points = traslaPointsZ(circle_points,z_value)

	return BEZIER(selector)(circle_points)
}

function bezier_circle(r){
	return MAP(bezier_circle_map(r))(INTERVALS(1)(64));
}

function bezier_circle_not_centered_map(r,x_value,y_value,z_value,selector){

	if (selector === undefined)
		selector = S0

	var base_points = [[-1,0,0],[-1,1.6,0],[1.6,1.6,0],[1.6,0,0],[1.6,-1.6,0],[-1,-1.6,0],[-1,0,0]];

	var circle_points = scalePoints(base_points,r);

	if (x_value !== 0)
		circle_points = traslaPointsX(circle_points,x_value)
	if (y_value !== 0)
		circle_points = traslaPointsY(circle_points,y_value)
	if (z_value !== 0)
		circle_points = traslaPointsZ(circle_points,z_value)

	return BEZIER(selector)(circle_points)
}

function bezier_circle_not_centered(r,x_value,y_value,z_value){
	return MAP(bezier_circle_not_centered_map(r,x_value,y_value,z_value))(INTERVALS(1)(64));
}

function bezier_semicircle_map(r,selector){

	if (selector === undefined)
		selector = S0

	var base_points = [[0, 0, 0], [0, 1.3, 0], [2, 1.3, 0], [2, 0, 0]];
	var circle_points_non_centered = scalePoints(base_points,r);
	var circle_points = traslaPointsX(circle_points_non_centered,-r);

	return BEZIER(selector)(circle_points)
}

function bezier_semicircle(r){
	return MAP(bezier_semicircle_map(r))(INTERVALS(1)(64));
}

var minValueCoordinate = function(points,axis){
	minVal = points[0][axis]
	for (i=1; i<points.length; i++)
		if (points[i][axis]<minVal)
			minVal = points[i][axis]
	return minVal
}

var maxValueCoordinate = function(points,axis){
	maxVal = points[0][axis]
	for (i=1; i<points.length; i++)
		if (points[i][axis]>maxVal)
			maxVal = points[i][axis]
	return maxVal
}

function traslateToOrigin(points){
	var minX = minValueCoordinate(points,0);
	var minY = minValueCoordinate(points,1);
	var minZ = minValueCoordinate(points,2);
	if (minX !== 0)
		points = traslaPointsX(points,-minX);
	if (minY !== 0)
		points = traslaPointsY(points,-minY);
	if (minZ !== 0)
		points = traslaPointsZ(points,-minZ);
	return points
}

function calcolateInscribedCircleRay(points,axis){
	return maxValueCoordinate(points,axis)-minValueCoordinate(points,axis)
}

function rotateProfile(points){
	points = traslateToOrigin(points);
	var area_domain = PROD1x1([INTERVALS(1)(128),INTERVALS(1)(128)]);
	var curve_map = BEZIER(S0)(points);
	return MAP(PROFILEPROD_SURFACE([curve_map,bezier_circle_map(1,S1)]))(area_domain);
}

function rotateProfileWithR(points,r){
	points = traslateToOrigin(points);
	var area_domain = PROD1x1([INTERVALS(1)(128),INTERVALS(1)(128)]);
	var curve_map = BEZIER(S0)(points);
	return MAP(PROFILEPROD_SURFACE([curve_map,bezier_circle_map(r,S1)]))(area_domain);
}

function rotateProfileNoTraslate(points){
	var area_domain = PROD1x1([INTERVALS(1)(128),INTERVALS(1)(128)]);
	var curve_map = BEZIER(S0)(points);
	return MAP(PROFILEPROD_SURFACE([curve_map,bezier_circle_map(1,S1)]))(area_domain);
}

function rotateProfileNoTraslateWithR(points,r){
	var area_domain = PROD1x1([INTERVALS(1)(128),INTERVALS(1)(128)]);
	var curve_map = BEZIER(S0)(points);
	return MAP(PROFILEPROD_SURFACE([curve_map,bezier_circle_map(r,S1)]))(area_domain);
}

function halfRotateProfile(points){
	points = traslateToOrigin(points);
	var area_domain = PROD1x1([INTERVALS(1)(128),INTERVALS(1)(128)]);
	var curve_map = BEZIER(S0)(points);
	return MAP(PROFILEPROD_SURFACE([curve_map,bezier_semicircle_map(1,S1)]))(area_domain);
}

function unifyBezierCurves(map_curve_1,map_curve_2){
	return MAP(BEZIER(S1)([map_curve_1,map_curve_2]))(PROD1x1([INTERVALS(1)(32),INTERVALS(1)(32)]));
}

function unifyAllBezierCurvers(curves){

	output = STRUCT([unifyBezierCurves(curves[0],curves[1])])
	
	for (i=1; i<curves.length; i++)
		output = STRUCT([output,unifyBezierCurves(curves[i],curves[(i+1)%curves.length]) ])

	return output
}

function circle(r){
	return DISK(r)([64,2])
}


function cilynder(r,h){
	return EXTRUDE([h])(DISK(r)([64, 2]))
}


/* Fine figure parametriche */

function traslaPointsZ(points,value){
	return points.map(function(item){
		return [item[0],item[1],item[2]+value];
	});
}

function traslaPointsY(points,value){
	return points.map(function(item){
		return [item[0],item[1]+value,item[2]];
	});
}

function traslaPointsX(points,value){
	return points.map(function(item){
		return [item[0]+value,item[1],item[2]];
	});
}

function addYValue(points, y){
	return points.map(function(item){
		return [item[0],y,item[1]];
	});
}

function flipX(points){
	var simmetry_x = maxValueCoordinate(points,0)
	return points.map(function(item){
		var newItem0 = (simmetry_x - item[0]) + simmetry_x
		return [newItem0, item[1], item[2]];
	});
}


function sphere(r){
	var domain = DOMAIN([[0,PI],[0,2*PI]])([50,70]);
	var mapping = function (v) {
	  var a = v[0];
	  var b = v[1];

	  var u = r * SIN(a) * COS(b);
	  var v = r * SIN(a) * SIN(b);
	  var w = r * COS(a);

	  return [u,v,w];
	};

	return MAP(mapping)(domain);
}


//Funzione che unisce più funzioni
/** Esempio d'uso

	var f1 = CUBIC_HERMITE(S0)([[3,0,0],[3,0,6],[ 0,-0.7,0.5],[ 0,0.7,0.5]]);
	var f2 = CUBIC_HERMITE(S0)([[3,0,6],[3,6,6],[ 0,0.7,0.5],[ 0,0.7,-0.5]]);
	f12 = curves_union([ f1, f2 ])([ [ 0, 1 ], [ 0, 1 ] ]);
	domain1 = DOMAIN([[0,1]])([32]);
	var curve = MAP(f12)(domain1);
	DRAW(curve)
*/

function curves_union(curves){
	function isin(u,a,b){
		return (u >= a && u < b);
	}
	function aux0(domains){
		function aux1(u){
			n = curves.length;
			i = 0;
			j = 0;
			k = 0;
			
			while (i < n){
				k += domains[i][1] - domains[i][0];
				i += 1;
			}
			
			i = 0;
			while (i < n && !(isin(u[0] * k, j, j + domains[i][1] - domains[i][0]))){
				j += domains[i][1] - domains[i][0];
				i += 1;
			}

			if ( i < n ) return curves[i]([ domains[i][0] + u[0] * k - j ]);
			return curves[n-1]([ domains[n-1][1] ]);
		}
		return aux1;
	}
	return aux0;
}




function drawBezier(points){
	draw(MAP(BEZIER(S0)(points))(INTERVALS(1)(32)))
}

function arrayToString(array){
	return JSON.stringify(array);
}

function adjustCurveFromCanvas(curve_Points, startPoint, endPoint){

	var newCurve = traslateToOrigin(curve_Points);

	var relationship_x = 0;
	var relationship_y = 0;
	var relationship_z = 0;

	if (curve_Points[0][0]-curve_Points[curve_Points.length-1][0] !== 0)
		relationship_x = Math.abs(endPoint[0]-startPoint[0]) / Math.abs(curve_Points[0][0]-curve_Points[curve_Points.length-1][0]);
	if (curve_Points[0][1]-curve_Points[curve_Points.length-1][1] !== 0)
		relationship_y = Math.abs(endPoint[1]-startPoint[1]) / Math.abs(curve_Points[0][1]-curve_Points[curve_Points.length-1][1]);
	if (curve_Points[0][2]-curve_Points[curve_Points.length-1][2] !== 0)
		relationship_z = Math.abs(endPoint[2]-startPoint[2]) / Math.abs(curve_Points[0][2]-curve_Points[curve_Points.length-1][2]);

	newCurve = scalePointsX(scalePointsY(scalePointsZ(newCurve,relationship_z),relationship_y),relationship_x);
	newCurve = traslaPointsX(traslaPointsY(traslaPointsZ(newCurve,startPoint[2]),startPoint[1]),startPoint[0]);
	return newCurve;
}

/** Fine setup */ 
