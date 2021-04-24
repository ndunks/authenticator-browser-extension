# Authenticator Browser Extension

    Secure, Simple, Minimalist, and Hackable Google Chrome extension that display OTP Code from Google Authenticator App.
    Your data will be stored on `localStorage` and you can encrypt it using a password.

Google Authenticator Migration for Google Chrome Extension.
Backup Authenticator data before it too late.

## How Import Data From Google Authenticator

- Open Google Authenticator App
- Choose export, screenshot the QR Code, click cancel
- Scan the QR Code image using available online JS QR Code decoder, such as [this](https://nimiq.github.io/qr-scanner/demo/)
- should result like this `otpauth-migration://offline?data=THIS_DATA`
- Copy the `THIS_DATA` to setting
- Set a password before saving it.
- That's it

## Credits
- jsOTP: https://github.com/jiangts/JS-OTP
- Base32 Encode: https://github.com/KahiroKoo/edBase32
- crypto-aes-gcm.js: https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a