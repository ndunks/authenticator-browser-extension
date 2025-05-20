// Encode base32 in RFC 3548
// https://github.com/KahiroKoo/edBase32
const base32_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('');
export function base32_encode(arr) {
    const aAscii2 = [];
    for (let key in arr) {
        const ascii2 = arr[key].toString(2);
        let gap = 8 - ascii2.length;
        let zeros = '';
        for (let i = 0; i < gap; i++) {
            zeros = '0' + zeros;
        }
        aAscii2.push(zeros + ascii2);
    }
    let source = aAscii2.join('');
    let eArr = [];
    for (let i = 0; i < source.length; i += 5) {
        let s5 = source.substring(i, i + 5);
        if (s5.length < 5) {
            let gap = 5 - s5.length;
            let zeros = '';
            for (let gi = 0; gi < gap; gi++) {
                zeros += '0';
            }
            s5 += zeros;
        }
        let eInt = parseInt(s5, 2)
        eArr.push(base32_chars[eInt]);
    }

    if (eArr.length % 8 != 0) {
        let gap = 8 - (eArr.length % 8);
        for (let i = 0; i < gap; i++) {
            eArr.push('=');
        }
    }

    return eArr.join('');
}
