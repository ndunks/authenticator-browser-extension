import { OtpData, OtpType } from "./interfaces";
import { Hotp, Totp } from "./libs/js-otp";
import itemTemplate from "./item.html?raw";

declare var items: HTMLDivElement
const errHtml = '<div class="code" title="ERRTITLE" style="color:red">#ERROR</div>'

function showItem(account: OtpData, code: string | Error) {
    let title = account.issuer || account.name
    let parsed = itemTemplate.replace(/\{TITLE\}/g, title)
        .replace(/\{ID\}/g, account.id)
        .replace(/\{NAME\}/g, account.name)
    if (typeof code == 'string') {
        parsed = parsed.replace(/\{CODE\}/g, code)
    } else {
        parsed = parsed.replace(/<textarea class="code".*?<\/textarea>/,
            errHtml.replace('ERRTITLE', code.message || 'Unknown error, check console.')
        )
    }
    items.innerHTML += parsed

}

function clickCopyCode() {
    document.querySelectorAll('.item').forEach(el => {
        el.addEventListener('click', function (event) {
            const btn = (event.target as HTMLElement).closest('button') as HTMLButtonElement
            if (btn) {
                dialogManager.show('edit-item', { id: btn.closest('div').id })
                return;
            }
            // Select the email link anchor text
            /** @type {HTMLTextAreaElement} */
            const codeEl = this.querySelector('.code') as HTMLTextAreaElement;

            if (!codeEl) return

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
export async function showItems(password?: string, silent?: boolean) {
    const accounts = await appStorage.getData(password).catch(e => {
        console.error(e)
        if (e.name == 'OperationError') {
            silent || alert('Invalid password')
        }
        return Promise.reject(e)
    })

    if (!accounts) return

    const hotp = new Hotp();
    const totp = {
        6: new Totp(30, 6),
        8: new Totp(30, 8),
    }
    for (const account of accounts) {
        if (!account) {
            console.warn('Found null account', accounts)
            continue
        }
        let code;
        try {
            if (account.type === OtpType.HOTP) {
                code = hotp.getOtp(account.secret, account.counter);
            } else {
                if (account.digits in totp)
                    code = totp[account.digits].getOtp(account.secret);
                else console.warn('Unsupported digits', account.digits);
            }
        } catch (error) {
            console.log(account)
            console.error(error)
            code = error
        }

        showItem(account, code);
    }
    clickCopyCode()
}