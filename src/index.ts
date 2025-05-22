import { DialogManager } from "./dialog-manager"
import { AppStorage } from "./storage"
import { showItems } from "./main"


// Match with element ID in HTML
declare var password: HTMLInputElement

// Append tabs
// wrapper.innerHTML = mainHtml

declare global {
    var appStorage: AppStorage
}

var appStorage = window['appStorage'] = new AppStorage()
const dialogManager = new DialogManager()

document.addEventListener('DOMContentLoaded', () => {

    dialogManager.dataEvents()
    //Try empty password
    showItems('', true).catch(e => {
        dialogManager.show('password')
    })



})

