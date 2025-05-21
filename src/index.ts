import { decodeGoogleAuthenticatorProto } from "./parser"
import { AppStorage } from "./storage"
import { showItems } from "./tabs/main"
import mainHtml from "./tabs/main.html?raw"
import settingHtml from "./tabs/settings.html?raw"
import { strToBytes } from "./utils"

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
wrapper.innerHTML = mainHtml + settingHtml

const appStorage = new AppStorage()

function showTab(name) {
    for (const tab of Array.from(document.getElementsByClassName('tab') as HTMLCollectionOf<HTMLDivElement>)) {
        tab.style.display = tab.id == name ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    password.addEventListener('keydown', async ev => {
        if (ev.key == '13') showItems(await appStorage.getData());
    })

    btnSave.addEventListener('click', async () => {
        const accounts = decodeGoogleAuthenticatorProto(strToBytes(data.value))
        await Promise.all(accounts.map(acc => appStorage.addItem(acc, setPassword.value)))
        showTab('main')
    })

    btnSetting.addEventListener('click', () => {
        showTab('setting')
    })
    if (appStorage.hasData()) {
        showTab('main');

        //Password may be empty, try to decrypt and display
        try {
            appStorage.getData().then(raw => {
                showItems(raw)
            })
        } catch (error) { }
    } else {
        showTab('setting');
    }

})

