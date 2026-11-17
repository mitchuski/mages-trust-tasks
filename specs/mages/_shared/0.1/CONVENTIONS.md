# mages family: shared conventions (0.1)

Definitions every `mages/*` specification uses. Not a specification: nothing has this as its `type`.

## Trust tasks and intents

Ruling, 2026-11-17: **an act that never leaves the device is not a Trust Task; it is an intent.**

A Trust Task has a recipient that acts on it: appends, verifies, answers, refuses. An **intent** is something a
person does on their own device (a thumbs up held in the browser, a proverb written, a note sealed, a gate
opened) that no one else receives. An intent is kept as a small document so it can be hashed and, later, opened:

```json
{ "id": "urn:uuid:…", "intent": "https://tasks.mages.city/intents/<name>/0.1", "issuedAt": "…", "payload": { … } }
```

It carries no `issuer`, `recipient` or `proof` and is never sent. Its **leaf**, the hash below, is what can
leave, and only inside a Trust Task that carries it (`mages/constellation/commit`, `mages/island/stone`). An
intent becomes evidence when its holder reveals the document to a verifier, who recomputes the leaf.

The same act can be an intent on one surface and a task on another: a thumbs up held on agentprivacy.ai is the
intent `thumb`; a thumbs up sent to the Hitchhiker's Guide, which appends it to its chain, is the task
`mages/presence/thumb`.

### Intent vocabulary (0.1)

| intent | surface | held as |
|---|---|---|
| `thumb` | agentprivacy.ai | a page path |
| `proverb` | agentprivacy.ai (✍️), spellbook inscription | the text, sealed on the device |
| `promise-make`, `promise-keep` | agentprivacy.ai (🤝) | the promise, sealed |
| `note`, `record` | agentprivacy.ai vault | sealed note, sealed voice record |
| `guide-walk`, `island-quest` | agentprivacy.ai guide, Drake Island | the path walked |
| `artefact-forge`, `spell-cast`, `constellation-trace` | spellweb | the ceremony's own record |
| `gate-open`, `orb-unlock` | guide gatehouse, agentprivacy.ai orb | nothing kept but the fact; the key never leaves |
| `voice-seal` | HH guide (before any share) | the sealed box; only its hash goes on the chain, inside the task that sends it |

Star types on the stars chain (`thumb/up`, `proverb/write`, …) name these intents in the chain's own spelling.

## Mark

`sha256("mark|" + secret)`, 64 lowercase hex, where `secret` is 24 random bytes held only on the device. It
identifies one device's relationship with one site and nothing else, and it is the `issuer` of a mages task sent
before joining. Control of it is not provable on the wire without revealing the secret, which is why tasks sent
under a mark carry no proof.

## Leaf

The hash of an intent. **Leaf v2:** lowercase hex `sha256(JCS(intent document))` (RFC 8785). The document's random
`id` blinds it: without the `id`, a leaf over a page path and a time could be recovered by guessing. **Leaf v1**
(stars made before these conventions) hashes `JSON.stringify({type, content, at})` and keeps verifying under that
rule.

## Moon

A lunar season, `moon-YYYY-MM-DD` after the UTC date of its new moon, computed from the mean synodic month
(29.530588853 days) counted from the new moon of 2000-01-06T18:14Z. An intent's moon is the moon containing its
`issuedAt`.

## Identifiers in the examples

| identifier | who | state on 2026-11-17 |
|---|---|---|
| `did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc` | Mages City, the community (its VTC) | **real**: its log resolves at `https://dids.mages.city/vtc/did.jsonl` |
| `did:web:trust.mages.city` | the Hitchhiker's Guide, served at `trust.mages.city` | illustrative: the guide publishes no DID yet |
| `did:web:trust.mages.city:keeper` | the guide's keeper | illustrative |
| `did:web:agentprivacy.ai:stars` | the stars chain | illustrative: the stars Worker is not deployed |
| `did:web:mages.city:formal-mage` | a mage sealing a scroll | illustrative: a mage's own DID goes here |
| 64 hex characters | a visitor's mark | the real form; the values shown are examples |
| `did:key:z6Mk…` | a member who has joined | the shape of a member DID; the value shown is the did:key specification's own example |

An illustrative identifier is replaced by the service's own DID when the service publishes one; the specification
does not change, since parties are compared by exact string equality whatever their method.
