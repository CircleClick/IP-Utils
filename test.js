import { OneDimensionalMap } from "./index.js";

const myMap = new OneDimensionalMap();

myMap.addRange({
	start: 0,
	end: 255,
	name: "First",
	date: 0,
})
myMap.addRange({
	start: 10,
	end: 15,
	name: "Second",
	date: 1,
})
myMap.addRange({
	start: 7,
	end: 13,
	name: "Third",
	date: 2,
})
myMap.addRange({
	start: 16,
	end: 20,
	name: "Fourth",
	date: 1,
})

console.log(myMap.serialized, myMap.count);

if (myMap.count !== 256) console.error('Map count incorrect!');

