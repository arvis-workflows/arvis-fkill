'use strict';
const arvish = require('arvish');
const psList = require('ps-list');
const pidFromPort = require('pid-from-port');

const loadProcesses = () => {
	if (arvish.input.startsWith(':')) {
		const search = arvish.input.slice(1);

		return Promise.all([
			pidFromPort.list(),
			psList({all: false})
		]).then(result => {
			const ports = result[0];
			const processList = result[1];

			// Swap port and pid
			const pidMap = new Map();
			for (const entry of ports.entries()) {
				const port = String(entry[0]);

				if (!port.includes(search)) {
					// Filter out results which don't match the search term
					continue;
				}

				pidMap.set(entry[1], String(entry[0]));
			}

			return processList
				.map(process => Object.assign({}, process, {port: pidMap.get(process.pid)}))
				.filter(process => Boolean(process.port));
		});
	}

	return psList().then(data => arvish.inputMatches(data, 'name'));
};

loadProcesses()
	.then(processes => {
		const items = processes
			.filter(process => !process.name.endsWith(' Helper'))
			.map(process => {
				let subtitle = process.cmd;

				if (process.port) {
					// TODO; Use `process.path` property
					subtitle = `${process.port} - ${subtitle}`;
				}

				return {
					title: process.name,
					autocomplete: process.name,
					subtitle,
					arg: process.pid,
					mods: {
						shift: {
							subtitle: `CPU ${process.cpu}%`
						},
						alt: {
							subtitle: 'Force kill',
						}
					}
				};
			})
			.sort();

		arvish.output(items);
	});
