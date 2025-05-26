import type { DialogManager } from "../dialog-manager";
import type { Dialog } from "../interfaces";
import { decodeGoogleAuthenticatorProto, parseFromGoogleAuthenticator } from "../parser";
import { strToBytes } from "../utils";
import settingHtml from "./import.html?raw"

export default class ImportDialog implements Dialog {
    title = "Import Accounts";
    content = settingHtml

    onShow(manager: DialogManager) {
        const btnSave = manager.body.querySelector('#btnSave')
        const setPassword = manager.body.querySelector('#setPassword') as HTMLInputElement
        const data = manager.body.querySelector('#data') as HTMLTextAreaElement

        btnSave.addEventListener('click', async () => {
            const accounts = data.value.startsWith('otpauth-migration') ?
                parseFromGoogleAuthenticator(data.value) :
                decodeGoogleAuthenticatorProto(strToBytes(data.value));

            await appStorage.addItems(accounts, setPassword.value)
                .then(() => location.reload())
        })
    }
}
