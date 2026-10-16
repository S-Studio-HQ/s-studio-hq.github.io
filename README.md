# s-studio-hq.github.io

The web home of SStudio's passkeys: `s-studio-hq.github.io` is the relying party ID of every SStudio passkey.

- `passkey.html` - SStudio's passkey page: SStudio opens it to make a passkey or ask it for its PRF answer, and
  the page sends the answer only to SStudio on the same computer (`127.0.0.1`). Its source is
  `src/SStudio/utils/crypto/web/passkey.html` in SStudio - change it there, then copy it here.
- `prf_test.html` - a test page: does a passkey give the same PRF answer every time? Nothing is sent anywhere;
  the answer is only shown in the page.

Never delete this repository or the `S-Studio-HQ` organization: the passkeys are tied to this name.
