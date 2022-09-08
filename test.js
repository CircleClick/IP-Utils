import fs from 'fs';
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

//console.log(myMap.serialized, myMap.count);

if (myMap.count !== 256) console.error('Map count incorrect!', myMap.count);
else console.log('Count of', myMap.count, 'is correct!');

//console.log('Fourth has', myMap.getOrganizationCount('Fourth'));

fs.writeFileSync('./output-1.json', JSON.stringify(myMap.serialized), {encoding: 'utf-8'})

const ids = {};
for (let index = 0; index < 100000; index++) {
	const start = Math.round(Math.random() * 10000);
	const length = Math.round(Math.random() * 1000);
	const id = "Random " + index;
	ids[id] = {
		start: start,
		end: start + length,
		name: id,
		date: Math.round(Math.random() * 10000) + 1,
	};
	myMap.addRange(ids[id])
}
myMap.addRange({ name: "Duplicate Example 1", date: 200, start: 2991, end: 2998 });
myMap.addRange({ name: "Duplicate Example 2", date: 100, start: 2991, end: 2998 });
myMap.addRange({ name: "Duplicate Example 3", date: 221, start: 2992, end: 2997 });
myMap.addRange({ name: "Duplicate Example 4", date: 220, start: 2991, end: 2998 });

myMap.addRange({ start: 9998, end: 10998, name: 'Test 1', date: 8913 });
myMap.addRange({ start: 9998, end: 10998, name: 'Test 2', date: 9935 });


let lastEnd = 0;
for (let index = 0; index < myMap.array.length; index++) {
	const element = myMap.array[index];

	if (element.name === 'ShouldNotExist') console.error('ShouldNotExist not properly destroyed!');

	if (element.start < lastEnd) {
		const serialized = element.serialized;
		serialized.date = new Date(serialized.date).getTime()
		console.error('Array not sorted, ' + lastEnd + ', ' + element.start);
		console.log('old: ' + JSON.stringify(myMap.array[index - 1].serialized));
		console.log('new: ' + JSON.stringify(element.serialized));
		console.log(ids[element.name]);
		console.log(ids[myMap.array[index - 1].name])
	}

	lastEnd = element.end;
}


fs.writeFileSync('./output-2.json', JSON.stringify(myMap.serialized), {encoding: 'utf-8'});
console.log('final count of', myMap.count);