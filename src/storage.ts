import { OtpAlgoritm, type OtpData } from "./interfaces";
import { aesGcmDecrypt, aesGcmEncrypt } from "./libs/crypto-aes-gcm";
import { decodeGoogleAuthenticatorProto } from "./parser";
import { makeId } from "./utils";


export class AppStorage {

    cached: OtpData[]

    hasData() {
        return !!localStorage.data
    }

    async addItem(item: OtpData, password?: string) {
        if (!item.id) {
            item.id = makeId()
        }
        return this.addItems([item], password)
    }

    async removeItem(id: string, password?: string) {
        const index = this.cached.filter(v => !!v).findIndex(v => v.id == id)
        if (index < 0) return
        this.cached.splice(index, 1)
        return this.setData(this.cached, password)
    }
    async replaceItem(id: string, password?: string, replaceItem?: OtpData) {
        const index = this.cached.filter(v => !!v).findIndex(v => v.id == id)
        if (index < 0) return
        replaceItem.id = id
        this.cached.splice(index, 1, replaceItem)
        return this.setData(this.cached, password)
    }

    async addItems(items: OtpData[], password?: string) {
        let accounts: OtpData[] = []
        if (this.hasData()) {
            accounts = await this.getData(password)
        }
        accounts.push(...items)
        return this.setData(accounts, password)
    }

    changePassword(oldPassword: string, newPassword: string) {
        return this.getData(oldPassword).then(data => this.setData(data, newPassword))
    }

    setData(raw: OtpData[], password?: string) {
        return aesGcmEncrypt(JSON.stringify(raw.filter(v => !!v)), password).then(
            encrypted => {
                localStorage.data = encrypted;
                return true
            }
        )
    }

    getData(password?: string) {
        return aesGcmDecrypt(localStorage.data, password).then<OtpData[]>(
            decrypted => {
                if (decrypted[0] != '[') {
                    // migrate from old format
                    let str = atob(decrypted);
                    const raw = new Uint8Array(str.length);
                    for (let i = 0; i < str.length; i++) {
                        raw[i] = str.charCodeAt(i);
                    }
                    const accounts = decodeGoogleAuthenticatorProto(raw)
                    console.warn(`Migrating old data to new object`, accounts)
                    this.setData(accounts, password)
                    return this.cached = accounts
                }
                return this.cached = JSON.parse(decrypted)
            }
        )
    }

    private validateItem(otp: Record<string, any>): OtpData {
        if (typeof otp != 'object' || !otp)
            throw new Error('Invalid object')

        if (!otp.secret)
            throw new Error('Empty secret')

        const data: Partial<OtpData> = {
            name: otp.name.toString(),
            issuer: otp.issuer.toString(),
            secret: otp.secret.toString(),
            digits: otp.digits ? parseInt(otp.digits.toString()) : undefined,
            counter: otp.counter ? parseInt(otp.counter.toString()) : undefined
        }

        if (otp.algorithm in OtpAlgoritm) {
            data.algorithm = parseInt(otp.algorithm.toString())
        } else {
            throw new Error('Invalid algorithm')
        }

        if (otp.type in OtpAlgoritm) {
            data.type = parseInt(otp.type.toString())
        } else {
            throw new Error('Invalid type')
        }

        data.id = otp.id || makeId()

        return data as OtpData
    }

    async createItem(otp: Record<string, any>, password: string) {

        const data = this.validateItem(otp)

        await appStorage.addItem(data as OtpData, password)
            .catch(e => Promise.reject(new Error('Invalid password')))

        return data
    }
    async updateItem(id: string, otp: Record<string, any>, password: string) {
        const data = this.validateItem(otp)
        await appStorage.replaceItem(id, password, data)
            .catch(e => {
                console.error(e)
                return Promise.reject(new Error('Invalid password'))
            })
        return data
    }
}
