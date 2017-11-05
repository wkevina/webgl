function arraySetter(buffer) {
    let count = 0;
    return function(newElements) {
        buffer.set(newElements, count);
        count += newElements.length;
    }
}

export {arraySetter};
