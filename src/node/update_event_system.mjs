

/*
import { ItemUseAfterEventSignal } from "@minecraft/server";

export const eventsSubscribed: Record<string, number> = {};

// Store original methods
const originalSubscribe = ItemUseAfterEventSignal.prototype.subscribe;
const originalUnsubscribe = ItemUseAfterEventSignal.prototype.unsubscribe;

// Override the subscribe method
ItemUseAfterEventSignal.prototype.subscribe = function (...parameters) {
	eventsSubscribed['ItemUseAfterEventSignal'] ??= 0;
	eventsSubscribed['ItemUseAfterEventSignal']++;

	// Call the original subscribe method
	return originalSubscribe.apply(this, parameters);
};

// Override the unsubscribe method
ItemUseAfterEventSignal.prototype.unsubscribe = function (...parameters) {
	eventsSubscribed['ItemUseAfterEventSignal'] ??= 0;

	// Decrement the count and delete the entry if necessary
	if (--eventsSubscribed['ItemUseAfterEventSignal'] <= 0) {
		delete eventsSubscribed['ItemUseAfterEventSignal'];
	}

	// Call the original unsubscribe method
	return originalUnsubscribe.apply(this, parameters);
};
*/

import path from 'path';
import fs from 'fs';

const events = [...new Set(fs.readFileSync(path.resolve("node_modules/@minecraft/server/index.d.ts")).toString().match(/\w+Signal/g).map(a => a)).values()];
console.log(events);
const file = `import { System, ${events.join(', ')} } from "@minecraft/server";
export const eventsSubscribed: Record<string, number> = {};

${events.map(event => `
// Store original methods
const originalSubscribe${event} = ${event}.prototype.subscribe;
const originalUnsubscribe${event} = ${event}.prototype.unsubscribe;

// Override the subscribe method
${event}.prototype.subscribe = function (...parameters) {
	eventsSubscribed['${event}'] ??= 0;
	eventsSubscribed['${event}']++;

	// Call the original subscribe method
	return originalSubscribe${event}.apply(this, parameters);
};

// Override the unsubscribe method
${event}.prototype.unsubscribe = function (...parameters) {
	eventsSubscribed['${event}'] ??= 0;

	// Decrement the count and delete the entry if necessary
	if (--eventsSubscribed['${event}'] <= 0) {
		delete eventsSubscribed['${event}'];
	}

	// Call the original unsubscribe method
	return originalUnsubscribe${event}.apply(this, parameters);
};`).join('\n\n')}


const originalSystemRunInterval = System.prototype.runInterval; \
// Override the subscribe method
System.prototype.runInterval = function (...parameters) {
	eventsSubscribed['SystemRun'] ??= 0;
	eventsSubscribed['SystemRun']++;

	// Call the original subscribe method
	return originalSystemRunInterval.apply(this, parameters);
};

const originalSystemclearRun = System.prototype.clearRun;
System.prototype.clearRun = function (...parameters) {
	eventsSubscribed['SystemRun'] ??= 0;

	// Decrement the count and delete the entry if necessary
	if (--eventsSubscribed['SystemRun'] <= 0) {
		delete eventsSubscribed['SystemRun'];
	}

	// Call the original unsubscribe method
	return originalSystemclearRun.apply(this, parameters);
};
`;

fs.writeFileSync(path.resolve("src/event_prototypes.ts"), file);

/*const originalSystemRunJob = System.prototype.runJob;
// Override the subscribe method
System.prototype.runJob = function (...parameters) {
	eventsSubscribed['SystemJob'] ??= 0;
	eventsSubscribed['SystemJob']++;

	// Call the original subscribe method
	return originalSystemRunJob.apply(this, parameters);
};
const originalSystemRunTimeout = System.prototype.runTimeout;
// Override the subscribe method
System.prototype.runTimeout = function (...parameters) {
	eventsSubscribed['SystemRun'] ??= 0;
	eventsSubscribed['SystemRun']++;

	// Call the original subscribe method
	return originalSystemRunTimeout.apply(this, parameters);
};
const originalSystemRun = System.prototype.run;
// Override the subscribe method
System.prototype.run = function (...parameters) {
	eventsSubscribed['SystemRun'] ??= 0;
	eventsSubscribed['SystemRun']++;

	// Call the original subscribe method
	return originalSystemRun.apply(this, parameters);
};
const originalSystemclearJob = System.prototype.clearJob;
System.prototype.clearJob = function (...parameters) {
	eventsSubscribed['SystemJob'] ??= 0;

	// Decrement the count and delete the entry if necessary
	if (--eventsSubscribed['SystemJob'] <= 0) {
		delete eventsSubscribed['SystemJob'];
	}

	// Call the original unsubscribe method
	return originalSystemclearJob.apply(this, parameters);
};
*/