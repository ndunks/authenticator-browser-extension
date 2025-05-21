import { OtpData, OtpType } from "../interfaces";
import { base32_encode } from "../libs/base32";
import { Hotp, Totp } from "../libs/js-otp";

declare var items: HTMLDivElement

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
export function showItems(accounts: OtpData[]) {
    const hotp = new Hotp();
    const totp = {
        6: new Totp(30, 6),
        8: new Totp(30, 8),
    }
    for (const account of accounts) {
        let code;
        let counter = null;
        if (account.type === OtpType.HOTP) {
            code = hotp.getOtp(account.secret, account.counter);
        } else {
            if (account.digits in totp)
                code = totp[account.digits].getOtp(account.secret);
            else console.warn('Unsupported digits', account.digits);
        }
        // console.log(issuer, account, code);
        addItem(account.issuer, account.name, code);
    }
    clickCopyCode()
}