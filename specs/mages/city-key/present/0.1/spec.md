---
slug: mages/city-key/present
version: "0.1"
title: City Key — Present
summary: A bearer presents their City Key, with any packets and chain faces it claims, to a Mages City reader; the reader re-derives what it can and answers with one of four states per claim, never a permission.
status: draft
targetFrameworkVersion: "0.6.0"
category: credentials
keywords:
  - mages-city
  - city-key
  - kappa
  - verification
  - evidence
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Bearer (holder of the City Key)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: City reader (Mages City, or any site that reads City Keys)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: RECOMMENDED
  rationale: >-
    The key is self-certifying by hash: its κ is the hash of its own canonical
    form, its packets fold into the root it states, and its DID is derived from
    the public key it carries. A request signature adds only that the bearer
    holds the card key, which the reader does not need to check what the key
    claims. A signed response lets the bearer carry the reader's determination
    to someone else.
issuedAtRequirement:
  requirement: RECOMMENDED
  rationale: >-
    Verification changes nothing at the reader; the framework baseline is enough
    to place the determination in time.
sideEffects:
  level: none
  rationale: >-
    The reader re-derives hashes and answers. It records nothing and grants
    nothing; a seat, a rung or a membership is decided under its own task, which
    may cite this determination.
exposure:
  discloses: metadata
  ingests: personal
  actsAsSubject: false
  rationale: >-
    A City Key describes one person's journey: a public key, a DID, the pages
    walked, the packets sealed or revealed, the lattice vertices lit. That is
    data about an identifiable person once the key is tied to them, so the
    request is `personal`. The response is a determination over that data, the
    re-derived hashes and the list of claims left unchecked.
retention:
  class: transient
  rationale: >-
    The reader needs the key only while it re-derives it. What it shows the
    bearer afterwards is computed from the key the bearer still holds.
maxDocumentBytes:
  request: 3145728
  rationale: >-
    The readers accept a key file of at most 2 MiB of JSON (the largest key
    seen on 17 November 2026 was 1.14 MiB); packets and faces ride beside it.
    3 MiB holds a full key with its sidecars.
errorCodes: []
related:
  - mages/artefact/present
  - mages/constellation/commit
  - vtc/join-requests/submit
---

## Abstract

A **City Key** (record kind `agentprivacy.vta/1`) is the journey a bearer
carries between agentprivacy.ai, spellweb, soulbis.com and Mages City: their
card key, their DID, the walks they took, the packets they sealed, and, beside
it, the faces of the evidence chains their stars sit on. Every claim in it is a
hash commitment. **City Key — Present** is the bearer handing the key to a
reader, and the reader saying, claim by claim, what it could re-derive.

The answer has four states, kept apart on purpose: `match`, `mismatch`,
`absent` (nothing was claimed) and `unavailable` (a claim was made but the
material to check it was not given). Collapsing `unavailable` into `match` is
how an unchecked claim comes to read as a checked one.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*
([SPEC §6.5](/SPEC.md#65-private-and-unpublished-trust-task-specifications)),
published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family.
It describes `verifyKey` in `mages_city/gate/citykey.mjs` and its browser twin
in `site/record.js` as of 17 November 2026; neither accepts the document form
yet. The schema **MAY** change without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the bearer's browser or extension) **MUST** emit a
*Trust Task document* whose `type` is
`https://tasks.mages.city/spec/mages/city-key/present/0.1`, with `issuer`
set to the key's participant id (`ap-` and the first 16 hex characters of
`identity.publicKeyHex`) or its `did`, and `payload.key` set to the key exactly
as exported. A producer **MUST NOT** re-stamp `kappa` before presenting.

A conforming **consumer** (the reader) **MUST** perform every check below that
its inputs allow, set each state as defined, and answer with a `#response`. A
key that fails a check is a successful verification with `ok: false`, not an
error.

### Verification

1. **κ.** `kappa = "sha256:" + hex(sha256(canonical(key without kappa)))`, where *canonical* sorts object keys recursively, writes no whitespace and drops undefined members (Law L5). State `absent` when the key carries no `kappa` (a working key never exported).
2. **Packet proofs.** For each packet given, `proof = "sha256:" + hex(sha256(canonical(packet without proof)))`. State `absent` when no packets are given.
3. **Packets root.** Where the key states `packets.root`, the pairwise fold of the sorted packet proofs (`sha256(a + "|" + b)`, an odd one carried up) equals it and the count agrees. State `unavailable` when the key states a root but no packets are given.
4. **DID.** Where the key states `did`, it is the `did:key` (ed25519 multicodec `0xed01`, base58btc) of `identity.publicKeyHex`. State `unavailable` when the key carries a DID but no public key.
5. **Hold.** Where the key declares `holds`, the state is always `unavailable`: the held items never reach the City, so the root is declared, not re-derived.
6. **Chain faces.** Where the key states `chains` and `payload.faces` is given, every face's root re-derives over `"<vertex>|<root κ>"` items (and its trace, where carried), the count agrees, and the fold of the face roots equals `chains.root`. State `unavailable` when no faces are given.

`ok` is true when no state is `mismatch`. **`ok` means nothing was
contradicted, not that everything was checked.** A consumer **MUST** branch on
`states` and `unverified`, and **MUST NOT** turn `ok` into a permission.

## Definitions

- **City Key** — the bearer's exported journey record, kind `agentprivacy.vta/1`. Its own schema is owned by agentprivacy-mcp (`lib/journey.mjs`); this specification fixes only the members it checks.
- **Packet** — a sealed, revealed or refractive record the key folds by proof.
- **Chain face** — one lattice face's commitment to public evidence-chain roots (`agentprivacy.chain-faces/1`).

## Request

A bearer presents an exported key with no packets and no faces given.

```json
{
  "id": "urn:uuid:4f2a9c61-0d8e-4b37-a1f5-9e3c7b2d6a10",
  "type": "https://tasks.mages.city/spec/mages/city-key/present/0.1",
  "issuer": "ap-3fa29c0d1b7e4a55",
  "recipient": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "issuedAt": "2026-11-17T10:00:00Z",
  "payload": {
    "key": {
      "kind": "agentprivacy.vta/1",
      "kappa": "sha256:6e1d0c4b9a3f27e58d1c0b6a4f9e2d7c3b5a1e8f0d6c4b2a9e7f5d3c1b0a8e6f",
      "did": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "identity": { "publicKeyHex": "3fa29c0d1b7e4a5582c6d0e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9", "trustTier": "light" },
      "packets": { "root": "sha256:9b2e4d6f8a0c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b", "count": 12 }
    }
  }
}
```

## Response

κ re-derived; the packets root is `unavailable` because no packets were given;
the DID did not match the public key in this example.

```json
{
  "id": "urn:uuid:a3c0e5b7-2d4f-4e61-8b9a-0c1d2e3f4a5b",
  "type": "https://tasks.mages.city/spec/mages/city-key/present/0.1#response",
  "threadId": "urn:uuid:4f2a9c61-0d8e-4b37-a1f5-9e3c7b2d6a10",
  "issuer": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "recipient": "ap-3fa29c0d1b7e4a55",
  "issuedAt": "2026-11-17T10:00:01Z",
  "payload": {
    "ok": false,
    "states": { "kappa": "match", "packetProofs": "absent", "packetsRoot": "unavailable", "did": "mismatch", "holds": "absent", "chains": "absent" },
    "unverified": ["packetProofs", "packetsRoot", "holds", "chains"],
    "participantId": "ap-3fa29c0d1b7e4a55"
  }
}
```

## Security & Privacy

### Data carried

The whole key: a public key, a DID, the walks and packets the bearer chose to
fold in, the vertices lit. Sealed packets carry ciphertext and proofs only.
The key carries no name or contact detail unless the bearer wrote one into a
revealed packet. A bearer **SHOULD** present a key to readers they chose, and
a reader **MUST NOT** ask for packets or faces the bearer did not offer.

### Correlation

The bearer's identifier is the key's participant id or DID. It is pairwise in
intent (minted for the City relationship), but the key is a long-lived record
and every reader it is shown to sees the same identifier, so presentations to
two readers are joinable. A bearer who wants unlinkable presentations needs a
different mechanism (a Hold disclosure, out of scope here). The reader's
identifier scope is `public` so that the determination is evidence the bearer
can carry: a third party must be able to see which reader made it, and a
pairwise reader identifier would hide that without protecting anyone, the
reader being a public party.

### Retention

`transient`. The reader keeps nothing of the key after answering. The farm
gate that reads keys for the Namekeeper keeps its own record under its own
task.

### Consent/purpose

The bearer presents the key to have its claims checked and shown back to them.
A reader **MUST NOT** use a presentation to build a register of keys, nor read
a determination as a grant: rungs, seats and membership need their own
evidence (vouches, membership, witness credentials), which this task does not
verify.
