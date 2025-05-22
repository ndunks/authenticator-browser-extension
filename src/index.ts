import { DialogManager } from "./dialog-manager"
import { AppStorage } from "./storage"
import { showItems } from "./main"

declare global {
    var appStorage: AppStorage
    var dialogManager: DialogManager
}

window['appStorage'] = new AppStorage()
window['dialogManager'] = new DialogManager()

document.addEventListener('DOMContentLoaded', () => {

    dialogManager.dataEvents()
    //Try empty password
    showItems('', true).catch(e => {
        if (e.name == 'OperationError') {
            dialogManager.show('password')
        } else {
            alert(e.message || e)
        }
    })
})

