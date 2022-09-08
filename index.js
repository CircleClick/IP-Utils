let currentId = 0;
function getUid() {
	return currentId++;
}

export class OneDItem {
	constructor(props) {
		for (let index = 0; index < OneDItem.fields.length; index++) {
			const key = OneDItem.fields[index];
			if (props.hasOwnProperty(key)) {
				if (key === 'date') this[key] = new Date(props[key]);
				else this[key] = props[key];
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
		return this.end - this.start + 1;
	}
}

export class OneDimensionalMap {
	constructor() {
		this.array = new Array();
	}

	recursiveFindIndex(x, start = 0, end = this.array.length - 1) {
		if (start > end) return false;
		let middleIndex = Math.floor((start + end) / 2);
		if (this.array[middleIndex].start <= x && this.array[middleIndex].end >= x) return middleIndex;
		if (this.array[middleIndex].start > x) return this.recursiveFindIndex(x, start, middleIndex - 1);
		else return this.recursiveFindIndex(x, middleIndex + 1, end);
	}

	findStartIndex(target) {
		if (this.array.length < 10) {
			return 0;
		}
		return Math.max(0, this.recursiveFindIndex(target));
	}

	smartInsert(new_item) {
		if (this.array.length === 0) {
			this.array.push(new_item);
			return;
		}

		if (this.findRange(new_item.start, new_item.end)) {
			console.log('Uh oh, overlaps found');
			console.log(this.findRange(new_item.start, new_item.end));
			console.log(new_item);
		}

		const startIndex = this.findStartIndex(new_item.start);

		for (let index = startIndex; index < this.array.length; index++) {
			const element = this.array[index];
			if (element.start > new_item.start) {
				this.array.splice(index, 0, new_item);
				return;
			}
		}

		this.array.push(new_item);
	}

	findRange(start, end) {
		const output = [];

		const startIndex = this.findStartIndex(start);

		for (let index = startIndex; index < this.array.length; index++) {
			const element = this.array[index];
			if (element.start <= start && element.end >= end) {
				//completely encompassing
				output.push(element);
			} else if (element.start <= start && element.end >= start) {
				//overlaps start
				output.push(element);
			} else if (element.start <= end && element.end >= end) {
				//overlaps end
				output.push(element);
			} else if (element.start >= start && element.end <= end) {
				// completely encased
				output.push(element);
			} else if (element.start > end) {
				break;
			}
		}
		return (output.length === 0) ? false : output;
	}

	find(number) {
		const startIndex = this.findStartIndex(number);
		for (let index = startIndex; index < this.array.length; index++) {
			const element = this.array[index];
			if (element.start <= start && element.end >= end) {
				return element;
			} else if (element.start > number) {
				return false;
			}
		}
		return false;
	}

	addRange(args) {
		const { date, start, end } = args;
		if (args.start > args.end) {
			if (args.start - args.end !== 1) { // unexpected difference
				throw new Error('Invalid range, start is greater than end');
			}
		}
		this.removeRange(start, end, date); // remove all overlapping items older than record

		const overlaps = this.findRange(start, end); // all overlaps will be newer since we called removeRange()
		if (!overlaps || overlaps.length === 0) {
			this.smartInsert(new OneDItem(args));
		} else { // there are newer items overlapping, we need to shave down and split our record
			const item = { ...args }; //items to insert
			const overlap = overlaps[0];
			if (item.start >= overlap.start && item.end <= overlap.end) {
				return;
			} else if (item.start <= overlap.start && item.end >= overlap.end) {
				this.addRange({
					name: item.name,
					date: item.date,
					start: item.start,
					end: overlap.start - 1,
				})
				this.addRange({
					name: item.name,
					date: item.date,
					start: overlap.end + 1,
					end: item.end,
				});
				return;
			} else if (item.start <= overlap.start && item.end >= overlap.start) {
				this.addRange({
					name: item.name,
					date: item.date,
					start: item.start,
					end: overlap.start - 1,
				});
				return;
			} else if (item.start <= overlap.end && item.end >= overlap.end) {
				this.addRange({
					name: item.name,
					date: item.date,
					start: overlap.end + 1,
					end: item.end,
				});
				return;
			} else {
				console.error('Unknown case');
				console.log('trim this:', item, 'from that:', overlap);
			}
		}
	}

	removeRange(start, end, date) {
		const overlaps = this.findRange(start, end);

		for (let index = 0; index < overlaps.length; index++) {
			const item = this.array[index];
			if (item.date.getTime() < new Date(date).getTime()) {
				if (item.start >= start && item.end <= end) {
					this.array.splice(index, 1);
				} else if (item.end >= end && item.start <= start) {
					const originalEnd = item.end;
					item.end = start - 1;
					if (item.start > item.end) this.array.splice(index, 1);
					if (end + 1 <= originalEnd) this.addRange({ ...item, start: end + 1, end: originalEnd });
				} else if (item.start <= start && item.end >= start) {
					item.end = start - 1;
					if (item.start > item.end) this.array.splice(index, 1);
				} else if (item.start <= end && item.end >= end) {
					item.start = end + 1;
					if (item.start > item.end) this.array.splice(index, 1);
				}
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

	getOrganizationCount(name) {
		let count = 0;
		for (let index = 0; index < this.array.length; index++) {
			if (this.array[index].name === name) count += this.array[index].count;
		}
		return count;
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
			myMap.addRange(OneDItem.deserialize(object[index]))
		}

		return myMap;
	}
}
