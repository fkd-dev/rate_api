function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function sleepSec(sec) {
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
}

function countWord(source, findWord) {
    return (source.match(new RegExp(findWord, "g")) || []).length;
}

module.exports = {
    sleep, 
    sleepSec,
    countWord
}
