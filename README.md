# s-studio-hq.github.io

The web home of SStudio's passkeys: `s-studio-hq.github.io` is the relying party ID of every SStudio passkey.

**Do not change this repository directly.** Its source is `site/` in SStudio: change it there, then run
`python scripts/publish_site.py` in SStudio, which makes this repository the same as `site/`.

## Layout

| Path                                                     | What it is                                                                                                                                                                                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                                             | The home page: what this site is for.                                                                                                                                                                                                        |
| `authenticate/passkey.html`                              | SStudio's passkey page. SStudio opens it to make a passkey or ask it for its PRF answer; the page finds out by itself whether it runs on a Mac, Windows or a phone, and sends the answer only to SStudio on the same computer (`127.0.0.1`). |
| `assets/passkey.js`                                      | The passkey page's script.                                                                                                                                                                                                                   |
| `assets/glass.css`                                       | The shared "Liquid Glass" look of every page.                                                                                                                                                                                                |
| `assets/favicon.svg`                                     | The icon in the browser tab.                                                                                                                                                                                                                 |
| `passkey.html`, `authenticate/authenticate-passkey.html` | Old addresses of the passkey page: they move on to `authenticate/passkey` with the same `#` part. Each says when it can be deleted.                                                                                                          |
| `404.html`                                               | The page for an address the site doesn't have.                                                                                                                                                                                               |
| `robots.txt`                                             | Asks search engines to stay away.                                                                                                                                                                                                            |

Never delete this repository or the `S-Studio-HQ` organization: the passkeys are tied to this name.
