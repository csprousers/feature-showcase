
// This function is taken from: https://www.movable-type.co.uk/scripts/latlong.html
function greatCircleDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}


function demoActionInvoker() {
    const dialogResult = CS.UI.showDialog({
        path: 'text-input.html',
        inputData: {
            title: 'This dialog is shown using CS.UI.showDialog, using the Action Invoker from JavaScript.\n\n' +
                   'Enter some text. The text will be returned with the vowels capitalized.',
            multiline: true
        }
    });

    if (dialogResult) {
        return dialogResult.textInput
            .replace('a', 'A')
            .replace('e', 'E')
            .replace('i', 'I')
            .replace('o', 'O')
            .replace('u', 'U');
    }
}


function convertNumberToString(iterations) {
    for (let i = 1; i <= iterations; ++i) {
        String(i).padStart(6, '0');
    }
}
