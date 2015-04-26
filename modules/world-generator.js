"use strict";
var randomizer = require("seed-random");



var chunkSize=1000;
var seed = "3g247er45t";

var treeChance = 1/200;
var treeMinRadius = 20;
var treeMaxRadius = 30;




var generateChunk = function(x,y) {
	var rnd = randomizer(seed +"-"+ x +"-"+ y);
	var left = x*chunkSize;
	var top = y*chunkSize;

	return {
		trees: getTreesInChunk(rnd, left, top)
	};
};

function getTreesInChunk(rnd, left, top) {
	var chunkTrees = [];
	for(var x=0; x<chunkSize; x+=10) {
		for(var y=0; y<chunkSize; y+=10) {
			var v = rnd();
			if(v<treeChance) {
				chunkTrees.push({
					x:left+x,
					y:top+y,
					r:treeMinRadius + v/treeChance * (treeMaxRadius-treeMinRadius),
					color: "rgba(52, 95, 35, 1)"
				});
			}
		}
	}
	return chunkTrees;
}





module.exports.generateChunk = generateChunk;