
// these routines process random numbers from 0 - 9,999,999
const RandomNumberUpperBoundExclusive = 10_000_000;


// this function opens the data source, runs a callback function, and closes the data source;
// using this is a convenience so that we do not have to open/close the data in each function
function dataAccessWrapper(callback) {
    let dataId;

    try {
        // open (or create) the Random Numbers data, calling into CSPro to get the file path
        // and using the dictionary associated with the application
        dataId = CS.Data.open({
            connection: csGetRandomNumbersFilePath(),
            dictionary: "RANDOM_NUMBERS_DICT",
            openFlags: "readWriteCreate"
        });

        // run the callback function
        return callback(dataId);
    }

    finally {
        // close the data source
        if( dataId != undefined ) {
            CS.Data.close({
                dataId
            });
        }
    }
}


// this function is called by the MENU question text to show the keys in the data source
function jsGetRandomNumberKeysText() {
    const keys = dataAccessWrapper((dataId) => {
        return CS.Data.queryKeys({
            dataId,
            sort: {
                order: "key"
            }
        });
    });

    if (keys.length === 0) {
        return "<no random number cases added yet>";
    }
    else {
        return keys.join("\n");
    }
}


// this function creates cases and writes them to the data source;
// viewing an existing case in Data Manager, shown in JSON, is useful
// to learn about the way that cases are represented in JSON
function jsCreateRandomNumbers(creationTime, numbersToAdd) {
    dataAccessWrapper((dataId) => {
        for (let i = 1; i <= numbersToAdd; ++i) {
            // construct the case
            const dataCase = {
                RANDOM_NUMBERS_LEVEL: {
                    // ID items
                    CREATION_TIME: { code: creationTime },
                    CREATION_INDEX_PREFIX: { code: "i:" },
                    CREATION_INDEX: { code: i },
                    MODIFICATION_INDEX_PREFIX: { code: "m:" },
                    MODIFICATION_INDEX: { code: 0 },
                    // RANDOM_NUMBERS_REC record
                    RANDOM_NUMBERS_REC: [
                        {
                            RANDOM_NUMBER: { code: Math.floor(Math.random() * RandomNumberUpperBoundExclusive) }
                        }
                    ]
                }
            };

            // write the case
            CS.Data.writeCase({
                dataId,
                case: dataCase
            });
        }
    });
}


// this function wraps dataAccessWrapper and prompts the user
// for a case and then runs a callback function
function selectCaseWrapper(action, callback) {
    dataAccessWrapper((dataId) => {
        // read the case keys
        const keys = CS.Data.queryKeys({
            dataId,
            sort: {
                order: "key"
            }
        });

        if (keys.length === 0) {
            CS.UI.alert({
                text: "No random number cases have been created!"
            });
            return;
        }

        // use the "choice" dialog (used by the logic function "accept") to select a case

        // map the keys into the choices format used by the dialog
        let keyIndex = 0;
        const choices = keys.map(key => ({
            caption: key,
            index: keyIndex++
        }));

        const result = CS.UI.showDialog({
            path: "choice.html",
            inputData: {
                title: `Select the key of a case to ${action}:`,
                choices: choices
            }
        });

        if (result !== undefined) {
            callback(dataId, keys[result.index]);
        }
    });
}


// this function reads a case and displays it using the questionnaire view
function jsReadViewRandomNumberCase() {
    selectCaseWrapper("read and view", (dataId, key) => {
        // read the case
        const dataCase = CS.Data.readCase({
            dataId,
            key
        });

        // the questionnaire content associated with the dictionary will
        // include the "current case" associated with RANDOM_NUMBERS_DICT
        const questionnaireContent = CS.Application.getQuestionnaireContent({
            name: "RANDOM_NUMBERS_DICT"
        });

        // replace that case with the one we read
        questionnaireContent.case = dataCase;

        // display it using questionnaire view
        CS.UI.view({
            path: CS.Path.getSpecialPaths().html + "/questionnaire-view/index.html",
            inputData: questionnaireContent
        });
    });
}


// this function reads a case, modifies the value of MODIFICATION_INDEX, and writes it
function jsModifyRandomNumberCase() {
    selectCaseWrapper("modify", (dataId, key) => {
        // read the case
        const dataCase = CS.Data.readCase({
            dataId,
            key
        });

        // modify the modification index
        ++dataCase.RANDOM_NUMBERS_LEVEL.MODIFICATION_INDEX.code;

        // write the case with its new ID, replacing the existing case
        CS.Data.writeCase({
            dataId,
            case: dataCase,
            replace: {
                key
            }
        });
    });
}


// this function deletes a case
function jsDeleteRandomNumberCase() {
    selectCaseWrapper("delete", (dataId, key) => {
        // delete the case
        const dataCase = CS.Data.deleteCase({
            dataId,
            key
        });
    });
}


// this function reads all cases, including deleted cases,
// and creates a summary of the cases in Markdown
function jsCreateRandomNumberCaseSummaryMarkdown() {
    return dataAccessWrapper((dataId) => {
        // read the cases, creating some summary variables
        let notDeletedCaseCount = 0;
        let deletedCaseCount = 0;
        let modifiedCasesCount = 0;
        let creationTimeCount = 0;
        let lastCreationTime;

        const FrequencyBuckets = 10;
        const FrequencyDivisor = RandomNumberUpperBoundExclusive / FrequencyBuckets;
        const freqs = Array(FrequencyBuckets).fill(0);

        const cases = CS.Data.queryCases({
            dataId,
            status: "all",
            sort: {
                order: "key"
            }
        });

        cases.forEach(dataCase => {
            if (dataCase.deleted) {
                ++deletedCaseCount;
            }
            else {
                ++notDeletedCaseCount;
            }

            if (dataCase.RANDOM_NUMBERS_LEVEL.MODIFICATION_INDEX.code !== 0) {
                ++modifiedCasesCount;
            }

            if (lastCreationTime !== dataCase.RANDOM_NUMBERS_LEVEL.CREATION_TIME.code) {
                ++creationTimeCount;
                lastCreationTime = dataCase.RANDOM_NUMBERS_LEVEL.CREATION_TIME.code;
            }

            const randomNumber = dataCase.RANDOM_NUMBERS_LEVEL.RANDOM_NUMBERS_REC[0].RANDOM_NUMBER.code;
            const bucket = Math.floor(randomNumber/ FrequencyDivisor);
            ++freqs[bucket];
        });

        // generate the Markdown
        let md = "# Random Number Summary\n\n"

        md += "## Case Counts\n";
        md += `* Case creation times: ${creationTimeCount}\n`;
        md += `* Cases (not deleted): ${notDeletedCaseCount}\n`;
        md += `* Cases (deleted but still in file): ${deletedCaseCount}\n`;
        md += `* Cases (modified): ${modifiedCasesCount}\n`;

        md += "## Random Number Frequencies\n";
        md += "|Range Start|Range End|Count|\n";
        md += "|:---:|:---:|:---:|\n";

        let rangeStart = 0;
        freqs.forEach((count, index) => {
            const nextRangeStart = rangeStart + FrequencyDivisor;
            md += `|${rangeStart}|${nextRangeStart - 1}|${count}|\n`;
            rangeStart = nextRangeStart;
        });

        return md
    });
}
