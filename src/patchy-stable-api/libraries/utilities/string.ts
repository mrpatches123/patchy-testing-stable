export class StringUtilities {
	static chunkString(str: string, length: number) {
		let size = (str.length / length) | 0;
		const array: string[] = Array(++size);
		for (let i = 0, offset = 0; i < size; i++, offset += length) {
			array[i] = str.substr(offset, length);
		}
		return array;
	}
	static toSnakeCase(str: string) {
		return str.replace(/^[A-Z]/, (s) => s.toLowerCase()).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/[^A-Za-z0-9]+/g, "_");
	}
	static toProperCaseTypeId(typeId: string) {
		return StringUtilities.toProperCase(typeId?.replace(/[._\w]+:/, ""));
	}
	static toProperCase(string: string) {
		return string?.replace(/[_.]/g, ' ')?.replace(/\w\S*/g, (txt) => txt.charAt(0)?.toUpperCase() + txt?.substr(1)?.toLowerCase());
	}
	static toCamelCase(str: string) {
		return str.replace(/(?:^\w|[A-Z]|(\b|_)\w)/g, (word, index) => word.toUpperCase()).replace(/[\s_]+/g, '').replace(/\w/, (world) => world.toLowerCase());
	}
	static parseCommand(message: string, prefix: string) {
		const messageLength = message.length;
		let finding: boolean | string = false;
		let braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0;
		let started = false;
		let o = 0;
		const output: string[] = [];
		for (let i = prefix.length; i < messageLength; i++) {
			const char = message[i];
			switch (char) {
				case '{':
					switch (finding) {
						case 'json':
							break;
						default:
							braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
							output.push('');
							o++;
							finding = 'json';
							break;

					}
					output[o] += char;
					braceCount[0]++;
					break;
				case '}':
					output[o] += char;
					if (braceCount[0] !== ++braceCount[1] || bracketCount[0] !== bracketCount[1] || (quoteCount && quoteCount & 1)) break;
					braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
					break;
				case ']':
					output[o] += char;
					if (bracketCount[0] !== ++bracketCount[1] || braceCount[0] !== braceCount[1] || (quoteCount && quoteCount & 1)) break;
					braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
					break;
				case '"':
					switch (finding) {
						case 'json':
							output[o] += char;
							break;
						default:
							braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
							finding = 'string';
						case 'string':
							if (!(++quoteCount & 1)) { finding = false; break; };
							if (!output[o].length) break;
							output.push('');
							o++;
							break;
					}
					break;
				case '[':
					switch (finding) {
						case 'json':
							break;
						default:
							output.push('');
							o++;
							finding = 'json';
							break;

					}
					output[o] += char;
					bracketCount[0]++;
					break;
				case ' ':
					switch (finding) {
						case 'string':
						case 'json':
							if (!(quoteCount & 1)) break;
							output[o] += char;
							break;
						default:
							const nextChar = message?.[i + 1];
							switch (nextChar) {
								case ' ':
								case '[':
								case '{':
								case '"':
									break;
								default:
									output.push('');
									o++;
									finding = 'word';
									break;
							}
							break;
					}
					break;
				default:
					if (!started) {
						started = true;
						finding = 'word';
						output.push('');
						spaceCount = 1;
					}
					switch (char) {
						case '@':
							if (finding === 'string') {
								output[o] += char;
								break;
							}
							const nextChar = message?.[i + 1];
							switch (nextChar) {
								case '"':
									break;
								default:
									const afterNextChar = message?.[i + 2];
									switch (afterNextChar) {
										case ' ':
											finding = 'string';
											output[o] += char;
											break;
										case '[':
											finding = 'json';
											output[o] += char;
											break;

									}
									break;
							}
							break;
						default:
							output[o] += char;
							break;
					}

					break;
			}
		}
		return output;
	}

}