import { aesGcmDecrypt, aesGcmEncrypt } from "./libs/crypto-aes-gcm"
import { Hotp, Totp } from "./libs/js-otp"

declare var key: CryptoKey
declare var wrapper: HTMLDivElement
declare var main: HTMLDivElement
declare var setting: HTMLDivElement
declare var password: HTMLInputElement
declare var setPassword: HTMLInputElement
declare var data: HTMLTextAreaElement
declare var btnSetting: HTMLButtonElement
declare var btnSave: HTMLButtonElement
declare var items: HTMLDivElement

interface Storage {
    /** Encrypted auth data */
    data: string
}

function showTab(name) {
    for (const tab of Array.from(document.getElementsByClassName('tab') as HTMLCollectionOf<HTMLDivElement>)) {
        tab.style.display = tab.id == name ? 'block' : 'none';
    }
}

const itemTemplate = `<div class="item">
<div class="issuer">ISSUER</div>
<textarea class="code" rows="1">CODE</textarea>
</div>`;

function addItem(issuer, account, code) {
    if (!issuer || issuer.length < 2)
        issuer = account;
    items.innerHTML += itemTemplate.replace('ISSUER', issuer).replace('CODE', code);
}

function clickCopyCode() {
    document.querySelectorAll('.item').forEach(el => {
        el.addEventListener('click', function (event) {
            // Select the email link anchor text
            /** @type {HTMLTextAreaElement} */
            var codeEl = this.querySelector('.code');
            codeEl.focus();
            codeEl.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copy email command was ' + msg, codeEl.innerText);
            } catch (err) {
                console.log('Oops, unable to copy');
            }
            //window.getSelection().removeAllRanges();
        });
    })
}
/**
 * @param {Uint8Array} raw 
 */
function decodeOTPMigration(raw) {
    const items = [];
    let offset = 0;
    const hotp = new Hotp();
    const totp = {
        6: new Totp(30, 6),
        8: new Totp(30, 8),
    }

    while (offset < raw.length) {
        if (raw[offset] !== 10) {
            if (offset < raw.length - 2)
                console.warn('Invalid structure at', offset, 'of', raw.length)
            break;
        }
        const itemLength = raw[offset + 1];
        const secretStart = offset + 4;
        const secretEnd = secretStart + raw[offset + 3];
        const secret = base32_encode(raw.slice(secretStart, secretEnd));

        const accountStart = secretEnd + 2;
        const accountEnd = accountStart + raw[secretEnd + 1];
        const account = new TextDecoder().decode(
            raw.slice(accountStart, accountEnd)
        ).toString();

        const issuerStart = accountEnd + 2;
        const issuerEnd = issuerStart + raw[accountEnd + 1];
        const issuer = new TextDecoder().decode(
            raw.slice(issuerStart, issuerEnd)
        ).toString();

        const algorithm = ["SHA1", "SHA1", "SHA256", "SHA512", "MD5"][
            raw[issuerEnd + 1]
        ];
        const digits = [6, 6, 8][raw[issuerEnd + 3]] || 6;
        const type = ["totp", "hotp", "totp"][
            raw[issuerEnd + 5]
        ];
        let code;
        let counter = null;
        if (type === "hotp") {
            counter = 1;
            if (issuerEnd + 7 <= itemLength) {
                counter = raw[issuerEnd + 7];
            }
            code = hotp.getOtp(secret, counter);
        } else {
            if (totp[digits])
                code = totp[digits].getOtp(secret);
            else console.warn('Unsupported digits', digits);
        }
        console.log(issuer, account, code);
        addItem(issuer, account, code);
        offset += itemLength + 2;
    };
    clickCopyCode();
}

function decryptData() {
    return aesGcmDecrypt(localStorage.data, password.value).then(
        decrypted => {
            let str = atob(decrypted);
            const raw = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                raw[i] = str.charCodeAt(i);
            }
            return decodeOTPMigration(raw);
        }
    ).catch(err => {
        console.error(err);
    })
}

document.addEventListener('DOMContentLoaded', () => {

    password.addEventListener('keydown', ev => {
        if (ev.key == '13') decryptData();
    })

    btnSave.addEventListener('click', () => {
        aesGcmEncrypt(decodeURIComponent(data.value), setPassword.value).then(
            encrypted => {
                localStorage.data = encrypted;
                showTab('main');
            }
        )

    })

    btnSetting.addEventListener('click', () => {
        showTab('setting')
    })
    if (!!localStorage.data) {
        showTab('main');
        //maybe empty password, decrypt and display
        try {
            decryptData();
        } catch (error) { }
    } else {
        showTab('setting');
    }

})

// Encode base32 in RFC 3548
// https://github.com/KahiroKoo/edBase32
const base32_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('');
function base32_encode(arr) {
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
