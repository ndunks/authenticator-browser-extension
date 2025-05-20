import { aesGcmDecrypt, aesGcmEncrypt } from "./libs/crypto-aes-gcm"
import { Hotp, Totp } from "./libs/js-otp"
import { AppStorage } from "./storage"
import { showItems } from "./tabs/main"
import mainHtml from "./tabs/main.html?raw"
import settingHtml from "./tabs/settings.html?raw"

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
            appStorage.getData().then(showItems)
        } catch (error) { }
    } else {
        showTab('setting');
    }

})

