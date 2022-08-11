import { OneDimensionalMap } from "./index.js";

const myMap = new OneDimensionalMap();

myMap.addRange({
	start: 0,
	end: 100,
	name: "First",
	date: 0,
})
myMap.addRange({
	start: 10,
	end: 15,
	name: "Second",
	date: 0,
})
console.log(myMap.serialized);