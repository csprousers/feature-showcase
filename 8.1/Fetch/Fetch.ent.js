
function jsDemoFetchJsonRequestHeaders() {

    // get information about the releases from the CSPro open source repository;
    // the GitHub API requires the specification of a User-Agent header
    const releases = CS.Network.fetchJson({
        url: "https://api.github.com/repos/csprousers/cspro/releases?per_page=5",
        headers: [
            "User-Agent: CSPro 8.2 Feature Showcase"
        ]
    });

    let result = "Information about the most recent CSPro releases:\n\n";

    // the releases endpoint returns an array of objects
    releases.forEach(release => {
        result += `Release tagged '${release.tag_name}' ` +
                  `authored by '${release.author.login}' ` +
                  `created at '${release.created_at}'\n`;
    });

    return result;
}


function jsDemoFetchJsonResponseHeadersAndBody(time) {

    // use httpbin.org to POST text and then return details from the response
    const response = CS.Network.fetchJson({
        url: "https://httpbin.org/post",
        method: "POST",
        body: "Text sent to httpbin.org from the CSPro 8.2 Feature Showcase at: " + time,
        bodyFormat: "text",
        detailed: true
    });

    return (
        'A detailed response includes information such as:' +
        `\n\n'status': ${response.status}` +
        `\n\n'ok': ${response.ok}` +
        `\n\n'headers' (the response headers):\n${JSON.stringify(response.headers, undefined, 2)}` +
        `\n\n'body' (the body that is returned directly when not using detailed mode):\n${JSON.stringify(response.body, undefined, 2)}`
    );
}


function jsDemoFetchRetrieveBodyAsJson() {

    // query information about the latest few commits to the CSPro open source repository;
    // the GitHub API requires the specification of a User-Agent header
    const response = CS.Network.fetch({
        url: "https://api.github.com/repos/csprousers/cspro/commits?per_page=5",
        headers: {
            "User-Agent": "CSPro 8.2 Feature Showcase"
        }
    });

    if (!response.ok) {
        throw new Error(`Could not query the commits. HTTP status code: ${response.status}.`);
    }

    // with a successful response, retrieve the body as JSON using the
    // resource ID (fetchId) returned from the initial call to Network.fetch
    const commits = CS.Network.fetchBody({
        fetchId: response.fetchId,
        bodyFormat: "json"
    });

    let result = "Information about the most recent CSPro commits:\n\n";

    // the commits endpoint returns an array of objects
    commits.forEach(commitObj => {
        const commit = commitObj.commit;
        result += `Commit authored by "${commit.author.name}", ` +
                  `committed on "${commit.committer.date}", ` +
                  `with message: "${commit.message}"\n`;
    });

    return result;
}


function jsDemoFetchRetrieveBodyConditionally(showAcceptCallback) {

    const requestType = showAcceptCallback(
        "Do you want to submit a request that is...",
        [ "Valid", "Invalid" ]
    );

    if (requestType == 0) {
        return "";
    }

    // use the Vegan Ipsum API to...
    const apiUrl = "https://veganipsum.vercel.app/api";

    // ...make a valid request
    if (requestType == 1) {
        const response = CS.Network.fetch({
            url: apiUrl + "?count=3&units=paragraphs"
        });

        if (!response.ok) {
            return "The request was unexpectedly invalid: " + response.status;
        }

        const processType = showAcceptCallback(
            `What would you like to do with the pending fetch identified by fetchId '${response.fetchId}'?`,
            [ "Process the body", "Cancel" ]
        );

        // process
        if (processType == 1) {
            const body = CS.Network.fetchBody({
                fetchId: response.fetchId,
                bodyFormat: "json"
            });

            // space out each of the paragraphs
            const paragraphs = body.text.replace(/\n/g, "\n\n");

            return "The body was processed, returning the following text:\n\n" + paragraphs;
        }

        // cancel
        else {
            CS.Network.fetchBody({
                fetchId: response.fetchId,
                cancel: true
            });

            return "The body was discarded."
        }
    }

    // ...or to make a request that will be invalid
    else if (requestType == 2) {
        const response = CS.Network.fetch({
            url: apiUrl + "?format=invalid-format-specified-by-cspro"
        });

        return `The invalid request response (${response.status}) had error:\n\n` + response.error;
    }
}
