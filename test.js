import { OneDimensionalMap } from "./index.js";

const myMap = new OneDimensionalMap();

myMap.addRange({
	start: 0,
	end: 255,
	name: "ShouldNotExist",
	date: 1,
})
myMap.addRange({
	start: 0,
	end: 255,
	name: "First",
	date: 1000,
})
myMap.addRange({
	start: 10,
	end: 15,
	name: "Second",
	date: 1001,
})
myMap.addRange({
	start: 7,
	end: 13,
	name: "Third",
	date: 1002,
})
myMap.addRange({
	start: 16,
	end: 20,
	name: "Fourth",
	date: 1001,
})

console.log(myMap.serialized, myMap.count);

if (myMap.count !== 256) console.error('Map count incorrect!');

console.log('Fourth has',myMap.getOrganizationCount('Fourth'));

for (let index = 0; index < myMap.array.length; index++) {
	const element = myMap.array[index];
	if (element.name === 'ShouldNotExist') console.error('ShouldNotExist not properly destroyed!')
}
