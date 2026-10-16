# s-studio-hq.github.io

The web home of SStudio's passkeys: `s-studio-hq.github.io` is the relying party ID of every SStudio passkey.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The home page: what this site is for. |
| `authenticate/authenticate-passkey.html` | SStudio's passkey page. SStudio opens it to make a passkey or ask it for its PRF answer; the page finds out by itself whether it runs on a Mac, Windows or a phone, and sends the answer only to SStudio on the same computer (`127.0.0.1`). |
| `passkey.html` | The old address of the passkey page: it moves on to `authenticate/authenticate-passkey` with the same `#` part. |
| `assets/glass.css` | The shared "Liquid Glass" look of every page. |
| `test/authenticate/prf_test.html` | A test page: does a passkey give the same PRF answer every time? Nothing is sent anywhere. |

## Where the source lives

Everything except `test/` comes from `src/SStudio/utils/crypto/web/` in SStudio: change it there, then copy
it here with the same paths. `test/` lives only in this repository.

Never delete this repository or the `S-Studio-HQ` organization: the passkeys are tied to this name.
