export function stringToColorArray(str) {
    const result = str.split(",");
    for (let i = 0; i < result.length; i++) {
        result[i] = Number.parseFloat(result[i].trim());
    }
    return result;
}