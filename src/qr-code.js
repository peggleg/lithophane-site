import QRCode from 'qrcode';
export function encodeKeyringQR(value){
 const text=String(value??'').trim();if(!text)throw Error('Enter the link or text for your QR code.');
 if(new TextEncoder().encode(text).length>120)throw Error('Use up to 120 UTF-8 bytes for a printable QR code. Shorten the link or text.');
 if(/[\u0000-\u001F\u007F]/.test(text))throw Error('Use a single line of QR text without control characters.');
 const code=QRCode.create(text,{errorCorrectionLevel:'M'});return {text,size:code.modules.size,data:Array.from(code.modules.data),quiet:4};
}
