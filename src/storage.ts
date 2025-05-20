import { aesGcmDecrypt } from "./libs/crypto-aes-gcm";


export class AppStorage {
    hasData() {
        return !!localStorage.data
    }
    
    setData(raw: string, password?: string) {
        return !!localStorage.data
    }

    getData(password?: string) {
        return aesGcmDecrypt(localStorage.data, password).then(
            decrypted => {
                let str = atob(decrypted);
                const raw = new Uint8Array(str.length);
                for (let i = 0; i < str.length; i++) {
                    raw[i] = str.charCodeAt(i);
                }
                return raw//decodeOTPMigration(raw);
            }
        )
    }
}
