export const generateAESKey = async () => {
    const key = await crypto.subtle.generateKey(
        { name: "AES-CBC", length: 128 },
        true,
        ["encrypt", "decrypt"]
    );
    const rawKey = await crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(rawKey)))
};

export const generateRSAKeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKey = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey))));
    const privateKey = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey))));
    
    return { publicKey, privateKey };
};

export const encryptAES = async (data, base64Key, iv = false) => {
    const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(base64Key), c => c.charCodeAt(0)), { name: "AES-CBC" }, false, ["encrypt"]);
    const iv_ = iv ? Uint8Array.from(atob(iv), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv_ },
        key,
        encodedData
    );
    return { encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))), iv: btoa(String.fromCharCode(...iv_)) };
};

export const decryptAES = async (encryptedData, base64Key, iv) => {
    const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(base64Key), c => c.charCodeAt(0)), { name: "AES-CBC" }, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
        key,
        Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    );
    return new TextDecoder().decode(decrypted);
};

export const encryptRSA = async (data, publicKey) => {
    const importedKey = await crypto.subtle.importKey("spki", Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, importedKey, new TextEncoder().encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};

export const decryptRSA = async (encryptedData, privateKey) => {
    const importedKey = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(privateKey), c => c.charCodeAt(0)), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, importedKey, Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0)));
    return new TextDecoder().decode(decrypted);
};

export const computeHash = async (data) => {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
};