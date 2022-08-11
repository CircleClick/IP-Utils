let currentId = 0;
function getUid() {
	return currentId++;
}

export class OneDItem {
	constructor(props) {
		for (let index = 0; index < this.fields.length; index++) {
			const key = this.fields[index];
			if (props.hasOwnProperty(key)) {
				this[key] = props[key];
			} else {
				throw new Error(`props.${key} cannot be undefined`)
			}
		}
		this.uuid = getUid();
	}

	static fields = ['name', 'date', 'start', 'end'];

	get serialized() {
		return {
			name: this.name,
			date: this.date,
			start: this.start,
			end: this.end,
			uuid: this.uuid,
			count: this.count,
		}
	}
	static deserialize(input) {
		let object;

		if (typeof input === 'string') object = JSON.parse(input);
		else if (typeof input === 'object') object = { ...input };

		return new OneDItem(object);
	}

	get count() {
		return this.end - this.start;
	}
}

export class OneDimensionalMap {
	constructor() {
		this.array = new Array();
	}

	findCoord(coord) {
		let output = [];
		for (let index = 0; index < this.array.length; index++) {
			const element = this.array[index];
			if (element.start <= coord && element.end >= coord) {
				output.push(output);
			}
		}
		return (output.length === 0) ? false : output;
	}

	findRange(start, end) {
		const output = [];
		for (let index = 0; index < this.array.length; index++) {
			const element = this.array[index];
			if (element.start <= start && element.end >= end) {
				//completely encompassing
				output.push({ ...element, overlapType: 'encompassing' });
			} else if (element.start <= start && element.end >= start) {
				//overlaps start
				output.push({ ...element, overlapType: 'start' });
			} else if (element.start <= end && element.end >= end) {
				//overlaps end
				output.push({ ...element, overlapType: 'end' });
			} else if (element.start >= start && element.end <= end) {
				// completely encased
				output.push({ ...element, overlapType: 'encased' });
			}
		}
		return (output.length === 0) ? false : output;
	}

	addRange(args) {
		const { name, date, start, end } = args;

		const overlaps = this.findRange(start, end);
		if (!overlaps) {
			this.array.push(new OneDItem(args));
		} else {
			console.error('found range overlap');
			console.log(args, overlaps);
		}
	}
	removeRange(id) {
		for (let index = this.array.length - 1; index >= 0; index--) {
			if (this.array[index].uuid === id) {
				this.array.splice(index, 1);
			}
		}
	}

	get count() {
		let count = 0;
		for (let index = 0; index < this.array.length; index++) {
			count += this.array[index].count;
		}
		return count;
	}

	get serialized() {
		const output = [];
		for (let index = 0; index < this.array.length; index++) {
			output.push(this.array[index].serialized);
		}
		return output;
	}

	static deserialize(input) {
		let object;

		if (typeof input === 'string') object = JSON.parse(input);
		else if (typeof input === 'object') object = { ...input };

		const myMap = new OneDimensionalMap();

		for (let index = 0; index < object.length; index++) {
			myMap.array.push(OneDItem.deserialize(object[index]))
		}

		return myMap;
	}
}
