export default function init(modules) {
    const ts = modules.typescript;
    function create(info) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        const whatToRemove = info.config.remove || ["caller"];
        const proxy = Object.create(null);
        // ... (set up decorator here) ...
        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
            if (!prior)
                throw new Error("No prior completions found");
            prior.entries = prior.entries.filter(e => whatToRemove.indexOf(e.name) < 0);
            return prior;
        };
        return proxy;
    }
}
//# sourceMappingURL=properties.js.map