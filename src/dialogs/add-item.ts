import type { DialogManager } from "../dialog-manager";
import { OtpAlgoritm, OtpData, type Dialog } from "../interfaces";
import { showItems } from "../main";
import rawHtml from "./add-item.html?raw"

export default class AddItemDialog implements Dialog {
    title = "Add Item";
    content = rawHtml

    onShow(manager: DialogManager) {
        const form = manager.body.querySelector('#add-item') as HTMLFormElement
        form.addEventListener('submit', (e) => {
            e.preventDefault();


            let { name,
                issuer,
                secret,
                algorithm,
                type,
                digits,
                counter,
                password } = Object.fromEntries(
                    [...new FormData(form).entries()].map(
                        ([k, v]) => [k, v.toString()]
                    )
                )

            const data: Partial<OtpData> = {
                name, issuer, secret,
                digits: digits ? parseInt(digits) : undefined,
                counter: counter ? parseInt(counter) : undefined
            }

            if (algorithm in OtpAlgoritm) {
                data.algorithm = parseInt(algorithm)
            } else {
                return alert('Invalid algorithm')
            }

            if (type in OtpAlgoritm) {
                data.type = parseInt(type)
            } else {
                return alert('Invalid type')
            }

            appStorage.addItem(data as OtpData, password)
                .then(() => location.reload())
                .catch(e => alert('Invalid password'))
        })
    }
}
