let currentId = 0;
function getUid() {
	return currentId++;
}

export class OneDItem {
	constructor(props) {
		for (let index = 0; index < OneDItem.fields.length; index++) {
			const key = OneDItem.fields[index];
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
		this.removeRange(start, end);

		const overlaps = this.findRange(start, end);
		if (!overlaps) {
			this.array.push(new OneDItem(args));
		} else {
			console.error('found range overlap');
			console.log(args, overlaps);
		}
	}

	removeRange(start, end) {
		for (let index = this.array.length - 1; index >= 0; index--) {
			const item = this.array[index];
			if (item.start >= start && item.end <= end) {
				this.array.splice(index, 1);
			} else if (item.end > end && item.start < start) {
				const originalEnd = item.end;
				item.end = start - 1;
				this.addRange({ ...item, start: end + 1, end: originalEnd });
			} else if (item.start <= start && item.end >= start) {
				item.end = start - 1;
			} else if (item.start <= end && item.end >= end) {
				item.end = end + 1;
			}
		}
	}
	removeRangeByID(id) {
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
		output.sort((a, b) => {
			return a.start - b.start;
		})
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
