import { DialogManager } from "./dialog-manager"
import { AppStorage } from "./storage"
import { showItems } from "./main"


// Match with element ID in HTML
declare var wrapper: HTMLDivElement
declare var main: HTMLDivElement
declare var setting: HTMLDivElement
declare var setPassword: HTMLInputElement
declare var data: HTMLTextAreaElement
declare var btnSetting: HTMLButtonElement
declare var btnSave: HTMLButtonElement
declare var password: HTMLInputElement

// Append tabs
// wrapper.innerHTML = mainHtml

declare global {
    var appStorage: AppStorage
}

var appStorage = window['appStorage'] = new AppStorage()
let dialogManager: DialogManager


function showDialog(name: string) {
    if (!dialogManager) {
        dialogManager = new DialogManager()
    }
    dialogManager.show(name)
}

document.addEventListener('DOMContentLoaded', () => {

    password.addEventListener('keydown', async ev => {
        if (ev.key == '13') showItems(await appStorage.getData());
    })

    // btnSave.addEventListener('click', async () => {
    //     const accounts = decodeGoogleAuthenticatorProto(strToBytes(data.value))
    //     await Promise.all(accounts.map(acc => appStorage.addItem(acc, setPassword.value)))
    //     showTab('main')
    // })

    btnSetting.addEventListener('click', () => {
        showDialog('import')
    })

    //Password may be empty, try to decrypt and display
    try {
        appStorage.getData().then(raw => {
            showItems(raw)
        })
    } catch (error) { }


})

