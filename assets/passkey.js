// The script of SStudio's passkey page, authenticate/passkey.html (read that page's comment first).
// Key and Mode must stay PageKey and PageMode of browser_passkey.py - tests/utils/crypto/test_browser_passkey.py
// checks they match.
"use strict";

const Key = { Mode: "m", Port: "port", Token: "t", CredentialId: "id", PrfInput: "p", UserId: "uid",
  UserName: "u", DisplayName: "d", Prf: "prf", PrfEnabled: "prfEnabled", Error: "error", Way: "way" };
const Mode = { Create: "create", Ask: "ask" };
const Way = { Fetch: "fetch", Form: "form" };
// Where the passkey is: on this device, or on a phone found by a QR code (the browser's "hybrid" way)
const Device = { Here: "here", Phone: "phone" };
// What this device is, from the browser's user agent: it names the first button
const System = { Mac: "mac", Windows: "windows", Phone: "phone", Other: "other" };
const Text = {
  CreateTitle: "Create your SStudio passkey",
  CreateHelp: "Where should the passkey be saved? It replaces typing the backup key.",
  AskTitle: "Confirm with your passkey",
  AskHelp: "Where is your passkey?",
  HereTitle: { mac: "This Mac", windows: "This PC", phone: "This phone", other: "This device" },
  HereNote: { mac: "Touch ID", windows: "Windows Hello", phone: "Face ID", other: "This device's own passkey" },
  CreateHereTitle: { mac: "Save on this Mac", windows: "Save on this PC", phone: "Save on this phone",
    other: "Save on this device" },
  CreateHereNote: { mac: "Touch ID - iCloud Keychain gives it to your iPhone too", windows: "Windows Hello",
    phone: "Face ID", other: "This device's own passkey" },
  PhoneTitle: "iPhone",
  PhoneNote: "Scan a QR code - Bluetooth on at both",
  CreatePhoneTitle: "Save on your iPhone",
  CreatePhoneNote: "Scan a QR code - Bluetooth on at both",
  Ready: "Waiting for you.",
  Asking: "Waiting for the passkey...",
  Sending: "Sending the answer to SStudio on this computer... If the browser asks to reach apps on this device, " +
    "choose Allow.",
  Done: "Done - SStudio has the answer. You can close this tab.",
  Cancelled: "Cancelled - SStudio asks for the backup key instead. You can close this tab.",
  BadRequest: "This page must be opened by SStudio (the address is missing what it needs).",
  NoPasskeys: "This browser does not support passkeys.",
  Cancel: "Cancelled",
  RpName: "SStudio",
};

const vStatus = document.getElementById("status");
const vHere = document.getElementById("btnHere");
const vPhone = document.getElementById("btnPhone");
const vCancel = document.getElementById("btnCancel");
const vRequest = ReadRequest();
history.replaceState(null, "", location.pathname);  // the token leaves the address bar and the history
// A new request in a tab already on this page changes only the "#" part, which doesn't load the page again
window.addEventListener("hashchange", () => location.reload());

function Show(Message, State) {
  vStatus.textContent = Message;
  vStatus.classList.toggle("good", State === "good");
  vStatus.classList.toggle("bad", State === "bad");
}
// Browsers let a page close only a tab a script opened; where they refuse, the "Done" text stays.
function CloseSoon() { setTimeout(() => window.close(), 1500); }
function ToB64Url(Buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(Buffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function FromB64Url(Text) {
  const strB64 = Text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((Text.length + 3) % 4);
  return Uint8Array.from(atob(strB64), _ => _.charCodeAt(0));
}

function ThisSystem() {
  const strAgent = navigator.userAgent;
  // An iPad asks for the desktop site and says "Macintosh"; its touch screen gives it away
  const bolTouchMac = /Macintosh/.test(strAgent) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|Android/.test(strAgent) || bolTouchMac) return System.Phone;
  if (/Macintosh|Mac OS X/.test(strAgent)) return System.Mac;
  if (/Windows/.test(strAgent)) return System.Windows;
  return System.Other;
}

function ReadRequest() {
  const vParams = new URLSearchParams(location.hash.slice(1));
  const intPort = Number(vParams.get(Key.Port));
  const vRequest = Object.fromEntries(vParams.entries());
  const bolMode = vRequest[Key.Mode] === Mode.Create || vRequest[Key.Mode] === Mode.Ask;
  const bolPort = Number.isInteger(intPort) && intPort >= 1024 && intPort <= 65535;
  const bolAsk = vRequest[Key.Mode] !== Mode.Ask || (vRequest[Key.CredentialId] && vRequest[Key.PrfInput]);
  const bolCreate = vRequest[Key.Mode] !== Mode.Create || (vRequest[Key.UserId] && vRequest[Key.UserName]);
  return bolMode && bolPort && vRequest[Key.Token] && bolAsk && bolCreate ? vRequest : null;
}

async function Create(Where) {
  const vCredential = await navigator.credentials.create({ publicKey: {
    rp: { id: location.hostname, name: Text.RpName },
    user: { id: FromB64Url(vRequest[Key.UserId]), name: vRequest[Key.UserName],
      displayName: vRequest[Key.DisplayName] || vRequest[Key.UserName] },
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
    authenticatorSelection: { residentKey: "required", userVerification: "required",
      authenticatorAttachment: Where === Device.Here ? "platform" : "cross-platform" },
    hints: [Where === Device.Here ? "client-device" : "hybrid"],
    extensions: { prf: {} },
  } });
  const vPrf = vCredential.getClientExtensionResults().prf;
  return { [Key.CredentialId]: ToB64Url(vCredential.rawId), [Key.PrfEnabled]: String(!!(vPrf && vPrf.enabled)) };
}

async function Ask(Where) {
  const vAssertion = await navigator.credentials.get({ publicKey: {
    rpId: location.hostname,
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [{ type: "public-key", id: FromB64Url(vRequest[Key.CredentialId]),
      transports: Where === Device.Here ? ["internal"] : ["hybrid"] }],
    hints: [Where === Device.Here ? "client-device" : "hybrid"],
    userVerification: "required",
    extensions: { prf: { eval: { first: FromB64Url(vRequest[Key.PrfInput]) } } },
  } });
  const vPrf = vAssertion.getClientExtensionResults().prf;
  const vFirst = vPrf && vPrf.results && vPrf.results.first;
  return { [Key.CredentialId]: ToB64Url(vAssertion.rawId), [Key.Prf]: vFirst ? ToB64Url(vFirst) : "" };
}

async function Send(Answer) {
  const strUrl = "http://127.0.0.1:" + vRequest[Key.Port] + "/answer";
  const vAnswer = { ...Answer, [Key.Token]: vRequest[Key.Token] };
  try {
    const vReply = await fetch(strUrl, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...vAnswer, [Key.Way]: Way.Fetch }), cache: "no-store", referrerPolicy: "no-referrer" });
    if (vReply.ok) return true;
  } catch (vError) { /* the browser refused the fetch: send it by a form post instead */ }
  const vForm = document.createElement("form");
  vForm.method = "POST";
  vForm.action = strUrl;
  for (const [i, j] of Object.entries({ ...vAnswer, [Key.Way]: Way.Form })) {
    const vInput = document.createElement("input");
    vInput.type = "hidden";
    vInput.name = i;
    vInput.value = j;
    vForm.appendChild(vInput);
  }
  document.body.appendChild(vForm);
  vForm.submit();  // the browser shows SStudio's own "Done" page
  return false;
}

function Lock() { vHere.disabled = vPhone.disabled = vCancel.disabled = true; }

async function Go(Where) {
  Lock();
  let vAnswer;
  try {
    Show(Text.Asking);
    vAnswer = vRequest[Key.Mode] === Mode.Create ? await Create(Where) : await Ask(Where);
  } catch (vError) {
    vAnswer = { [Key.Error]: vError.name || String(vError) };
  }
  Show(Text.Sending);
  if (!(await Send(vAnswer))) return;
  Show(vAnswer[Key.Error] ? Text.Cancelled : Text.Done, vAnswer[Key.Error] ? "bad" : "good");
  CloseSoon();
}

async function Cancel() {
  Lock();
  if (!(await Send({ [Key.Error]: Text.Cancel }))) return;
  Show(Text.Cancelled, "bad");
  CloseSoon();
}

function Prepare() {
  const bolCreate = vRequest[Key.Mode] === Mode.Create;
  const strSystem = ThisSystem();
  document.getElementById("title").textContent = bolCreate ? Text.CreateTitle : Text.AskTitle;
  document.getElementById("help").textContent = bolCreate ? Text.CreateHelp : Text.AskHelp;
  document.getElementById("hereTitle").textContent = (bolCreate ? Text.CreateHereTitle : Text.HereTitle)[strSystem];
  document.getElementById("hereNote").textContent = (bolCreate ? Text.CreateHereNote : Text.HereNote)[strSystem];
  document.getElementById("phoneTitle").textContent = bolCreate ? Text.CreatePhoneTitle : Text.PhoneTitle;
  document.getElementById("phoneNote").textContent = bolCreate ? Text.CreatePhoneNote : Text.PhoneNote;
  // On a phone the passkey is right here: no QR code to scan
  // An <svg> has no .hidden property, so the icons set the attribute
  document.getElementById("iconComputer").toggleAttribute("hidden", strSystem === System.Phone);
  document.getElementById("iconPhoneHere").toggleAttribute("hidden", strSystem !== System.Phone);
  vHere.hidden = vCancel.hidden = false;
  vPhone.hidden = strSystem === System.Phone;
  vHere.addEventListener("click", () => Go(Device.Here));
  vPhone.addEventListener("click", () => Go(Device.Phone));
  vCancel.addEventListener("click", Cancel);
  Show(Text.Ready);
}

if (!vRequest) Show(Text.BadRequest, "bad");
else if (!window.PublicKeyCredential) { Show(Text.NoPasskeys, "bad"); Send({ [Key.Error]: Text.NoPasskeys }); }
else Prepare();
