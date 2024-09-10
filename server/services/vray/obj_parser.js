var exports = module.exports = {};

var readLine = require('readline');
var path = require('path');

var vray = require(path.join(process.env.VRAY_SDK, 'node', 'vray'));

/**
 * Represents an object.
 *
 * @constructor
 */
var Obj = function () {
  this.vertices = [];
  this.textureVertices = [];
  this.vertexNormals = [];
  this.faces = [];
  this.faceTextures = [];
  this.faceNormals = [];
};

/**
 * Returns the maximum dimension along any axis
 */
exports.getMaxExtent = function getMaxExtent(vertices) {
  vmin = [0.0, 0.0, 0.0];
  vmax = [0.0, 0.0, 0.0];
  for (var j = 0; j < vertices.length; j += 3) {
    for (var i = 0; i < 3; i++) {
      var v = vertices[j + i];
      if (v > vmax[i])
        vmax[i] = v;
      else if (v < vmin[i])
        vmin[i] = v;
    }
  }

  return Math.max(vmax[0] - vmin[0], vmax[1] - vmin[1], vmax[2] - vmin[2]);
}

/**
 * Triangulates convex polygons.
 */
exports.ConvexTriangulator = {
  // Triangulates a polygon.
  //
  // @param obj - Structure representing the object.
  // @param vertexIndices - Tuples containing vertex, texture and normal
  // indices.
  triangulate: function (obj, vertexIndices) {
    triangle = [vertexIndices[0], vertexIndices[1], null]

    vertexIndices.slice(2).forEach(function (vertex) {
      triangle[2] = vertex;

      triangle.forEach(function (vertex) {
        obj.faces.push(vertex[0]);
        obj.faceTextures.push(vertex[1]);
        obj.faceNormals.push(vertex[2]);
      });

      triangle[1] = triangle[2];
    });
  }
};

/**
 * Obj model parser. Simple unoptimized example implementation.
 */
var ObjParser = {};

/**
 * Parses a v/vt/vn tuple.
 *
 * @param arg - String representation of the tuple.
 */
ObjParser.parseVertexIndices = function (arg) {
  var indices = arg.split(/[\/]+/);

  var v = parseInt(indices[0]) - 1;

  var vt = -1;
  if (indices.length > 1 && indices[1].length > 0) {
    vt = parseInt(indices[1]) - 1;
  }

  var vn = -1;
  if (indices.length > 2) {
    vn = parseInt(indices[2]) - 1;
  }

  return [v, vt, vn];
};

/**
 * Parses a geometric vertex.
 *
 * @param obj - Structure representing the object.
 * @param args - List of string representations of vertex components.
 */
ObjParser.parseGeometricVertex = function (obj, args) {
  obj.vertices.push(vray.Vector(
    parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])));
};

/**
 * Parses a texture vertex.
 *
 * @param obj - Structure representing the object.
 * @param args - List of string representations of vertex components.
 */
ObjParser.parseTextureVertex = function (obj, args) {
  var x = args[0] || 0;
  var y = args[1] || 0;
  var z = args[2] || 0;
  obj.textureVertices.push(vray.Vector(
    parseFloat(x), parseFloat(y), parseFloat(z)));
};

/**
 * Parses a normal vertex.
 *
 * @param obj - Structure representing the object.
 * @param args - List of string representations of vertex components.
 */
ObjParser.parseVertexNormal = function (obj, args) {
  obj.vertexNormals.push(vray.Vector(
    parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])));
};

/**
 * Parses and triangulates a face.
 *
 * @param obj - Structure representing the object.
 * @param args - List of string representations of tuples of the form v/vt/vn.
 */
ObjParser.parseFace = function (obj, args) {
  var self = this;

  var vertexIndices =
    args.map(function (arg) { return self.parseVertexIndices(arg); });
  this.triangulator.triangulate(obj, vertexIndices);
};

/**
 * Parses a line from obj file.
 *
 * @param obj - Structure representing the object.
 * @param line - The line to be parsed.
 */
ObjParser.parseLine = function (obj, line) {
  var tokens = line.split(/[ ]+/);
  if (tokens[tokens.length - 1] == '')
    tokens = tokens.slice(0, -1);
  var command = tokens[0];
  var args = tokens.slice(1);

  if (command === 'v') {
    this.parseGeometricVertex(obj, args);
  } else if (command === 'vt') {
    this.parseTextureVertex(obj, args);
  } else if (command === 'vn') {
    this.parseVertexNormal(obj, args);
  } else if (command == 'f') {
    this.parseFace(obj, args);
  }
};

/**
 * Parses object from file.
 *
 * @param fileName - Path to the obj file.
 * @param next - Callback recieving the parsed object.
 */
ObjParser.parseFile = function (fileName, next) {
  var self = this;

  var obj = new Obj();

  var lineReader = readLine.createInterface(
    { input: require('fs').createReadStream(fileName) });

  return new Promise((resolve, reject) => {
    lineReader.on('close', function () {
      // Convert regular arrays to V-Ray typed lists (which are js typed arrays).
      obj.vertices = new vray.VectorList(obj.vertices);
      obj.textureVertices = new vray.VectorList(obj.textureVertices);
      obj.vertexNormals = new vray.VectorList(obj.vertexNormals);
      obj.faces = new vray.IntList(obj.faces);
      obj.faceTextures = new vray.IntList(obj.faceTextures);
      obj.faceNormals = new vray.IntList(obj.faceNormals);
      if (next) next(obj);
      resolve(obj);
    }).on('line', function (line) {
      self.parseLine(obj, line);
    });
  });

};

/**
 * Creates a new object parser.
 *
 * @param triangulator - Strategy used to triangulate polygons.
 */
exports.create = function (triangulator) {
  return Object.create(ObjParser, {
    triangulator: { writable: true, configurable: true, value: triangulator }
  });
};
