export const NETWORK_SHIM = `
// --- DOC-VERIFY NETWORK SHIM ---
(function() {
    const log = (url) => console.log(\`[Network Mock] 200 OK -> \${url}\`);

    // 1. Mock global fetch
    global.fetch = async function(url, options) {
        log(url);
        return {
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => ({ message: "Mocked Response", id: 1, success: true }),
            text: async () => "Mocked Response",
            headers: new Map(),
        };
    };

    // 2. Mock 'https' and 'http' modules if imported via require
    // Note: We can't easily mock 'require' modules in a running script without a loader,
    // but we can mock the global implementations if they rely on globals.
    // For a robust solution, we rely on the AI to see "require('https')" and replace it, 
    // OR we use the fetch shim which covers 90% of modern docs.
})();
// --- END SHIM ---
`;