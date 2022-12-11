/**
 * ### Description
 * Generates a random number of variable length using a prefix that is passed;
 * @param {string} prefix - prefix to be used when creating random number.
 * @param {number} length - the length of the number to create. 
 * @returns {string}
 */
exports.randomNumberGenerator = function (prefix, length){
    let randomNumber = prefix;
    while (randomNumber.length <= length){
        randomNumber += `${Math.floor(Math.random() * 10)}`;
    }
    return randomNumber
}